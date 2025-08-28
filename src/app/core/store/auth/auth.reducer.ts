import { createReducer, on } from '@ngrx/store';
import { AuthState, initialAuthState } from './auth.state';
import * as AuthActions from './auth.actions';

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    token: response.access_token,
    permissions: response.user.role === 'admin' ? ['*'] : [],
    roles: [response.user.role]
  })),

  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    isAuthenticated: false,
    user: null,
    token: null
  })),

  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.registerSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    token: response.access_token,
    permissions: response.user.role === 'admin' ? ['*'] : [],
    roles: [response.user.role]
  })),

  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    isAuthenticated: false,
    user: null,
    token: null
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    isLoading: true
  })),

  on(AuthActions.logoutSuccess, () => ({
    ...initialAuthState
  })),

  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Token Refresh
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.refreshTokenSuccess, (state, { response }) => ({
    ...state,
    isLoading: false,
    error: null,
    token: response.access_token,
    refreshToken: response.access_token
  })),

  on(AuthActions.refreshTokenFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
    isAuthenticated: false,
    user: null,
    token: null
  })),

  on(AuthActions.tokenExpired, (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    token: null,
    refreshToken: null
  })),

  // User Profile
  on(AuthActions.loadUserProfile, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loadUserProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    error: null
  })),

  on(AuthActions.loadUserProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(AuthActions.updateUserProfile, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.updateUserProfileSuccess, (state, { user }) => ({
    ...state,
    user,
    isLoading: false,
    error: null
  })),

  on(AuthActions.updateUserProfileFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Password Change
  on(AuthActions.changePassword, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.changePasswordSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(AuthActions.changePasswordFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Password Reset
  on(AuthActions.requestPasswordReset, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.requestPasswordResetSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(AuthActions.requestPasswordResetFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(AuthActions.confirmPasswordReset, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.confirmPasswordResetSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(AuthActions.confirmPasswordResetFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Email Verification
  on(AuthActions.verifyEmail, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.verifyEmailSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(AuthActions.verifyEmailFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(AuthActions.resendVerificationEmail, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.resendVerificationEmailSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(AuthActions.resendVerificationEmailFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Permissions
  on(AuthActions.loadUserPermissions, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.loadUserPermissionsSuccess, (state, { permissions }) => ({
    ...state,
    permissions,
    isLoading: false,
    error: null
  })),

  on(AuthActions.loadUserPermissionsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Clear Actions
  on(AuthActions.clearAuthError, (state) => ({
    ...state,
    error: null
  })),

  on(AuthActions.clearAuthState, () => ({
    ...initialAuthState
  })),

  // Auto Login
  on(AuthActions.autoLogin, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(AuthActions.autoLoginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    token,
    permissions: user.role === 'admin' ? ['*'] : [],
    roles: [user.role]
  })),

  on(AuthActions.autoLoginFailure, (state) => ({
    ...state,
    isLoading: false,
    isAuthenticated: false,
    user: null,
    token: null
  }))
);
