import { Test, TestingModule } from '@nestjs/testing';
import { StaticFilesMiddleware } from './static-files.middleware';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs');
jest.mock('path');

describe('StaticFilesMiddleware', () => {
  let middleware: StaticFilesMiddleware;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StaticFilesMiddleware],
    }).compile();

    middleware = module.get<StaticFilesMiddleware>(StaticFilesMiddleware);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should serve static files for uploads path', () => {
    const mockRequest = {
      url: '/uploads/test-image.jpg',
    } as Request;

    const mockResponse = {
      setHeader: jest.fn(),
      pipe: jest.fn(),
    } as any;

    const mockNext = jest.fn() as NextFunction;

    // Mock fs.existsSync to return true (file exists)
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    // Mock path.join
    (path.join as jest.Mock).mockReturnValue('/test/uploads/test-image.jpg');
    
    // Mock path.extname to return .jpg
    (path.extname as jest.Mock).mockReturnValue('.jpg');
    
    // Mock fs.createReadStream
    const mockStream = {
      pipe: jest.fn().mockReturnThis(),
    };
    (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

    middleware.use(mockRequest, mockResponse, mockNext);

    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.createReadStream).toHaveBeenCalled();
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=31536000');
    expect(mockStream.pipe).toHaveBeenCalledWith(mockResponse);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should call next for non-uploads paths', () => {
    const mockRequest = {
      url: '/api/products',
    } as Request;

    const mockResponse = {} as Response;
    const mockNext = jest.fn() as NextFunction;

    middleware.use(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should call next when file does not exist', () => {
    const mockRequest = {
      url: '/uploads/non-existent.jpg',
    } as Request;

    const mockResponse = {} as Response;
    const mockNext = jest.fn() as NextFunction;

    // Mock fs.existsSync to return false (file doesn't exist)
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (path.join as jest.Mock).mockReturnValue('/test/uploads/non-existent.jpg');

    middleware.use(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it('should set correct content type for different file extensions', () => {
    const testCases = [
      { url: '/uploads/test.jpg', expectedType: 'image/jpeg' },
      { url: '/uploads/test.jpeg', expectedType: 'image/jpeg' },
      { url: '/uploads/test.png', expectedType: 'image/png' },
      { url: '/uploads/test.gif', expectedType: 'image/gif' },
      { url: '/uploads/test.webp', expectedType: 'image/webp' },
      { url: '/uploads/test.txt', expectedType: 'application/octet-stream' },
    ];

    testCases.forEach(({ url, expectedType }) => {
      const mockRequest = { url } as Request;
      const mockResponse = {
        setHeader: jest.fn(),
        pipe: jest.fn(),
      } as any;
      const mockNext = jest.fn() as NextFunction;

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (path.join as jest.Mock).mockReturnValue('/test' + url);
      
      // Mock path.extname based on the test case
      const extension = url.split('.').pop();
      (path.extname as jest.Mock).mockReturnValue('.' + extension);
      
      const mockStream = { pipe: jest.fn().mockReturnThis() };
      (fs.createReadStream as jest.Mock).mockReturnValue(mockStream);

      middleware.use(mockRequest, mockResponse, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', expectedType);
    });
  });
});
