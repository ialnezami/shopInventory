import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileUploadConfig } from '../../config/file-upload.config';

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name);

  constructor(private configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      // Validate file type
      if (!this.isValidFileType(file.originalname)) {
        throw new BadRequestException('Invalid file type');
      }

      // Validate file size
      if (file.size > fileUploadConfig.maxFileSize) {
        throw new BadRequestException('File size too large');
      }

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), fileUploadConfig.uploadDest);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const filename = `${timestamp}-${randomString}${fileExtension}`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      fs.writeFileSync(filepath, file.buffer);

      this.logger.log(`📁 File uploaded successfully: ${filename}`);

      // Return the file path relative to uploads directory
      return filename;
    } catch (error) {
      this.logger.error('❌ File upload failed:', error);
      throw error;
    }
  }

  async deleteFile(filename: string): Promise<void> {
    try {
      const filepath = path.join(process.cwd(), fileUploadConfig.uploadDest, filename);
      
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        this.logger.log(`🗑️ File deleted successfully: ${filename}`);
      }
    } catch (error) {
      this.logger.error('❌ File deletion failed:', error);
      throw error;
    }
  }

  private isValidFileType(filename: string): boolean {
    const extension = path.extname(filename).toLowerCase().substring(1);
    return fileUploadConfig.allowedFileTypes.includes(extension);
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}
