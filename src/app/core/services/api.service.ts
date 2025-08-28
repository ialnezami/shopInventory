import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiUrl;
  private readonly defaultHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {}

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Create headers with authentication token
   */
  private createAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    if (token) {
      return this.defaultHeaders.set('Authorization', `Bearer ${token}`);
    }
    return this.defaultHeaders;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized access. Please login again.';
        // Redirect to login or clear token
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
      } else if (error.status === 403) {
        errorMessage = 'Access forbidden. Insufficient permissions.';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found.';
      } else if (error.status === 422) {
        errorMessage = 'Validation error. Please check your input.';
      } else if (error.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error ${error.status}: ${error.statusText}`;
      }
    }

    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const httpParams = params ? new HttpParams({ fromObject: params }) : undefined;

    return this.http.get<T>(url, {
      headers: this.createAuthHeaders(),
      params: httpParams
    }).pipe(
      retry(1),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.post<T>(url, data, {
      headers: this.createAuthHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.put<T>(url, data, {
      headers: this.createAuthHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.patch<T>(url, data, {
      headers: this.createAuthHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;

    return this.http.delete<T>(url, {
      headers: this.createAuthHeaders()
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Upload file
   */
  upload<T>(endpoint: string, file: File, additionalData?: any): Observable<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const formData = new FormData();
    
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers = new HttpHeaders();
    const token = this.getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<T>(url, formData, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Download file
   */
  download(endpoint: string, filename?: string): Observable<Blob> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.createAuthHeaders();

    return this.http.get(url, {
      headers,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;

    try {
      // Check if token is expired (JWT tokens have expiration)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem('auth_token');
        return false;
      }
      
      return true;
    } catch {
      localStorage.removeItem('auth_token');
      return false;
    }
  }

  /**
   * Clear authentication
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
  }
}
