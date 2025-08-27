import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ErrorHandlerInterceptor } from './error-handler.interceptor';

describe('ErrorHandlerInterceptor', () => {
  let interceptor: ErrorHandlerInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ErrorHandlerInterceptor],
    }).compile();

    interceptor = module.get<ErrorHandlerInterceptor>(ErrorHandlerInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should pass through successful requests', (done) => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          url: '/test',
          body: {},
          user: { username: 'testuser' },
        }),
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of({ data: 'success' }),
    } as CallHandler;

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe({
        next: (value) => {
          expect(value).toEqual({ data: 'success' });
          done();
        },
        error: done,
      });
  });

  it('should handle errors and log them', (done) => {
    const mockExecutionContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'POST',
          url: '/test',
          body: { test: 'data' },
          user: { username: 'testuser' },
        }),
      }),
    } as ExecutionContext;

    const testError = new Error('Test error');
    const mockCallHandler = {
      handle: () => throwError(() => testError),
    } as CallHandler;

    interceptor
      .intercept(mockExecutionContext, mockCallHandler)
      .subscribe({
        next: () => done(new Error('Should have thrown an error')),
        error: (error) => {
          expect(error).toBe(testError);
          done();
        },
      });
  });
});
