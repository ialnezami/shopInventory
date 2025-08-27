import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalExceptionFilter],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException correctly', () => {
    const mockRequest = {
      url: '/test',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
    } as any;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const mockHost = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as any;

    const httpException = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(httpException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Test error',
        error: 'Test error',
        path: '/test',
        method: 'GET',
      }),
    );
  });

  it('should handle generic Error correctly', () => {
    const mockRequest = {
      url: '/test',
      method: 'POST',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
    } as any;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const mockHost = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as any;

    const genericError = new Error('Generic error');

    filter.catch(genericError, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Generic error',
        error: 'Error',
        path: '/test',
        method: 'POST',
      }),
    );
  });

  it('should handle unknown exceptions correctly', () => {
    const mockRequest = {
      url: '/test',
      method: 'PUT',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
    } as any;

    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    const mockHost = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as any;

    const unknownException = 'Unknown error';

    filter.catch(unknownException, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: 'Internal Server Error',
        path: '/test',
        method: 'PUT',
      }),
    );
  });
});
