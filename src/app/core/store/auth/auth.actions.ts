import { createAction, props } from '@ngrx/store';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../../services/auth.service';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginCredentials }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ response: AuthResponse }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

// Register Actions
export const register = createAction(
  '[Auth] Register',
  props<{ userData: RegisterData }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ response: AuthResponse }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

// Logout Actions
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const logoutFailure = createAction(
  '[Auth] Logout Failure',
  props<{ error: string }>()
);

// Token Actions
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ response: AuthResponse }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: string }>()
);

export const tokenExpired = createAction('[Auth] Token Expired');

// User Profile Actions
export const loadUserProfile = createAction('[Auth] Load User Profile');

export const loadUserProfileSuccess = createAction(
  '[Auth] Load User Profile Success',
  props<{ user: User }>()
);

export const loadUserProfileFailure = createAction(
  '[Auth] Load User Profile Failure',
  props<{ error: string }>()
);

export const updateUserProfile = createAction(
  '[Auth] Update User Profile',
  props<{ updates: Partial<User> }>()
);

export const updateUserProfileSuccess = createAction(
  '[Auth] Update User Profile Success',
  props<{ user: User }>()
);

export const updateUserProfileFailure = createAction(
  '[Auth] Update User Profile Failure',
  props<{ error: string }>()
);

// Password Actions
export const changePassword = createAction(
  '[Auth] Change Password',
  props<{ currentPassword: string; newPassword: string }>()
);

export const changePasswordSuccess = createAction(
  '[Auth] Change Password Success',
  props<{ message: string }>()
);

export const changePasswordFailure = createAction(
  '[Auth] Change Password Failure',
  props<{ error: string }>()
);

// Password Reset Actions
export const requestPasswordReset = createAction(
  '[Auth] Request Password Reset',
  props<{ email: string }>()
);

export const requestPasswordResetSuccess = createAction(
  '[Auth] Request Password Reset Success',
  props<{ message: string }>()
);

export const requestPasswordResetFailure = createAction(
  '[Auth] Request Password Reset Failure',
  props<{ error: string }>()
);

export const confirmPasswordReset = createAction(
  '[Auth] Confirm Password Reset',
  props<{ token: string; newPassword: string }>()
);

export const confirmPasswordResetSuccess = createAction(
  '[Auth] Confirm Password Reset Success',
  props<{ message: string }>()
);

export const confirmPasswordResetFailure = createAction(
  '[Auth] Confirm Password Reset Failure',
  props<{ error: string }>()
);

// Email Verification Actions
export const verifyEmail = createAction(
  '[Auth] Verify Email',
  props<{ token: string }>()
);

export const verifyEmailSuccess = createAction(
  '[Auth] Verify Email Success',
  props<{ message: string }>()
);

export const verifyEmailFailure = createAction(
  '[Auth] Verify Email Failure',
  props<{ error: string }>()
);

export const resendVerificationEmail = createAction(
  '[Auth] Resend Verification Email',
  props<{ email: string }>()
);

export const resendVerificationEmailSuccess = createAction(
  '[Auth] Resend Verification Email Success',
  props<{ message: string }>()
);

export const resendVerificationEmailFailure = createAction(
  '[Auth] Resend Verification Email Failure',
  props<{ error: string }>()
);

// Permissions Actions
export const loadUserPermissions = createAction('[Auth] Load User Permissions');

export const loadUserPermissionsSuccess = createAction(
  '[Auth] Load User Permissions Success',
  props<{ permissions: string[] }>()
);

export const loadUserPermissionsFailure = createAction(
  '[Auth] Load User Permissions Failure',
  props<{ error: string }>()
);

// Clear Actions
export const clearAuthError = createAction('[Auth] Clear Error');

export const clearAuthState = createAction('[Auth] Clear State');

// Auto Login Actions
export const autoLogin = createAction('[Auth] Auto Login');

export const autoLoginSuccess = createAction(
  '[Auth] Auto Login Success',
  props<{ user: User; token: string }>()
);

export const autoLoginFailure = createAction('[Auth] Auto Login Failure');
