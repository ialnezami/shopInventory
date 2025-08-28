import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { AppState } from '../app.state';
import { selectToken } from './auth.selectors';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private store: Store<AppState>,
    private router: Router
  ) {}

  // Login Effect
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map(response => AuthActions.loginSuccess({ response })),
          catchError(error => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );

  // Login Success Effect
  loginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loginSuccess),
      tap(({ response }) => {
        // Store token in localStorage
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('user_info', JSON.stringify(response.user));
        
        // Redirect to dashboard
        this.router.navigate(['/dashboard']);
      })
    ),
    { dispatch: false }
  );

  // Register Effect
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap(({ userData }) =>
        this.authService.register(userData).pipe(
          map(response => AuthActions.registerSuccess({ response })),
          catchError(error => of(AuthActions.registerFailure({ error: error.message })))
        )
      )
    )
  );

  // Register Success Effect
  registerSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.registerSuccess),
      tap(({ response }) => {
        // Store token in localStorage
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('user_info', JSON.stringify(response.user));
        
        // Redirect to dashboard
        this.router.navigate(['/dashboard']);
      })
    ),
    { dispatch: false }
  );

  // Logout Effect
  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      withLatestFrom(this.store.select(selectToken)),
      switchMap(([, token]) => {
        if (token) {
          return this.authService.logout().pipe(
            map(() => AuthActions.logoutSuccess()),
            catchError(error => of(AuthActions.logoutFailure({ error: error.message })))
          );
        } else {
          return of(AuthActions.logoutSuccess());
        }
      })
    )
  );

  // Logout Success Effect
  logoutSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logoutSuccess),
      tap(() => {
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        
        // Redirect to login
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );

  // Refresh Token Effect
  refreshToken$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshToken),
      mergeMap(() =>
        this.authService.refreshToken().pipe(
          map(response => AuthActions.refreshTokenSuccess({ response })),
          catchError(error => of(AuthActions.refreshTokenFailure({ error: error.message })))
        )
      )
    )
  );

  // Refresh Token Success Effect
  refreshTokenSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.refreshTokenSuccess),
      tap(({ response }) => {
        // Update token in localStorage
        localStorage.setItem('auth_token', response.access_token);
        localStorage.setItem('user_info', JSON.stringify(response.user));
      })
    ),
    { dispatch: false }
  );

  // Load User Profile Effect
  loadUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserProfile),
      mergeMap(() =>
        this.authService.getCurrentUser().pipe(
          map(user => AuthActions.loadUserProfileSuccess({ user })),
          catchError(error => of(AuthActions.loadUserProfileFailure({ error: error.message })))
        )
      )
    )
  );

  // Update User Profile Effect
  updateUserProfile$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateUserProfile),
      mergeMap(({ updates }) =>
        this.authService.updateProfile(updates).pipe(
          map(user => AuthActions.updateUserProfileSuccess({ user })),
          catchError(error => of(AuthActions.updateUserProfileFailure({ error: error.message })))
        )
      )
    )
  );

  // Update User Profile Success Effect
  updateUserProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.updateUserProfileSuccess),
      tap(({ user }) => {
        // Update user info in localStorage
        localStorage.setItem('user_info', JSON.stringify(user));
      })
    ),
    { dispatch: false }
  );

  // Change Password Effect
  changePassword$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.changePassword),
      mergeMap(({ currentPassword, newPassword }) =>
        this.authService.changePassword({ currentPassword, newPassword }).pipe(
          map(response => AuthActions.changePasswordSuccess({ message: response.message })),
          catchError(error => of(AuthActions.changePasswordFailure({ error: error.message })))
        )
      )
    )
  );

  // Request Password Reset Effect
  requestPasswordReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.requestPasswordReset),
      mergeMap(({ email }) =>
        this.authService.requestPasswordReset({ email }).pipe(
          map(response => AuthActions.requestPasswordResetSuccess({ message: response.message })),
          catchError(error => of(AuthActions.requestPasswordResetFailure({ error: error.message })))
        )
      )
    )
  );

  // Confirm Password Reset Effect
  confirmPasswordReset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.confirmPasswordReset),
      mergeMap(({ token, newPassword }) =>
        this.authService.confirmPasswordReset({ token, newPassword }).pipe(
          map(response => AuthActions.confirmPasswordResetSuccess({ message: response.message })),
          catchError(error => of(AuthActions.confirmPasswordResetFailure({ error: error.message })))
        )
      )
    )
  );

  // Verify Email Effect
  verifyEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyEmail),
      mergeMap(({ token }) =>
        this.authService.verifyEmail(token).pipe(
          map(response => AuthActions.verifyEmailSuccess({ message: response.message })),
          catchError(error => of(AuthActions.verifyEmailFailure({ error: error.message })))
        )
      )
    )
  );

  // Resend Verification Email Effect
  resendVerificationEmail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.resendVerificationEmail),
      mergeMap(({ email }) =>
        this.authService.resendVerificationEmail(email).pipe(
          map(response => AuthActions.resendVerificationEmailSuccess({ message: response.message })),
          catchError(error => of(AuthActions.resendVerificationEmailFailure({ error: error.message })))
        )
      )
    )
  );

  // Load User Permissions Effect
  loadUserPermissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadUserPermissions),
      mergeMap(() =>
        this.authService.getUserPermissions().pipe(
          map(permissions => AuthActions.loadUserPermissionsSuccess({ permissions })),
          catchError(error => of(AuthActions.loadUserPermissionsFailure({ error: error.message })))
        )
      )
    )
  );

  // Auto Login Effect
  autoLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLogin),
      mergeMap(() => {
        const token = localStorage.getItem('auth_token');
        const userInfo = localStorage.getItem('user_info');
        
        if (token && userInfo) {
          try {
            const user = JSON.parse(userInfo);
            return of(AuthActions.autoLoginSuccess({ user, token }));
          } catch {
            return of(AuthActions.autoLoginFailure());
          }
        } else {
          return of(AuthActions.autoLoginFailure());
        }
      })
    )
  );

  // Auto Login Success Effect
  autoLoginSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLoginSuccess),
      tap(() => {
        // User is automatically logged in, no redirect needed
      })
    ),
    { dispatch: false }
  );

  // Auto Login Failure Effect
  autoLoginFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.autoLoginFailure),
      tap(() => {
        // Clear any invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
      })
    ),
    { dispatch: false }
  );

  // Clear Error Effect
  clearError$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.clearAuthError),
      tap(() => {
        // Error cleared, no additional action needed
      })
    ),
    { dispatch: false }
  );

  // Clear State Effect
  clearState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.clearAuthState),
      tap(() => {
        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        
        // Redirect to login
        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  );
}
