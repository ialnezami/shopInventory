import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Basic State Selectors
export const selectUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectIsLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.isLoading
);

export const selectError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.token
);

export const selectRefreshToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.refreshToken
);

export const selectPermissions = createSelector(
  selectAuthState,
  (state: AuthState) => state.permissions
);

export const selectRoles = createSelector(
  selectAuthState,
  (state: AuthState) => state.roles
);

// Computed Selectors
export const selectUserFullName = createSelector(
  selectUser,
  (user) => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim();
  }
);

export const selectUserInitials = createSelector(
  selectUser,
  (user) => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
);

export const selectUserRole = createSelector(
  selectUser,
  (user) => user?.role || null
);

export const selectUserEmail = createSelector(
  selectUser,
  (user) => user?.email || null
);

export const selectIsAdmin = createSelector(
  selectUserRole,
  (role) => role === 'admin'
);

export const selectIsManager = createSelector(
  selectUserRole,
  (role) => role === 'manager' || role === 'admin'
);

export const selectIsStaff = createSelector(
  selectUserRole,
  (role) => role === 'staff' || role === 'manager' || role === 'admin'
);

export const selectHasPermission = createSelector(
  selectPermissions,
  selectIsAdmin,
  (permissions, isAdmin) => (permission: string) => {
    if (isAdmin) return true;
    return permissions.includes(permission);
  }
);

export const selectHasRole = createSelector(
  selectRoles,
  (roles) => (role: string | string[]) => {
    if (Array.isArray(role)) {
      return role.some(r => roles.includes(r));
    }
    return roles.includes(role);
  }
);

export const selectCanAccessProducts = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('products:read')
);

export const selectCanCreateProducts = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('products:write')
);

export const selectCanUpdateProducts = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('products:write')
);

export const selectCanDeleteProducts = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('products:delete')
);

export const selectCanAccessSales = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('sales:read')
);

export const selectCanCreateSales = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('sales:write')
);

export const selectCanAccessCustomers = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('customers:read')
);

export const selectCanCreateCustomers = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('customers:write')
);

export const selectCanUpdateCustomers = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('customers:write')
);

export const selectCanDeleteCustomers = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('customers:delete')
);

export const selectCanAccessReports = createSelector(
  selectHasPermission,
  (hasPermission) => hasPermission('reports:read')
);

export const selectCanAccessAdmin = createSelector(
  selectIsAdmin,
  (isAdmin) => isAdmin
);

// Auth Status Selectors
export const selectAuthStatus = createSelector(
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  (isAuthenticated, isLoading, error) => ({
    isAuthenticated,
    isLoading,
    hasError: !!error,
    error
  })
);

export const selectLoginStatus = createSelector(
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  (isAuthenticated, isLoading, error) => ({
    isLoggedIn: isAuthenticated,
    isLoading,
    hasError: !!error,
    error
  })
);

// User Profile Selectors
export const selectUserProfile = createSelector(
  selectUser,
  selectIsLoading,
  selectError,
  (user, isLoading, error) => ({
    user,
    isLoading,
    hasError: !!error,
    error
  })
);

// Token Status Selectors
export const selectTokenStatus = createSelector(
  selectToken,
  selectRefreshToken,
  selectIsAuthenticated,
  (token, refreshToken, isAuthenticated) => ({
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    isAuthenticated
  })
);
