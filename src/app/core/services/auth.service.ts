import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'staff' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'admin' | 'manager' | 'staff' | 'user';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');

    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch {
        this.clearAuth();
      }
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap(response => {
        this.setAuth(response.access_token, response.user);
      })
    );
  }

  /**
   * Register new user
   */
  register(userData: RegisterData): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', userData).pipe(
      tap(response => {
        this.setAuth(response.access_token, response.user);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<void> {
    return this.apiService.post<void>('/auth/logout', {}).pipe(
      tap(() => {
        this.clearAuth();
      }),
      catchError(() => {
        // Even if logout API fails, clear local auth
        this.clearAuth();
        return of(void 0);
      })
    );
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/refresh', {}).pipe(
      tap(response => {
        this.setAuth(response.access_token, response.user);
      })
    );
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('/auth/profile').pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('user_info', JSON.stringify(user));
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(updates: ProfileUpdate): Observable<User> {
    return this.apiService.put<User>('/auth/profile', updates).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        localStorage.setItem('user_info', JSON.stringify(user));
      })
    );
  }

  /**
   * Change password
   */
  changePassword(passwordData: PasswordChangeRequest): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/auth/change-password', passwordData);
  }

  /**
   * Request password reset
   */
  requestPasswordReset(request: PasswordResetRequest): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/auth/forgot-password', request);
  }

  /**
   * Confirm password reset
   */
  confirmPasswordReset(resetData: PasswordResetConfirm): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/auth/reset-password', resetData);
  }

  /**
   * Verify email
   */
  verifyEmail(token: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/auth/verify-email', { token });
  }

  /**
   * Resend verification email
   */
  resendVerificationEmail(email: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>('/auth/resend-verification', { email });
  }

  /**
   * Get user permissions
   */
  getUserPermissions(): Observable<string[]> {
    return this.apiService.get<string[]>('/auth/permissions');
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Role-based permissions
    const rolePermissions: Record<string, string[]> = {
      manager: ['products:read', 'products:write', 'sales:read', 'sales:write', 'customers:read', 'customers:write'],
      staff: ['products:read', 'sales:read', 'sales:write', 'customers:read'],
      user: ['products:read']
    };

    return rolePermissions[user.role]?.includes(permission) || false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string | string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role);
    }

    return user.role === role;
  }

  /**
   * Get current user
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Set authentication data
   */
  private setAuth(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_info', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Get user's full name
   */
  getUserFullName(): string {
    const user = this.currentUserSubject.value;
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  }

  /**
   * Get user's initials
   */
  getUserInitials(): string {
    const user = this.currentUserSubject.value;
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Auto-refresh token if needed
   */
  autoRefreshToken(): void {
    if (this.isTokenExpired() && this.isAuthenticated()) {
      this.refreshToken().subscribe({
        error: () => {
          this.clearAuth();
          // Redirect to login
          window.location.href = '/auth/login';
        }
      });
    }
  }

  /**
   * Get user's role display name
   */
  getRoleDisplayName(): string {
    const user = this.currentUserSubject.value;
    if (!user) return '';

    const roleNames: Record<string, string> = {
      admin: 'Administrator',
      manager: 'Manager',
      staff: 'Staff',
      user: 'User'
    };

    return roleNames[user.role] || user.role;
  }
}
