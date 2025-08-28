import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { LoadingService } from './loading.service';

export interface ErrorInfo {
  message: string;
  stack?: string;
  component?: string;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
}

export interface ErrorRecoveryOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  redirectTo?: string;
  retryAction?: () => void;
  fallbackAction?: () => void;
  maxRetries?: number;
  retryDelay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorBoundaryService implements ErrorHandler {
  private errorCount = 0;
  private maxErrors = 10;
  private errorWindow = 60000; // 1 minute
  private recentErrors: ErrorInfo[] = [];

  constructor(
    private injector: Injector,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {}

  /**
   * Handle errors globally
   */
  handleError(error: Error | any): void {
    this.errorCount++;
    
    // Check if we're hitting too many errors
    if (this.shouldThrottleErrors()) {
      console.warn('Too many errors, throttling error handling');
      return;
    }

    // Create error info
    const errorInfo: ErrorInfo = {
      message: error.message || 'An unknown error occurred',
      stack: error.stack,
      component: this.getComponentName(error),
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId()
    };

    // Add to recent errors
    this.addRecentError(errorInfo);

    // Log error
    this.logError(errorInfo);

    // Show user-friendly error message
    this.showUserError(errorInfo);

    // Attempt recovery
    this.attemptRecovery(errorInfo);

    // Log to console in development
    if (this.isDevelopment()) {
      console.error('Error caught by ErrorBoundaryService:', errorInfo);
    }
  }

  /**
   * Handle specific types of errors with custom recovery
   */
  handleSpecificError(
    error: Error | any,
    options: ErrorRecoveryOptions = {}
  ): void {
    const {
      showToast = true,
      logToConsole = true,
      redirectTo,
      retryAction,
      fallbackAction,
      maxRetries = 3,
      retryDelay = 1000
    } = options;

    // Create error info
    const errorInfo: ErrorInfo = {
      message: error.message || 'An error occurred',
      stack: error.stack,
      component: this.getComponentName(error),
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      sessionId: this.getSessionId()
    };

    // Log error if requested
    if (logToConsole) {
      this.logError(errorInfo);
    }

    // Show toast if requested
    if (showToast) {
      this.showUserError(errorInfo);
    }

    // Handle retry logic
    if (retryAction && maxRetries > 0) {
      this.handleRetryLogic(retryAction, maxRetries, retryDelay, errorInfo);
    } else if (fallbackAction) {
      // Execute fallback action
      try {
        fallbackAction();
      } catch (fallbackError) {
        console.error('Fallback action also failed:', fallbackError);
      }
    }

    // Redirect if specified
    if (redirectTo) {
      this.redirectToSafePage(redirectTo);
    }
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: any, retryAction?: () => void): void {
    const isNetworkError = this.isNetworkError(error);
    
    if (isNetworkError) {
      this.toastService.showRetryToast(
        'Network error occurred. Please check your connection and try again.',
        retryAction || (() => window.location.reload()),
        { title: 'Network Error' }
      );
    } else {
      this.handleSpecificError(error, {
        showToast: true,
        logToConsole: true
      });
    }
  }

  /**
   * Handle authentication errors
   */
  handleAuthError(error: any): void {
    const isAuthError = this.isAuthError(error);
    
    if (isAuthError) {
      // Clear any stored auth data
      this.clearAuthData();
      
      // Redirect to login
      this.redirectToSafePage('/auth/login');
      
      // Show appropriate message
      this.toastService.error('Your session has expired. Please log in again.', {
        title: 'Authentication Error'
      });
    } else {
      this.handleSpecificError(error);
    }
  }

  /**
   * Handle validation errors
   */
  handleValidationError(error: any, form?: any): void {
    if (form && form.errors) {
      // Handle form validation errors
      this.toastService.warning('Please fix the validation errors before submitting.', {
        title: 'Validation Error'
      });
    } else {
      // Handle general validation errors
      this.toastService.warning(error.message || 'Validation failed', {
        title: 'Validation Error'
      });
    }
  }

  /**
   * Handle permission errors
   */
  handlePermissionError(error: any): void {
    this.toastService.error('You do not have permission to perform this action.', {
      title: 'Permission Denied'
    });
    
    // Redirect to dashboard or appropriate page
    this.redirectToSafePage('/dashboard');
  }

  /**
   * Handle resource not found errors
   */
  handleNotFoundError(error: any): void {
    this.toastService.warning('The requested resource was not found.', {
      title: 'Not Found'
    });
    
    // Redirect to 404 page or dashboard
    this.redirectToSafePage('/not-found');
  }

  /**
   * Handle server errors
   */
  handleServerError(error: any, retryAction?: () => void): void {
    const isServerError = this.isServerError(error);
    
    if (isServerError) {
      this.toastService.showRetryToast(
        'A server error occurred. Please try again later.',
        retryAction || (() => window.location.reload()),
        { title: 'Server Error' }
      );
    } else {
      this.handleSpecificError(error);
    }
  }

  /**
   * Create a safe error handler for promises
   */
  createSafePromiseHandler<T>(
    promise: Promise<T>,
    errorOptions: ErrorRecoveryOptions = {}
  ): Promise<T> {
    return promise.catch(error => {
      this.handleSpecificError(error, errorOptions);
      throw error; // Re-throw to maintain promise chain
    });
  }

  /**
   * Create a safe error handler for observables
   */
  createSafeObservableHandler<T>(
    observable: any,
    errorOptions: ErrorRecoveryOptions = {}
  ): any {
    return observable.pipe(
      // Add error handling operator
      // Note: This is a simplified version - in practice you'd use catchError from RxJS
      // catchError(error => {
      //   this.handleSpecificError(error, errorOptions);
      //   return EMPTY;
      // })
    );
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    recentErrors: number;
    errorRate: number;
    lastErrorTime?: Date;
  } {
    const now = new Date();
    const recentErrors = this.recentErrors.filter(
      error => now.getTime() - error.timestamp.getTime() < this.errorWindow
    );

    return {
      totalErrors: this.errorCount,
      recentErrors: recentErrors.length,
      errorRate: recentErrors.length / (this.errorWindow / 1000), // errors per second
      lastErrorTime: this.recentErrors.length > 0 ? this.recentErrors[0].timestamp : undefined
    };
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorCount = 0;
    this.recentErrors = [];
  }

  /**
   * Get recent errors
   */
  getRecentErrors(): ErrorInfo[] {
    return [...this.recentErrors];
  }

  /**
   * Check if error throttling should be applied
   */
  private shouldThrottleErrors(): boolean {
    const now = new Date();
    const recentErrors = this.recentErrors.filter(
      error => now.getTime() - error.timestamp.getTime() < this.errorWindow
    );

    return recentErrors.length >= this.maxErrors;
  }

  /**
   * Add error to recent errors list
   */
  private addRecentError(errorInfo: ErrorInfo): void {
    this.recentErrors.unshift(errorInfo);
    
    // Keep only recent errors within the window
    const now = new Date();
    this.recentErrors = this.recentErrors.filter(
      error => now.getTime() - error.timestamp.getTime() < this.errorWindow
    );
  }

  /**
   * Log error to appropriate destination
   */
  private logError(errorInfo: ErrorInfo): void {
    // In production, you might want to send this to a logging service
    // For now, we'll just log to console
    console.error('Error logged:', errorInfo);
  }

  /**
   * Show user-friendly error message
   */
  private showUserError(errorInfo: ErrorInfo): void {
    // Don't show technical errors to users
    const userMessage = this.getUserFriendlyMessage(errorInfo.message);
    
    this.toastService.error(userMessage, {
      title: 'Error',
      duration: 5000
    });
  }

  /**
   * Attempt automatic recovery
   */
  private attemptRecovery(errorInfo: ErrorInfo): void {
    // Try to recover from common errors
    if (this.isNetworkError(errorInfo)) {
      // Network errors might resolve themselves
      setTimeout(() => {
        // Could attempt to retry the failed operation
      }, 5000);
    } else if (this.isAuthError(errorInfo)) {
      // Auth errors - redirect to login
      this.redirectToSafePage('/auth/login');
    } else if (this.isServerError(errorInfo)) {
      // Server errors - show retry option
      this.toastService.showRetryToast(
        'A server error occurred. Please try again.',
        () => window.location.reload()
      );
    }
  }

  /**
   * Handle retry logic
   */
  private handleRetryLogic(
    retryAction: () => void,
    maxRetries: number,
    retryDelay: number,
    errorInfo: ErrorInfo
  ): void {
    let retryCount = 0;

    const attemptRetry = () => {
      if (retryCount < maxRetries) {
        retryCount++;
        
        this.toastService.info(`Retry attempt ${retryCount} of ${maxRetries}`, {
          duration: 2000
        });

        setTimeout(() => {
          try {
            retryAction();
          } catch (retryError) {
            if (retryCount < maxRetries) {
              attemptRetry();
            } else {
              this.toastService.error('All retry attempts failed. Please try again later.', {
                title: 'Retry Failed'
              });
            }
          }
        }, retryDelay);
      }
    };

    attemptRetry();
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(technicalMessage: string): string {
    // Map technical error messages to user-friendly ones
    const messageMap: { [key: string]: string } = {
      'Network Error': 'Unable to connect to the server. Please check your internet connection.',
      'Unauthorized': 'You are not authorized to perform this action.',
      'Forbidden': 'Access denied. You do not have permission for this resource.',
      'Not Found': 'The requested resource was not found.',
      'Internal Server Error': 'A server error occurred. Please try again later.',
      'Bad Request': 'The request was invalid. Please check your input and try again.',
      'Timeout': 'The request timed out. Please try again.',
      'Service Unavailable': 'The service is temporarily unavailable. Please try again later.'
    };

    // Find matching message
    for (const [key, value] of Object.entries(messageMap)) {
      if (technicalMessage.includes(key)) {
        return value;
      }
    }

    // Default message
    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Get component name from error
   */
  private getComponentName(error: any): string {
    // Try to extract component name from error stack or context
    if (error.componentName) {
      return error.componentName;
    }
    
    if (error.stack) {
      // Parse stack trace to find component
      const stackLines = error.stack.split('\n');
      for (const line of stackLines) {
        if (line.includes('Component') || line.includes('component')) {
          return line.trim();
        }
      }
    }
    
    return 'Unknown Component';
  }

  /**
   * Get user ID from storage or context
   */
  private getUserId(): string | undefined {
    try {
      const userInfo = localStorage.getItem('user_info');
      if (userInfo) {
        const user = JSON.parse(userInfo);
        return user.id || user._id;
      }
    } catch {
      // Ignore parsing errors
    }
    return undefined;
  }

  /**
   * Get session ID
   */
  private getSessionId(): string | undefined {
    try {
      return sessionStorage.getItem('session_id') || undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Check if error is a network error
   */
  private isNetworkError(error: any): boolean {
    return error.message?.includes('Network Error') ||
           error.message?.includes('Failed to fetch') ||
           error.status === 0 ||
           error.status === 502 ||
           error.status === 503 ||
           error.status === 504;
  }

  /**
   * Check if error is an authentication error
   */
  private isAuthError(error: any): boolean {
    return error.status === 401 ||
           error.status === 403 ||
           error.message?.includes('Unauthorized') ||
           error.message?.includes('Forbidden');
  }

  /**
   * Check if error is a server error
   */
  private isServerError(error: any): boolean {
    return error.status >= 500 ||
           error.message?.includes('Internal Server Error') ||
           error.message?.includes('Service Unavailable');
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      sessionStorage.removeItem('session_id');
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Redirect to safe page
   */
  private redirectToSafePage(path: string): void {
    try {
      const router = this.injector.get(Router);
      router.navigate([path]);
    } catch {
      // Fallback to window location
      window.location.href = path;
    }
  }

  /**
   * Check if running in development mode
   */
  private isDevelopment(): boolean {
    return !window.location.hostname.includes('production') &&
           !window.location.hostname.includes('prod');
  }
}
