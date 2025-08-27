import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { FileUploadService } from './file-upload.service';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('FileUploadService', () => {
  let service: FileUploadService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockFile = {
    originalname: 'test-image.jpg',
    size: 1024 * 1024, // 1MB
    buffer: Buffer.from('test image data'),
    mimetype: 'image/jpeg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileUploadService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<FileUploadService>(FileUploadService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    it('should upload a valid file successfully', async () => {
      // Mock path.extname to return a valid extension
      (path.extname as jest.Mock).mockReturnValue('.jpg');
      
      // Mock fs.existsSync to return false (directory doesn't exist)
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      // Mock fs.mkdirSync
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
      
      // Mock fs.writeFileSync
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      
      // Mock path.join
      (path.join as jest.Mock).mockReturnValue('/test/path');

      const result = await service.uploadFile(mockFile as any);

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should throw error for invalid file type', async () => {
      const invalidFile = {
        ...mockFile,
        originalname: 'test.txt',
      };

      // Mock path.extname to return .txt
      (path.extname as jest.Mock).mockReturnValue('.txt');

      await expect(service.uploadFile(invalidFile as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error for file too large', async () => {
      const largeFile = {
        ...mockFile,
        size: 10 * 1024 * 1024, // 10MB
      };

      // Mock path.extname to return .jpg
      (path.extname as jest.Mock).mockReturnValue('.jpg');

      await expect(service.uploadFile(largeFile as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
      (path.join as jest.Mock).mockReturnValue('/test/path');

      await expect(service.deleteFile('test-file.jpg')).resolves.not.toThrow();
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should handle file not found gracefully', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (path.join as jest.Mock).mockReturnValue('/test/path');

      // Clear any previous calls to unlinkSync
      (fs.unlinkSync as jest.Mock).mockClear();

      await expect(service.deleteFile('non-existent.jpg')).resolves.not.toThrow();
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('getFileUrl', () => {
    it('should return correct file URL', () => {
      const filename = 'test-image.jpg';
      const expectedUrl = '/uploads/test-image.jpg';

      const result = service.getFileUrl(filename);

      expect(result).toBe(expectedUrl);
    });
  });
});
