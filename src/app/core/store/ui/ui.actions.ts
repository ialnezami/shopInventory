import { createAction, props } from '@ngrx/store';
import { Notification } from './ui.state';

// Loading Actions
export const setLoading = createAction(
  '[UI] Set Loading',
  props<{ key: string; loading: boolean }>()
);

export const setGlobalLoading = createAction(
  '[UI] Set Global Loading',
  props<{ loading: boolean }>()
);

export const clearLoading = createAction(
  '[UI] Clear Loading',
  props<{ key: string }>()
);

export const clearAllLoading = createAction('[UI] Clear All Loading');

// Notification Actions
export const addNotification = createAction(
  '[UI] Add Notification',
  props<{ notification: Omit<Notification, 'id' | 'timestamp' | 'read'> }>()
);

export const addNotificationSuccess = createAction(
  '[UI] Add Notification Success',
  props<{ notification: Notification }>()
);

export const removeNotification = createAction(
  '[UI] Remove Notification',
  props<{ id: string }>()
);

export const markNotificationAsRead = createAction(
  '[UI] Mark Notification As Read',
  props<{ id: string }>()
);

export const markAllNotificationsAsRead = createAction('[UI] Mark All Notifications As Read');

export const clearNotifications = createAction('[UI] Clear Notifications');

export const clearNotificationsByType = createAction(
  '[UI] Clear Notifications By Type',
  props<{ type: Notification['type'] }>()
);

// Sidebar Actions
export const toggleSidebar = createAction('[UI] Toggle Sidebar');

export const collapseSidebar = createAction('[UI] Collapse Sidebar');

export const expandSidebar = createAction('[UI] Expand Sidebar');

export const setSidebarCollapsed = createAction(
  '[UI] Set Sidebar Collapsed',
  props<{ collapsed: boolean }>()
);

export const setSidebarExpanded = createAction(
  '[UI] Set Sidebar Expanded',
  props<{ expanded: boolean }>()
);

// Theme Actions
export const setTheme = createAction(
  '[UI] Set Theme',
  props<{ theme: 'light' | 'dark' | 'auto' }>()
);

export const setColorScheme = createAction(
  '[UI] Set Color Scheme',
  props<{ colorScheme: 'blue' | 'green' | 'purple' | 'orange' }>()
);

export const toggleTheme = createAction('[UI] Toggle Theme');

// Modal Actions
export const openModal = createAction(
  '[UI] Open Modal',
  props<{ modalId: string }>()
);

export const closeModal = createAction(
  '[UI] Close Modal',
  props<{ modalId: string }>()
);

export const closeAllModals = createAction('[UI] Close All Modals');

// Toast Actions
export const showToast = createAction(
  '[UI] Show Toast',
  props<{ 
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }>()
);

export const hideToast = createAction(
  '[UI] Hide Toast',
  props<{ id: string }>()
);

export const clearToasts = createAction('[UI] Clear Toasts');

// Search Actions
export const setGlobalSearchQuery = createAction(
  '[UI] Set Global Search Query',
  props<{ query: string }>()
);

export const clearGlobalSearch = createAction('[UI] Clear Global Search');

export const setGlobalSearchActive = createAction(
  '[UI] Set Global Search Active',
  props<{ active: boolean }>()
);

export const toggleGlobalSearch = createAction('[UI] Toggle Global Search');

// Breadcrumb Actions
export const setBreadcrumbs = createAction(
  '[UI] Set Breadcrumbs',
  props<{ breadcrumbs: Array<{ label: string; url: string; active: boolean }> }>()
);

export const addBreadcrumb = createAction(
  '[UI] Add Breadcrumb',
  props<{ breadcrumb: { label: string; url: string; active: boolean } }>()
);

export const clearBreadcrumbs = createAction('[UI] Clear Breadcrumbs');

export const updateBreadcrumb = createAction(
  '[UI] Update Breadcrumb',
  props<{ index: number; breadcrumb: { label: string; url: string; active: boolean } }>()
);

// Page Title Actions
export const setPageTitle = createAction(
  '[UI] Set Page Title',
  props<{ title: string }>()
);

export const resetPageTitle = createAction('[UI] Reset Page Title');

// Responsive Actions
export const setResponsiveState = createAction(
  '[UI] Set Responsive State',
  props<{ 
    isMobile: boolean; 
    isTablet: boolean; 
    isDesktop: boolean; 
  }>()
);

export const setMobile = createAction(
  '[UI] Set Mobile',
  props<{ isMobile: boolean }>()
);

export const setTablet = createAction(
  '[UI] Set Tablet',
  props<{ isTablet: boolean }>()
);

export const setDesktop = createAction(
  '[UI] Set Desktop',
  props<{ isDesktop: boolean }>()
);

// Keyboard Shortcuts Actions
export const toggleKeyboardShortcuts = createAction('[UI] Toggle Keyboard Shortcuts');

export const setKeyboardShortcutsEnabled = createAction(
  '[UI] Set Keyboard Shortcuts Enabled',
  props<{ enabled: boolean }>()
);

// Accessibility Actions
export const setHighContrast = createAction(
  '[UI] Set High Contrast',
  props<{ enabled: boolean }>()
);

export const setReducedMotion = createAction(
  '[UI] Set Reduced Motion',
  props<{ enabled: boolean }>()
);

export const setFontSize = createAction(
  '[UI] Set Font Size',
  props<{ size: 'small' | 'medium' | 'large' }>()
);

export const increaseFontSize = createAction('[UI] Increase Font Size');

export const decreaseFontSize = createAction('[UI] Decrease Font Size');

// Performance Actions
export const toggleAnimations = createAction('[UI] Toggle Animations');

export const setAnimationsEnabled = createAction(
  '[UI] Set Animations Enabled',
  props<{ enabled: boolean }>()
);

export const toggleLazyLoading = createAction('[UI] Toggle Lazy Loading');

export const setLazyLoadingEnabled = createAction(
  '[UI] Set Lazy Loading Enabled',
  props<{ enabled: boolean }>()
);

// Reset Actions
export const resetUIState = createAction('[UI] Reset State');

export const resetTheme = createAction('[UI] Reset Theme');

export const resetAccessibility = createAction('[UI] Reset Accessibility');

export const resetPerformance = createAction('[UI] Reset Performance');

// Persistence Actions
export const loadUIState = createAction('[UI] Load State');

export const saveUIState = createAction('[UI] Save State');

// Error Actions
export const setUIError = createAction(
  '[UI] Set Error',
  props<{ error: string }>()
);

export const clearUIError = createAction('[UI] Clear Error');

// Success Actions
export const setUISuccess = createAction(
  '[UI] Set Success',
  props<{ message: string }>()
);

export const clearUISuccess = createAction('[UI] Clear Success');

// Warning Actions
export const setUIWarning = createAction(
  '[UI] Set Warning',
  props<{ message: string }>()
);

export const clearUIWarning = createAction('[UI] Clear Warning');

// Info Actions
export const setUIInfo = createAction(
  '[UI] Set Info',
  props<{ message: string }>()
);

export const clearUIInfo = createAction('[UI] Clear Info');
