import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from '../services/file-upload.service';

describe('FileUploadController', () => {
  let controller: FileUploadController;
  let fileUploadService: FileUploadService;

  const mockFileUploadService = {
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    getFileUrl: jest.fn(),
  };

  const mockFile = {
    originalname: 'test-image.jpg',
    size: 1024 * 1024,
    buffer: Buffer.from('test'),
    mimetype: 'image/jpeg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileUploadController],
      providers: [
        {
          provide: FileUploadService,
          useValue: mockFileUploadService,
        },
      ],
    }).compile();

    controller = module.get<FileUploadController>(FileUploadController);
    fileUploadService = module.get<FileUploadService>(FileUploadService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const filename = 'test-123.jpg';
      const fileUrl = '/uploads/test-123.jpg';

      mockFileUploadService.uploadFile.mockResolvedValue(filename);
      mockFileUploadService.getFileUrl.mockReturnValue(fileUrl);

      const result = await controller.uploadImage(mockFile as any);

      expect(result).toEqual({
        message: 'File uploaded successfully',
        filename,
        fileUrl,
        size: mockFile.size,
        mimetype: mockFile.mimetype,
      });
      expect(fileUploadService.uploadFile).toHaveBeenCalledWith(mockFile);
    });

    it('should throw error when no file provided', async () => {
      await expect(controller.uploadImage(undefined)).rejects.toThrow(
        BadRequestException,
      );
      expect(fileUploadService.uploadFile).not.toHaveBeenCalled();
    });
  });

  describe('deleteImage', () => {
    it('should delete image successfully', async () => {
      const filename = 'test-image.jpg';
      mockFileUploadService.deleteFile.mockResolvedValue(undefined);

      const result = await controller.deleteImage(filename);

      expect(result).toEqual({ message: 'File deleted successfully' });
      expect(fileUploadService.deleteFile).toHaveBeenCalledWith(filename);
    });
  });
});
