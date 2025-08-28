import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from './ui.state';

export const selectUIState = createFeatureSelector<UIState>('ui');

// Basic State Selectors
export const selectLoading = createSelector(
  selectUIState,
  (state: UIState) => state.loading
);

export const selectGlobalLoading = createSelector(
  selectUIState,
  (state: UIState) => state.globalLoading
);

export const selectNotifications = createSelector(
  selectUIState,
  (state: UIState) => state.notifications
);

export const selectUnreadNotifications = createSelector(
  selectUIState,
  (state: UIState) => state.unreadNotifications
);

export const selectSidebarCollapsed = createSelector(
  selectUIState,
  (state: UIState) => state.sidebarCollapsed
);

export const selectSidebarExpanded = createSelector(
  selectUIState,
  (state: UIState) => state.sidebarExpanded
);

export const selectTheme = createSelector(
  selectUIState,
  (state: UIState) => state.theme
);

export const selectColorScheme = createSelector(
  selectUIState,
  (state: UIState) => state.colorScheme
);

export const selectActiveModals = createSelector(
  selectUIState,
  (state: UIState) => state.activeModals
);

export const selectToasts = createSelector(
  selectUIState,
  (state: UIState) => state.toasts
);

export const selectGlobalSearchQuery = createSelector(
  selectUIState,
  (state: UIState) => state.globalSearchQuery
);

export const selectGlobalSearchActive = createSelector(
  selectUIState,
  (state: UIState) => state.globalSearchActive
);

export const selectBreadcrumbs = createSelector(
  selectUIState,
  (state: UIState) => state.breadcrumbs
);

export const selectPageTitle = createSelector(
  selectUIState,
  (state: UIState) => state.pageTitle
);

export const selectIsMobile = createSelector(
  selectUIState,
  (state: UIState) => state.isMobile
);

export const selectIsTablet = createSelector(
  selectUIState,
  (state: UIState) => state.isTablet
);

export const selectIsDesktop = createSelector(
  selectUIState,
  (state: UIState) => state.isDesktop
);

export const selectKeyboardShortcutsEnabled = createSelector(
  selectUIState,
  (state: UIState) => state.keyboardShortcutsEnabled
);

export const selectHighContrast = createSelector(
  selectUIState,
  (state: UIState) => state.highContrast
);

export const selectReducedMotion = createSelector(
  selectUIState,
  (state: UIState) => state.reducedMotion
);

export const selectFontSize = createSelector(
  selectUIState,
  (state: UIState) => state.fontSize
);

export const selectAnimationsEnabled = createSelector(
  selectUIState,
  (state: UIState) => state.animationsEnabled
);

export const selectLazyLoadingEnabled = createSelector(
  selectUIState,
  (state: UIState) => state.lazyLoadingEnabled
);

// Computed Selectors
export const selectHasNotifications = createSelector(
  selectNotifications,
  (notifications) => notifications.length > 0
);

export const selectHasUnreadNotifications = createSelector(
  selectUnreadNotifications,
  (count) => count > 0
);

export const selectHasActiveModals = createSelector(
  selectActiveModals,
  (modals) => modals.length > 0
);

export const selectHasToasts = createSelector(
  selectToasts,
  (toasts) => toasts.length > 0
);

export const selectHasBreadcrumbs = createSelector(
  selectBreadcrumbs,
  (breadcrumbs) => breadcrumbs.length > 0
);

export const selectIsDarkTheme = createSelector(
  selectTheme,
  (theme) => theme === 'dark'
);

export const selectIsLightTheme = createSelector(
  selectTheme,
  (theme) => theme === 'light'
);

export const selectIsAutoTheme = createSelector(
  selectTheme,
  (theme) => theme === 'auto'
);

export const selectIsSidebarVisible = createSelector(
  selectSidebarCollapsed,
  selectSidebarExpanded,
  (collapsed, expanded) => !collapsed || expanded
);

export const selectIsSidebarHidden = createSelector(
  selectSidebarCollapsed,
  selectSidebarExpanded,
  (collapsed, expanded) => collapsed && !expanded
);

// Loading State Selectors
export const selectIsLoading = createSelector(
  selectLoading,
  (loading) => (key: string) => loading[key] || false
);

export const selectAnyLoading = createSelector(
  selectLoading,
  selectGlobalLoading,
  (loading, globalLoading) => {
    if (globalLoading) return true;
    return Object.values(loading).some(isLoading => isLoading);
  }
);

export const selectLoadingKeys = createSelector(
  selectLoading,
  (loading) => Object.keys(loading).filter(key => loading[key])
);

export const selectLoadingCount = createSelector(
  selectLoading,
  (loading) => Object.values(loading).filter(isLoading => isLoading).length
);

// Notification Selectors
export const selectNotificationsByType = createSelector(
  selectNotifications,
  (notifications) => (type: string) => notifications.filter(n => n.type === type)
);

export const selectUnreadNotificationsByType = createSelector(
  selectNotifications,
  (notifications) => (type: string) => notifications.filter(n => n.type === type && !n.read)
);

export const selectNotificationCount = createSelector(
  selectNotifications,
  (notifications) => (type?: string) => {
    if (type) {
      return notifications.filter(n => n.type === type).length;
    }
    return notifications.length;
  }
);

export const selectUnreadNotificationCount = createSelector(
  selectNotifications,
  (notifications) => (type?: string) => {
    if (type) {
      return notifications.filter(n => n.type === type && !n.read).length;
    }
    return notifications.filter(n => !n.read).length;
  }
);

export const selectLatestNotification = createSelector(
  selectNotifications,
  (notifications) => notifications.length > 0 ? notifications[0] : null
);

export const selectLatestUnreadNotification = createSelector(
  selectNotifications,
  (notifications) => notifications.find(n => !n.read) || null
);

// Toast Selectors
export const selectToastsByType = createSelector(
  selectToasts,
  (toasts) => (type: string) => toasts.filter(t => t.type === type)
);

export const selectToastCount = createSelector(
  selectToasts,
  (toasts) => (type?: string) => {
    if (type) {
      return toasts.filter(t => t.type === type).length;
    }
    return toasts.length;
  }
);

export const selectLatestToast = createSelector(
  selectToasts,
  (toasts) => toasts.length > 0 ? toasts[toasts.length - 1] : null
);

// Search Selectors
export const selectHasSearchQuery = createSelector(
  selectGlobalSearchQuery,
  (query) => query.trim().length > 0
);

export const selectSearchQueryLength = createSelector(
  selectGlobalSearchQuery,
  (query) => query.length
);

export const selectIsSearchActive = createSelector(
  selectGlobalSearchActive,
  selectHasSearchQuery,
  (active, hasQuery) => active && hasQuery
);

// Breadcrumb Selectors
export const selectActiveBreadcrumb = createSelector(
  selectBreadcrumbs,
  (breadcrumbs) => breadcrumbs.find(b => b.active) || null
);

export const selectBreadcrumbPath = createSelector(
  selectBreadcrumbs,
  (breadcrumbs) => breadcrumbs.map(b => b.label).join(' > ')
);

export const selectBreadcrumbUrls = createSelector(
  selectBreadcrumbs,
  (breadcrumbs) => breadcrumbs.map(b => b.url)
);

// Responsive Selectors
export const selectIsMobileOrTablet = createSelector(
  selectIsMobile,
  selectIsTablet,
  (isMobile, isTablet) => isMobile || isTablet
);

export const selectIsDesktopOrTablet = createSelector(
  selectIsDesktop,
  selectIsTablet,
  (isDesktop, isTablet) => isDesktop || isTablet
);

export const selectDeviceType = createSelector(
  selectIsMobile,
  selectIsTablet,
  selectIsDesktop,
  (isMobile, isTablet, isDesktop) => {
    if (isMobile) return 'mobile';
    if (isTablet) return 'tablet';
    if (isDesktop) return 'desktop';
    return 'unknown';
  }
);

// Theme and Appearance Selectors
export const selectThemeClass = createSelector(
  selectTheme,
  selectColorScheme,
  (theme, colorScheme) => `theme-${theme} color-${colorScheme}`
);

export const selectIsHighContrast = createSelector(
  selectHighContrast,
  (highContrast) => highContrast
);

export const selectIsReducedMotion = createSelector(
  selectReducedMotion,
  (reducedMotion) => reducedMotion
);

export const selectFontSizeClass = createSelector(
  selectFontSize,
  (fontSize) => `font-size-${fontSize}`
);

// Performance Selectors
export const selectAreAnimationsEnabled = createSelector(
  selectAnimationsEnabled,
  selectReducedMotion,
  (animationsEnabled, reducedMotion) => animationsEnabled && !reducedMotion
);

export const selectIsLazyLoadingEnabled = createSelector(
  selectLazyLoadingEnabled,
  (lazyLoadingEnabled) => lazyLoadingEnabled
);

// Accessibility Selectors
export const selectAccessibilityFeatures = createSelector(
  selectHighContrast,
  selectReducedMotion,
  selectFontSize,
  (highContrast, reducedMotion, fontSize) => ({
    highContrast,
    reducedMotion,
    fontSize
  })
);

export const selectAccessibilityClass = createSelector(
  selectHighContrast,
  selectReducedMotion,
  selectFontSize,
  (highContrast, reducedMotion, fontSize) => {
    const classes = [];
    if (highContrast) classes.push('high-contrast');
    if (reducedMotion) classes.push('reduced-motion');
    classes.push(`font-size-${fontSize}`);
    return classes.join(' ');
  }
);

// UI State Status Selectors
export const selectUIStateStatus = createSelector(
  selectGlobalLoading,
  selectAnyLoading,
  selectHasNotifications,
  selectHasUnreadNotifications,
  selectHasActiveModals,
  selectHasToasts,
  selectHasBreadcrumbs,
  (globalLoading, anyLoading, hasNotifications, hasUnreadNotifications, hasActiveModals, hasToasts, hasBreadcrumbs) => ({
    globalLoading,
    anyLoading,
    hasNotifications,
    hasUnreadNotifications,
    hasActiveModals,
    hasToasts,
    hasBreadcrumbs,
    isBusy: globalLoading || anyLoading || hasActiveModals
  })
);

export const selectSidebarStatus = createSelector(
  selectSidebarCollapsed,
  selectSidebarExpanded,
  selectIsMobile,
  (collapsed, expanded, isMobile) => ({
    collapsed,
    expanded,
    isMobile,
    isVisible: !collapsed || expanded,
    isHidden: collapsed && !expanded,
    shouldAutoCollapse: isMobile
  })
);

export const selectThemeStatus = createSelector(
  selectTheme,
  selectColorScheme,
  selectIsDarkTheme,
  selectIsLightTheme,
  selectIsAutoTheme,
  (theme, colorScheme, isDark, isLight, isAuto) => ({
    theme,
    colorScheme,
    isDark,
    isLight,
    isAuto,
    themeClass: `theme-${theme}`,
    colorClass: `color-${colorScheme}`
  })
);

export const selectResponsiveStatus = createSelector(
  selectIsMobile,
  selectIsTablet,
  selectIsDesktop,
  selectDeviceType,
  selectIsMobileOrTablet,
  selectIsDesktopOrTablet,
  (isMobile, isTablet, isDesktop, deviceType, isMobileOrTablet, isDesktopOrTablet) => ({
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    isMobileOrTablet,
    isDesktopOrTablet,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'
  })
);
