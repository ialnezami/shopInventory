import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  [key: string]: boolean;
}

export interface LoadingOptions {
  message?: string;
  showSpinner?: boolean;
  showProgress?: boolean;
  progress?: number;
  indeterminate?: boolean;
  backdrop?: boolean;
  dismissible?: boolean;
}

export interface LoadingItem {
  id: string;
  key: string;
  message?: string;
  showSpinner: boolean;
  showProgress: boolean;
  progress: number;
  indeterminate: boolean;
  backdrop: boolean;
  dismissible: boolean;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({});
  private loadingItemsSubject = new BehaviorSubject<LoadingItem[]>([]);
  private globalLoadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();
  public loadingItems$ = this.loadingItemsSubject.asObservable();
  public globalLoading$ = this.globalLoadingSubject.asObservable();

  private loadingCounter = 0;

  constructor() {}

  /**
   * Set loading state for a specific key
   */
  setLoading(key: string, loading: boolean, options: LoadingOptions = {}): string {
    const currentState = this.loadingSubject.value;
    const updatedState = { ...currentState };

    if (loading) {
      updatedState[key] = true;
      this.addLoadingItem(key, options);
    } else {
      delete updatedState[key];
      this.removeLoadingItem(key);
    }

    this.loadingSubject.next(updatedState);
    this.updateGlobalLoading();

    return key;
  }

  /**
   * Set global loading state
   */
  setGlobalLoading(loading: boolean, options: LoadingOptions = {}): void {
    this.globalLoadingSubject.next(loading);
    
    if (loading) {
      this.addLoadingItem('global', options);
    } else {
      this.removeLoadingItem('global');
    }
  }

  /**
   * Check if a specific key is loading
   */
  isLoading(key: string): boolean {
    return this.loadingSubject.value[key] || false;
  }

  /**
   * Check if global loading is active
   */
  isGlobalLoading(): boolean {
    return this.globalLoadingSubject.value;
  }

  /**
   * Check if any loading is active
   */
  hasAnyLoading(): boolean {
    const loadingState = this.loadingSubject.value;
    return Object.values(loadingState).some(loading => loading) || this.isGlobalLoading();
  }

  /**
   * Get loading state for all keys
   */
  getLoadingState(): LoadingState {
    return { ...this.loadingSubject.value };
  }

  /**
   * Get loading items
   */
  getLoadingItems(): LoadingItem[] {
    return [...this.loadingItemsSubject.value];
  }

  /**
   * Get loading count
   */
  getLoadingCount(): number {
    const loadingState = this.loadingSubject.value;
    return Object.keys(loadingState).length + (this.isGlobalLoading() ? 1 : 0);
  }

  /**
   * Clear loading for a specific key
   */
  clearLoading(key: string): void {
    this.setLoading(key, false);
  }

  /**
   * Clear all loading states
   */
  clearAllLoading(): void {
    this.loadingSubject.next({});
    this.globalLoadingSubject.next(false);
    this.loadingItemsSubject.next([]);
  }

  /**
   * Clear loading states by pattern
   */
  clearLoadingByPattern(pattern: string): void {
    const currentState = this.loadingSubject.value;
    const updatedState = { ...currentState };

    Object.keys(updatedState).forEach(key => {
      if (key.includes(pattern)) {
        delete updatedState[key];
        this.removeLoadingItem(key);
      }
    });

    this.loadingSubject.next(updatedState);
    this.updateGlobalLoading();
  }

  /**
   * Set loading with progress
   */
  setLoadingWithProgress(key: string, loading: boolean, progress: number, options: LoadingOptions = {}): string {
    const loadingId = this.setLoading(key, loading, { ...options, showProgress: true, progress });
    
    if (loading) {
      this.updateLoadingProgress(key, progress);
    }

    return loadingId;
  }

  /**
   * Update loading progress
   */
  updateLoadingProgress(key: string, progress: number): void {
    const currentItems = this.loadingItemsSubject.value;
    const updatedItems = currentItems.map(item => 
      item.key === key ? { ...item, progress } : item
    );
    this.loadingItemsSubject.next(updatedItems);
  }

  /**
   * Set loading with message
   */
  setLoadingWithMessage(key: string, loading: boolean, message: string, options: LoadingOptions = {}): string {
    return this.setLoading(key, loading, { ...options, message });
  }

  /**
   * Set loading with spinner
   */
  setLoadingWithSpinner(key: string, loading: boolean, options: LoadingOptions = {}): string {
    return this.setLoading(key, loading, { ...options, showSpinner: true });
  }

  /**
   * Set loading with backdrop
   */
  setLoadingWithBackdrop(key: string, loading: boolean, options: LoadingOptions = {}): string {
    return this.setLoading(key, loading, { ...options, backdrop: true });
  }

  /**
   * Set dismissible loading
   */
  setDismissibleLoading(key: string, loading: boolean, options: LoadingOptions = {}): string {
    return this.setLoading(key, loading, { ...options, dismissible: true });
  }

  /**
   * Set indeterminate loading (progress bar without specific progress)
   */
  setIndeterminateLoading(key: string, loading: boolean, options: LoadingOptions = {}): string {
    return this.setLoading(key, loading, { ...options, showProgress: true, indeterminate: true });
  }

  /**
   * Create a loading promise wrapper
   */
  wrapWithLoading<T>(
    promise: Promise<T>,
    key: string,
    options: LoadingOptions = {}
  ): Promise<T> {
    this.setLoading(key, true, options);

    return promise.finally(() => {
      this.setLoading(key, false);
    });
  }

  /**
   * Create a loading observable wrapper
   */
  wrapObservableWithLoading<T>(
    observable: Observable<T>,
    key: string,
    options: LoadingOptions = {}
  ): Observable<T> {
    this.setLoading(key, true, options);

    return new Observable(observer => {
      const subscription = observable.subscribe({
        next: (value) => observer.next(value),
        error: (error) => observer.error(error),
        complete: () => {
          observer.complete();
          this.setLoading(key, false);
        }
      });

      return () => {
        subscription.unsubscribe();
        this.setLoading(key, false);
      };
    });
  }

  /**
   * Create a loading function wrapper
   */
  wrapFunctionWithLoading<T>(
    fn: () => Promise<T> | Observable<T> | T,
    key: string,
    options: LoadingOptions = {}
  ): Promise<T> | Observable<T> | T {
    this.setLoading(key, true, options);

    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.finally(() => this.setLoading(key, false));
      } else if (result instanceof Observable) {
        return this.wrapObservableWithLoading(result, key, options);
      } else {
        this.setLoading(key, false);
        return result;
      }
    } catch (error) {
      this.setLoading(key, false);
      throw error;
    }
  }

  /**
   * Create a loading with timeout
   */
  setLoadingWithTimeout(
    key: string,
    timeout: number,
    options: LoadingOptions = {}
  ): string {
    const loadingId = this.setLoading(key, true, options);

    setTimeout(() => {
      this.setLoading(key, false);
    }, timeout);

    return loadingId;
  }

  /**
   * Create a loading with auto-dismiss on condition
   */
  setLoadingWithCondition(
    key: string,
    condition: () => boolean,
    checkInterval: number = 1000,
    options: LoadingOptions = {}
  ): string {
    const loadingId = this.setLoading(key, true, options);

    const checkCondition = setInterval(() => {
      if (condition()) {
        clearInterval(checkCondition);
        this.setLoading(key, false);
      }
    }, checkInterval);

    return loadingId;
  }

  /**
   * Get loading observable for a specific key
   */
  getLoading$(key: string): Observable<boolean> {
    return new Observable(observer => {
      const subscription = this.loading$.subscribe(loadingState => {
        observer.next(loadingState[key] || false);
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get loading items observable by key
   */
  getLoadingItemsByKey$(key: string): Observable<LoadingItem[]> {
    return new Observable(observer => {
      const subscription = this.loadingItems$.subscribe(items => {
        const filteredItems = items.filter(item => item.key === key);
        observer.next(filteredItems);
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Get loading count observable
   */
  getLoadingCount$(): Observable<number> {
    return new Observable(observer => {
      const subscription = this.loading$.subscribe(loadingState => {
        const count = Object.keys(loadingState).length + (this.isGlobalLoading() ? 1 : 0);
        observer.next(count);
      });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Add a loading item
   */
  private addLoadingItem(key: string, options: LoadingOptions = {}): void {
    const {
      message,
      showSpinner = true,
      showProgress = false,
      progress = 0,
      indeterminate = false,
      backdrop = false,
      dismissible = false
    } = options;

    const loadingItem: LoadingItem = {
      id: this.generateId(),
      key,
      message,
      showSpinner,
      showProgress,
      progress,
      indeterminate,
      backdrop,
      dismissible,
      timestamp: new Date()
    };

    const currentItems = this.loadingItemsSubject.value;
    const updatedItems = [...currentItems, loadingItem];
    this.loadingItemsSubject.next(updatedItems);
  }

  /**
   * Remove a loading item
   */
  private removeLoadingItem(key: string): void {
    const currentItems = this.loadingItemsSubject.value;
    const updatedItems = currentItems.filter(item => item.key !== key);
    this.loadingItemsSubject.next(updatedItems);
  }

  /**
   * Update global loading state
   */
  private updateGlobalLoading(): void {
    const loadingState = this.loadingSubject.value;
    const hasLoading = Object.values(loadingState).some(loading => loading);
    this.globalLoadingSubject.next(hasLoading);
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return (++this.loadingCounter).toString();
  }

  /**
   * Clear loading on service destroy
   */
  clearAll(): void {
    this.clearAllLoading();
  }
}
