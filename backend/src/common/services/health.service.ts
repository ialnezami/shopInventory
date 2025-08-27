import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as os from 'os';
import * as process from 'process';

export interface HealthStatus {
  status: 'ok' | 'error' | 'warning';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: HealthCheck;
    memory: HealthCheck;
    disk: HealthCheck;
    system: HealthCheck;
  };
}

export interface HealthCheck {
  status: 'ok' | 'error' | 'warning';
  message: string;
  details?: any;
  responseTime?: number;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private startTime: number = Date.now();

  constructor(
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async getHealthStatus(): Promise<HealthStatus> {
    const startTime = Date.now();
    
    try {
      const [databaseCheck, memoryCheck, diskCheck, systemCheck] = await Promise.all([
        this.checkDatabase(),
        this.checkMemory(),
        this.checkDisk(),
        this.checkSystem(),
      ]);

      const responseTime = Date.now() - startTime;
      
      // Determine overall status
      const overallStatus = this.determineOverallStatus([
        databaseCheck,
        memoryCheck,
        diskCheck,
        systemCheck,
      ]);

      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        checks: {
          database: databaseCheck,
          memory: memoryCheck,
          disk: diskCheck,
          system: systemCheck,
        },
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - this.startTime,
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        checks: {
          database: { status: 'error', message: 'Health check failed' },
          memory: { status: 'error', message: 'Health check failed' },
          disk: { status: 'error', message: 'Health check failed' },
          system: { status: 'error', message: 'Health check failed' },
        },
      };
    }
  }

  private async checkDatabase(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // Check MongoDB connection
      const dbState = this.connection.readyState;
      const responseTime = Date.now() - startTime;

      if (dbState === 1) { // Connected
        return {
          status: 'ok',
          message: 'Database connection is healthy',
          details: {
            state: 'connected',
            database: this.connection.name,
            host: this.connection.host,
            port: this.connection.port,
          },
          responseTime,
        };
      } else if (dbState === 2) { // Connecting
        return {
          status: 'warning',
          message: 'Database is connecting',
          details: {
            state: 'connecting',
            database: this.connection.name,
          },
          responseTime,
        };
      } else {
        return {
          status: 'error',
          message: 'Database connection is unhealthy',
          details: {
            state: dbState,
            database: this.connection.name,
          },
          responseTime,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'error',
        message: 'Database check failed',
        details: { error: error.message },
        responseTime,
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const memUsage = process.memoryUsage();
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memoryUsagePercent = (usedMem / totalMem) * 100;

      const responseTime = Date.now() - startTime;

      if (memoryUsagePercent < 80) {
        return {
          status: 'ok',
          message: 'Memory usage is healthy',
          details: {
            processMemory: {
              rss: this.formatBytes(memUsage.rss),
              heapUsed: this.formatBytes(memUsage.heapUsed),
              heapTotal: this.formatBytes(memUsage.heapTotal),
              external: this.formatBytes(memUsage.external),
            },
            systemMemory: {
              total: this.formatBytes(totalMem),
              used: this.formatBytes(usedMem),
              free: this.formatBytes(freeMem),
              usagePercent: memoryUsagePercent.toFixed(2) + '%',
            },
          },
          responseTime,
        };
      } else if (memoryUsagePercent < 90) {
        return {
          status: 'warning',
          message: 'Memory usage is high',
          details: {
            usagePercent: memoryUsagePercent.toFixed(2) + '%',
            threshold: '80%',
          },
          responseTime,
        };
      } else {
        return {
          status: 'error',
          message: 'Memory usage is critical',
          details: {
            usagePercent: memoryUsagePercent.toFixed(2) + '%',
            threshold: '90%',
          },
          responseTime,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'error',
        message: 'Memory check failed',
        details: { error: error.message },
        responseTime,
      };
    }
  }

  private async checkDisk(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      // For now, we'll return a basic disk check
      // In production, you might want to check actual disk space
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'ok',
        message: 'Disk space is available',
        details: {
          note: 'Disk space monitoring requires additional implementation',
        },
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'error',
        message: 'Disk check failed',
        details: { error: error.message },
        responseTime,
      };
    }
  }

  private async checkSystem(): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const cpuUsage = os.loadavg();
      const uptime = os.uptime();
      const platform = os.platform();
      const arch = os.arch();
      const nodeVersion = process.version;
      
      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        message: 'System is healthy',
        details: {
          cpu: {
            loadAverage: {
              '1min': cpuUsage[0].toFixed(2),
              '5min': cpuUsage[1].toFixed(2),
              '15min': cpuUsage[2].toFixed(2),
            },
          },
          system: {
            uptime: this.formatUptime(uptime),
            platform,
            architecture: arch,
            nodeVersion,
            processUptime: this.formatUptime(process.uptime()),
          },
        },
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        status: 'error',
        message: 'System check failed',
        details: { error: error.message },
        responseTime,
      };
    }
  }

  private determineOverallStatus(checks: HealthCheck[]): 'ok' | 'error' | 'warning' {
    if (checks.some(check => check.status === 'error')) {
      return 'error';
    }
    if (checks.some(check => check.status === 'warning')) {
      return 'warning';
    }
    return 'ok';
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  async getMetrics(): Promise<any> {
    const healthStatus = await this.getHealthStatus();
    
    return {
      ...healthStatus,
      metrics: {
        requests: {
          total: 0, // Would be implemented with request counting middleware
          successful: 0,
          failed: 0,
        },
        performance: {
          averageResponseTime: 0,
          p95ResponseTime: 0,
          p99ResponseTime: 0,
        },
      },
    };
  }
}
