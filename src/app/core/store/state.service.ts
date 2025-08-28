import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from './app.state';

// Auth Selectors
import * as AuthSelectors from './auth/auth.selectors';

// Auth Actions
import * as AuthActions from './auth/auth.actions';

// UI Actions
import * as UIActions from './ui/ui.actions';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  constructor(private store: Store<AppState>) {}

  // Auth State Getters
  get isAuthenticated$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectIsAuthenticated);
  }

  get user$(): Observable<any> {
    return this.store.select(AuthSelectors.selectUser);
  }

  get userRole$(): Observable<string | null> {
    return this.store.select(AuthSelectors.selectUserRole);
  }

  get isAdmin$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectIsAdmin);
  }

  get isManager$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectIsManager);
  }

  get isStaff$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectIsStaff);
  }

  get authLoading$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectIsLoading);
  }

  get authError$(): Observable<string | null> {
    return this.store.select(AuthSelectors.selectError);
  }

  get userFullName$(): Observable<string> {
    return this.store.select(AuthSelectors.selectUserFullName);
  }

  get userInitials$(): Observable<string> {
    return this.store.select(AuthSelectors.selectUserInitials);
  }

  get permissions$(): Observable<string[]> {
    return this.store.select(AuthSelectors.selectPermissions);
  }

  get roles$(): Observable<string[]> {
    return this.store.select(AuthSelectors.selectRoles);
  }

  // Permission Checkers
  get hasPermission$(): Observable<(permission: string) => boolean> {
    return this.store.select(AuthSelectors.selectHasPermission);
  }

  get hasRole$(): Observable<(role: string | string[]) => boolean> {
    return this.store.select(AuthSelectors.selectHasRole);
  }

  // Specific Permission Getters
  get canAccessProducts$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanAccessProducts);
  }

  get canCreateProducts$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanCreateProducts);
  }

  get canUpdateProducts$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanUpdateProducts);
  }

  get canDeleteProducts$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanDeleteProducts);
  }

  get canAccessSales$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanAccessSales);
  }

  get canCreateSales$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanCreateSales);
  }

  get canAccessCustomers$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanAccessCustomers);
  }

  get canCreateCustomers$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanCreateCustomers);
  }

  get canUpdateCustomers$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanUpdateCustomers);
  }

  get canDeleteCustomers$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanDeleteCustomers);
  }

  get canAccessReports$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanAccessReports);
  }

  get canAccessAdmin$(): Observable<boolean> {
    return this.store.select(AuthSelectors.selectCanAccessAdmin);
  }

  // Auth State Methods
  login(credentials: any): void {
    this.store.dispatch(AuthActions.login({ credentials }));
  }

  register(userData: any): void {
    this.store.dispatch(AuthActions.register({ userData }));
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  refreshToken(): void {
    this.store.dispatch(AuthActions.refreshToken());
  }

  loadUserProfile(): void {
    this.store.dispatch(AuthActions.loadUserProfile());
  }

  updateUserProfile(updates: any): void {
    this.store.dispatch(AuthActions.updateUserProfile({ updates }));
  }

  changePassword(currentPassword: string, newPassword: string): void {
    this.store.dispatch(AuthActions.changePassword({ currentPassword, newPassword }));
  }

  requestPasswordReset(email: string): void {
    this.store.dispatch(AuthActions.requestPasswordReset({ email }));
  }

  confirmPasswordReset(token: string, newPassword: string): void {
    this.store.dispatch(AuthActions.confirmPasswordReset({ token, newPassword }));
  }

  verifyEmail(token: string): void {
    this.store.dispatch(AuthActions.verifyEmail({ token }));
  }

  resendVerificationEmail(email: string): void {
    this.store.dispatch(AuthActions.resendVerificationEmail({ email }));
  }

  loadUserPermissions(): void {
    this.store.dispatch(AuthActions.loadUserPermissions());
  }

  autoLogin(): void {
    this.store.dispatch(AuthActions.autoLogin());
  }

  clearAuthError(): void {
    this.store.dispatch(AuthActions.clearAuthError());
  }

  clearAuthState(): void {
    this.store.dispatch(AuthActions.clearAuthState());
  }

  // UI State Methods
  showSuccessToast(message: string, duration: number = 3000): void {
    this.store.dispatch(UIActions.showToast({ type: 'success', message, duration }));
  }

  showErrorToast(message: string, duration: number = 5000): void {
    this.store.dispatch(UIActions.showToast({ type: 'error', message, duration }));
  }

  showWarningToast(message: string, duration: number = 4000): void {
    this.store.dispatch(UIActions.showToast({ type: 'warning', message, duration }));
  }

  showInfoToast(message: string, duration: number = 3000): void {
    this.store.dispatch(UIActions.showToast({ type: 'info', message, duration }));
  }

  setLoading(key: string, loading: boolean): void {
    this.store.dispatch(UIActions.setLoading({ key, loading }));
  }

  setGlobalLoading(loading: boolean): void {
    this.store.dispatch(UIActions.setGlobalLoading({ loading }));
  }

  clearLoading(key: string): void {
    this.store.dispatch(UIActions.clearLoading({ key }));
  }

  clearAllLoading(): void {
    this.store.dispatch(UIActions.clearAllLoading());
  }

  addNotification(notification: any): void {
    this.store.dispatch(UIActions.addNotification({ notification }));
  }

  removeNotification(id: string): void {
    this.store.dispatch(UIActions.removeNotification({ id }));
  }

  markNotificationAsRead(id: string): void {
    this.store.dispatch(UIActions.markNotificationAsRead({ id }));
  }

  markAllNotificationsAsRead(): void {
    this.store.dispatch(UIActions.markAllNotificationsAsRead());
  }

  clearNotifications(): void {
    this.store.dispatch(UIActions.clearNotifications());
  }

  toggleSidebar(): void {
    this.store.dispatch(UIActions.toggleSidebar());
  }

  collapseSidebar(): void {
    this.store.dispatch(UIActions.collapseSidebar());
  }

  expandSidebar(): void {
    this.store.dispatch(UIActions.expandSidebar());
  }

  setSidebarCollapsed(collapsed: boolean): void {
    this.store.dispatch(UIActions.setSidebarCollapsed({ collapsed }));
  }

  setSidebarExpanded(expanded: boolean): void {
    this.store.dispatch(UIActions.setSidebarExpanded({ expanded }));
  }

  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.store.dispatch(UIActions.setTheme({ theme }));
  }

  setColorScheme(colorScheme: 'blue' | 'green' | 'purple' | 'orange'): void {
    this.store.dispatch(UIActions.setColorScheme({ colorScheme }));
  }

  toggleTheme(): void {
    this.store.dispatch(UIActions.toggleTheme());
  }

  openModal(modalId: string): void {
    this.store.dispatch(UIActions.openModal({ modalId }));
  }

  closeModal(modalId: string): void {
    this.store.dispatch(UIActions.closeModal({ modalId }));
  }

  closeAllModals(): void {
    this.store.dispatch(UIActions.closeAllModals());
  }

  setGlobalSearchQuery(query: string): void {
    this.store.dispatch(UIActions.setGlobalSearchQuery({ query }));
  }

  clearGlobalSearch(): void {
    this.store.dispatch(UIActions.clearGlobalSearch());
  }

  setGlobalSearchActive(active: boolean): void {
    this.store.dispatch(UIActions.setGlobalSearchActive({ active }));
  }

  toggleGlobalSearch(): void {
    this.store.dispatch(UIActions.toggleGlobalSearch());
  }

  setBreadcrumbs(breadcrumbs: Array<{ label: string; url: string; active: boolean }>): void {
    this.store.dispatch(UIActions.setBreadcrumbs({ breadcrumbs }));
  }

  addBreadcrumb(breadcrumb: { label: string; url: string; active: boolean }): void {
    this.store.dispatch(UIActions.addBreadcrumb({ breadcrumb }));
  }

  clearBreadcrumbs(): void {
    this.store.dispatch(UIActions.clearBreadcrumbs());
  }

  setPageTitle(title: string): void {
    this.store.dispatch(UIActions.setPageTitle({ title }));
  }

  resetPageTitle(): void {
    this.store.dispatch(UIActions.resetPageTitle());
  }

  setResponsiveState(isMobile: boolean, isTablet: boolean, isDesktop: boolean): void {
    this.store.dispatch(UIActions.setResponsiveState({ isMobile, isTablet, isDesktop }));
  }

  setKeyboardShortcutsEnabled(enabled: boolean): void {
    this.store.dispatch(UIActions.setKeyboardShortcutsEnabled({ enabled }));
  }

  setHighContrast(enabled: boolean): void {
    this.store.dispatch(UIActions.setHighContrast({ enabled }));
  }

  setReducedMotion(enabled: boolean): void {
    this.store.dispatch(UIActions.setReducedMotion({ enabled }));
  }

  setFontSize(size: 'small' | 'medium' | 'large'): void {
    this.store.dispatch(UIActions.setFontSize({ size }));
  }

  increaseFontSize(): void {
    this.store.dispatch(UIActions.increaseFontSize());
  }

  decreaseFontSize(): void {
    this.store.dispatch(UIActions.decreaseFontSize());
  }

  setAnimationsEnabled(enabled: boolean): void {
    this.store.dispatch(UIActions.setAnimationsEnabled({ enabled }));
  }

  setLazyLoadingEnabled(enabled: boolean): void {
    this.store.dispatch(UIActions.setLazyLoadingEnabled({ enabled }));
  }

  resetUIState(): void {
    this.store.dispatch(UIActions.resetUIState());
  }

  resetTheme(): void {
    this.store.dispatch(UIActions.resetTheme());
  }

  resetAccessibility(): void {
    this.store.dispatch(UIActions.resetAccessibility());
  }

  resetPerformance(): void {
    this.store.dispatch(UIActions.resetPerformance());
  }

  loadUIState(): void {
    this.store.dispatch(UIActions.loadUIState());
  }

  saveUIState(): void {
    this.store.dispatch(UIActions.saveUIState());
  }

  setUIError(error: string): void {
    this.store.dispatch(UIActions.setUIError({ error }));
  }

  clearUIError(): void {
    this.store.dispatch(UIActions.clearUIError());
  }

  setUISuccess(message: string): void {
    this.store.dispatch(UIActions.setUISuccess({ message }));
  }

  clearUISuccess(): void {
    this.store.dispatch(UIActions.clearUISuccess());
  }

  setUIWarning(message: string): void {
    this.store.dispatch(UIActions.setUIWarning({ message }));
  }

  clearUIWarning(): void {
    this.store.dispatch(UIActions.clearUIWarning());
  }

  setUIInfo(message: string): void {
    this.store.dispatch(UIActions.setUIInfo({ message }));
  }

  clearUIInfo(): void {
    this.store.dispatch(UIActions.clearUIInfo());
  }

  // Utility Methods
  dispatch(action: any): void {
    this.store.dispatch(action);
  }

  select<T>(selector: any): Observable<T> {
    return this.store.select(selector);
  }
}
