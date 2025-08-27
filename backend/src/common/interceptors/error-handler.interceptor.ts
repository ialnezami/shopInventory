import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorHandlerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorHandlerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        const request = context.switchToHttp().getRequest();
        const { method, url, body, user } = request;

        // Log the error with context
        this.logger.error(
          `❌ Error in ${method} ${url}`,
          {
            error: error.message,
            stack: error.stack,
            body,
            user: user?.username || 'anonymous',
            timestamp: new Date().toISOString(),
          }
        );

        // Return the error to be handled by the global exception filter
        return throwError(() => error);
      }),
    );
  }
}
