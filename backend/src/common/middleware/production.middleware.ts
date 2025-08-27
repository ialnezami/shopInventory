import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as helmet from 'helmet';
import * as compression from 'compression';
import * as rateLimit from 'express-rate-limit';

@Injectable()
export class ProductionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProductionMiddleware.name);
  private helmetMiddleware: any;
  private compressionMiddleware: any;
  private rateLimitMiddleware: any;

  constructor() {
    this.initializeMiddleware();
  }

  private initializeMiddleware() {
    // Initialize Helmet for security headers
    this.helmetMiddleware = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    });

    // Initialize compression middleware
    this.compressionMiddleware = compression({
      level: 6,
      threshold: 1024,
      filter: (req: Request, res: Response) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
    });

    // Initialize rate limiting
    this.rateLimitMiddleware = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(15 * 60 / 1000), // seconds
      },
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: Request) => {
        // Skip rate limiting for health checks and static files
        return req.path.startsWith('/health') || 
               req.path.startsWith('/uploads') ||
               req.path.startsWith('/invoices');
      },
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const originalSend = res.send;

    // Add request ID for tracking
    req['requestId'] = this.generateRequestId();

    // Log incoming request
    this.logger.log(`📥 ${req.method} ${req.path} - ${req.ip} [${req['requestId']}]`);

    // Override res.send to log response time
    res.send = function(body: any) {
      const responseTime = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      // Log response
      if (statusCode >= 400) {
        this.logger.warn(`📤 ${req.method} ${req.path} - ${statusCode} (${responseTime}ms) [${req['requestId']}]`);
      } else {
        this.logger.log(`📤 ${req.method} ${req.path} - ${statusCode} (${responseTime}ms) [${req['requestId']}]`);
      }

      // Add response time header
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.setHeader('X-Request-ID', req['requestId']);

      return originalSend.call(this, body);
    }.bind(this);

    // Apply security middleware
    this.helmetMiddleware(req, res, (err: any) => {
      if (err) {
        this.logger.error('Helmet middleware error:', err);
        return next(err);
      }

      // Apply compression middleware
      this.compressionMiddleware(req, res, (err: any) => {
        if (err) {
          this.logger.error('Compression middleware error:', err);
          return next(err);
        }

        // Apply rate limiting
        this.rateLimitMiddleware(req, res, (err: any) => {
          if (err) {
            this.logger.error('Rate limit middleware error:', err);
            return next(err);
          }

          // Add security headers
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-XSS-Protection', '1; mode=block');
          res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

          next();
        });
      });
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
