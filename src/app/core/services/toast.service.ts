import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration: number;
  timestamp: Date;
  persistent?: boolean;
  actions?: ToastAction[];
  data?: any;
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger' | 'success';
}

export interface ToastOptions {
  title?: string;
  duration?: number;
  persistent?: boolean;
  actions?: ToastAction[];
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private toastCounter = 0;

  constructor() {}

  /**
   * Show a success toast
   */
  success(message: string, options: ToastOptions = {}): string {
    return this.showToast('success', message, options);
  }

  /**
   * Show an error toast
   */
  error(message: string, options: ToastOptions = {}): string {
    return this.showToast('error', message, options);
  }

  /**
   * Show a warning toast
   */
  warning(message: string, options: ToastOptions = {}): string {
    return this.showToast('warning', message, options);
  }

  /**
   * Show an info toast
   */
  info(message: string, options: ToastOptions = {}): string {
    return this.showToast('info', message, options);
  }

  /**
   * Show a toast with custom type
   */
  showToast(type: Toast['type'], message: string, options: ToastOptions = {}): string {
    const {
      title,
      duration = this.getDefaultDuration(type),
      persistent = false,
      actions = [],
      data
    } = options;

    const toast: Toast = {
      id: this.generateId(),
      type,
      title,
      message,
      duration,
      timestamp: new Date(),
      persistent,
      actions,
      data
    };

    this.addToast(toast);

    // Auto-remove non-persistent toasts
    if (!persistent && duration > 0) {
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    }

    return toast.id;
  }

  /**
   * Remove a specific toast
   */
  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Remove all toasts
   */
  removeAllToasts(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Remove toasts by type
   */
  removeToastsByType(type: Toast['type']): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(toast => toast.type !== type);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Remove toasts older than specified time
   */
  removeOldToasts(maxAge: number): void {
    const currentToasts = this.toastsSubject.value;
    const cutoffTime = new Date(Date.now() - maxAge);
    const updatedToasts = currentToasts.filter(toast => toast.timestamp > cutoffTime);
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Update an existing toast
   */
  updateToast(id: string, updates: Partial<Toast>): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    );
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Get current toasts
   */
  getToasts(): Toast[] {
    return this.toastsSubject.value;
  }

  /**
   * Get toasts by type
   */
  getToastsByType(type: Toast['type']): Toast[] {
    return this.toastsSubject.value.filter(toast => toast.type === type);
  }

  /**
   * Check if there are any toasts
   */
  hasToasts(): boolean {
    return this.toastsSubject.value.length > 0;
  }

  /**
   * Check if there are toasts of a specific type
   */
  hasToastsOfType(type: Toast['type']): boolean {
    return this.toastsSubject.value.some(toast => toast.type === type);
  }

  /**
   * Get toast count
   */
  getToastCount(): number {
    return this.toastsSubject.value.length;
  }

  /**
   * Get toast count by type
   */
  getToastCountByType(type: Toast['type']): number {
    return this.toastsSubject.value.filter(toast => toast.type === type).length;
  }

  /**
   * Show a toast with action buttons
   */
  showToastWithActions(
    type: Toast['type'],
    message: string,
    actions: ToastAction[],
    options: Omit<ToastOptions, 'actions'> = {}
  ): string {
    return this.showToast(type, message, { ...options, actions, persistent: true });
  }

  /**
   * Show a confirmation toast
   */
  showConfirmation(
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options: ToastOptions = {}
  ): string {
    const actions: ToastAction[] = [
      {
        label: 'Confirm',
        action: () => {
          onConfirm();
          this.removeToast(this.toastCounter.toString());
        },
        style: 'primary'
      }
    ];

    if (onCancel) {
      actions.push({
        label: 'Cancel',
        action: () => {
          onCancel();
          this.removeToast(this.toastCounter.toString());
        },
        style: 'secondary'
      });
    }

    return this.showToast('info', message, {
      ...options,
      actions,
      persistent: true
    });
  }

  /**
   * Show a toast with retry action
   */
  showRetryToast(
    message: string,
    retryAction: () => void,
    options: ToastOptions = {}
  ): string {
    const actions: ToastAction[] = [
      {
        label: 'Retry',
        action: () => {
          retryAction();
          this.removeToast(this.toastCounter.toString());
        },
        style: 'primary'
      },
      {
        label: 'Dismiss',
        action: () => {
          this.removeToast(this.toastCounter.toString());
        },
        style: 'secondary'
      }
    ];

    return this.showToast('error', message, {
      ...options,
      actions,
      persistent: true
    });
  }

  /**
   * Show a toast with custom actions
   */
  showCustomToast(
    type: Toast['type'],
    message: string,
    customActions: ToastAction[],
    options: ToastOptions = {}
  ): string {
    return this.showToast(type, message, {
      ...options,
      actions: customActions,
      persistent: true
    });
  }

  /**
   * Show a progress toast
   */
  showProgressToast(
    message: string,
    progress: number,
    options: ToastOptions = {}
  ): string {
    const progressMessage = `${message} (${progress.toFixed(0)}%)`;
    
    if (progress >= 100) {
      // Complete - show success toast
      this.removeToast(this.toastCounter.toString());
      return this.success('Operation completed successfully', options);
    }

    // Update existing toast or create new one
    const existingToast = this.toastsSubject.value.find(t => t.id === this.toastCounter.toString());
    
    if (existingToast) {
      this.updateToast(this.toastCounter.toString(), {
        message: progressMessage,
        data: { progress }
      });
    } else {
      this.showToast('info', progressMessage, {
        ...options,
        data: { progress },
        persistent: true
      });
    }

    return this.toastCounter.toString();
  }

  /**
   * Show a toast with countdown
   */
  showCountdownToast(
    type: Toast['type'],
    message: string,
    countdownSeconds: number,
    options: ToastOptions = {}
  ): string {
    const toastId = this.showToast(type, message, {
      ...options,
      persistent: true
    });

    let remainingSeconds = countdownSeconds;
    const countdownInterval = setInterval(() => {
      remainingSeconds--;
      
      if (remainingSeconds <= 0) {
        clearInterval(countdownInterval);
        this.removeToast(toastId);
      } else {
        this.updateToast(toastId, {
          message: `${message} (${remainingSeconds}s)`
        });
      }
    }, 1000);

    return toastId;
  }

  /**
   * Show a toast with auto-dismiss on condition
   */
  showConditionalToast(
    type: Toast['type'],
    message: string,
    condition: () => boolean,
    checkInterval: number = 1000,
    options: ToastOptions = {}
  ): string {
    const toastId = this.showToast(type, message, {
      ...options,
      persistent: true
    });

    const checkCondition = setInterval(() => {
      if (condition()) {
        clearInterval(checkCondition);
        this.removeToast(toastId);
      }
    }, checkInterval);

    return toastId;
  }

  /**
   * Add a toast to the list
   */
  private addToast(toast: Toast): void {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = [...currentToasts, toast];
    this.toastsSubject.next(updatedToasts);
  }

  /**
   * Generate a unique ID for toasts
   */
  private generateId(): string {
    return (++this.toastCounter).toString();
  }

  /**
   * Get default duration for toast type
   */
  private getDefaultDuration(type: Toast['type']): number {
    switch (type) {
      case 'success':
        return 3000;
      case 'error':
        return 5000;
      case 'warning':
        return 4000;
      case 'info':
        return 3000;
      default:
        return 3000;
    }
  }

  /**
   * Clear toasts on component destroy
   */
  clearToasts(): void {
    this.removeAllToasts();
  }

  /**
   * Get observable for specific toast type
   */
  getToastsByType$(type: Toast['type']): Observable<Toast[]> {
    return new Observable(observer => {
      const subscription = this.toasts$.subscribe(toasts => {
        const filteredToasts = toasts.filter(toast => toast.type === type);
        observer.next(filteredToasts);
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get observable for toast count
   */
  getToastCount$(): Observable<number> {
    return new Observable(observer => {
      const subscription = this.toasts$.subscribe(toasts => {
        observer.next(toasts.length);
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get observable for toast count by type
   */
  getToastCountByType$(type: Toast['type']): Observable<number> {
    return new Observable(observer => {
      const subscription = this.toasts$.subscribe(toasts => {
        const count = toasts.filter(toast => toast.type === type).length;
        observer.next(count);
      });

      return () => subscription.unsubscribe();
    });
  }
}
