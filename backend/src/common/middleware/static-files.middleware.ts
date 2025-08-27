import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class StaticFilesMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.url.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'uploads', req.url.replace('/uploads/', ''));
      
      // Check if file exists
      if (fs.existsSync(filePath)) {
        // Set appropriate headers
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
        };
        
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
        
        // Stream the file
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        return;
      }
    }
    
    next();
  }
}
