import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = this.getBadRequestMessage(error);
              break;
            case 401:
              errorMessage = 'Unauthorized access. Please login again.';
              this.handleUnauthorized();
              break;
            case 403:
              errorMessage = 'Access forbidden. Insufficient permissions.';
              break;
            case 404:
              errorMessage = 'Resource not found.';
              break;
            case 409:
              errorMessage = this.getConflictMessage(error);
              break;
            case 422:
              errorMessage = this.getValidationMessage(error);
              break;
            case 429:
              errorMessage = 'Too many requests. Please try again later.';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            case 502:
              errorMessage = 'Bad gateway. Please try again later.';
              break;
            case 503:
              errorMessage = 'Service unavailable. Please try again later.';
              break;
            case 504:
              errorMessage = 'Gateway timeout. Please try again later.';
              break;
            default:
              if (error.error?.message) {
                errorMessage = error.error.message;
              } else {
                errorMessage = `Error ${error.status}: ${error.statusText}`;
              }
          }
        }

        // Log error for debugging
        console.error('HTTP Error:', {
          url: request.url,
          method: request.method,
          status: error.status,
          message: errorMessage,
          error: error
        });

        // Create a custom error object
        const customError = new Error(errorMessage);
        (customError as any).status = error.status;
        (customError as any).originalError = error;

        return throwError(() => customError);
      })
    );
  }

  private getBadRequestMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const messages = error.error.errors.map((err: any) => err.message || err.msg).filter(Boolean);
      if (messages.length > 0) {
        return messages.join(', ');
      }
    }

    return 'Bad request. Please check your input.';
  }

  private getConflictMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.conflict) {
      return `Conflict: ${error.error.conflict}`;
    }

    return 'Resource conflict. The resource may already exist.';
  }

  private getValidationMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.error?.validationErrors && Array.isArray(error.error.validationErrors)) {
      const messages = error.error.validationErrors.map((err: any) => err.message || err.msg).filter(Boolean);
      if (messages.length > 0) {
        return `Validation errors: ${messages.join(', ')}`;
      }
    }

    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const messages = error.error.errors.map((err: any) => err.message || err.msg).filter(Boolean);
      if (messages.length > 0) {
        return `Validation errors: ${messages.join(', ')}`;
      }
    }

    return 'Validation error. Please check your input.';
  }

  private handleUnauthorized(): void {
    // Clear any stored authentication data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    
    // Redirect to login page
    this.router.navigate(['/auth/login']);
  }
}
