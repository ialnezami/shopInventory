import { createReducer, on } from '@ngrx/store';
import { UIState, initialUIState } from './ui.state';
import * as UIActions from './ui.actions';

export const uiReducer = createReducer(
  initialUIState,

  // Loading Actions
  on(UIActions.setLoading, (state, { key, loading }) => ({
    ...state,
    loading: {
      ...state.loading,
      [key]: loading
    }
  })),

  on(UIActions.setGlobalLoading, (state, { loading }) => ({
    ...state,
    globalLoading: loading
  })),

  on(UIActions.clearLoading, (state, { key }) => {
    const newLoading = { ...state.loading };
    delete newLoading[key];
    return {
      ...state,
      loading: newLoading
    };
  }),

  on(UIActions.clearAllLoading, (state) => ({
    ...state,
    loading: {},
    globalLoading: false
  })),

  // Notification Actions
  on(UIActions.addNotification, (state, { notification }) => {
    const newNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    return {
      ...state,
      notifications: [newNotification, ...state.notifications],
      unreadNotifications: state.unreadNotifications + 1
    };
  }),

  on(UIActions.addNotificationSuccess, (state, { notification }) => ({
    ...state,
    notifications: [notification, ...state.notifications],
    unreadNotifications: state.unreadNotifications + 1
  })),

  on(UIActions.removeNotification, (state, { id }) => {
    const notification = state.notifications.find(n => n.id === id);
    const wasUnread = notification && !notification.read;
    return {
      ...state,
      notifications: state.notifications.filter(n => n.id !== id),
      unreadNotifications: wasUnread ? state.unreadNotifications - 1 : state.unreadNotifications
    };
  }),

  on(UIActions.markNotificationAsRead, (state, { id }) => {
    const wasUnread = state.notifications.find(n => n.id === id)?.read === false;
    return {
      ...state,
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ),
      unreadNotifications: wasUnread ? state.unreadNotifications - 1 : state.unreadNotifications
    };
  }),

  on(UIActions.markAllNotificationsAsRead, (state) => ({
    ...state,
    notifications: state.notifications.map(n => ({ ...n, read: true })),
    unreadNotifications: 0
  })),

  on(UIActions.clearNotifications, (state) => ({
    ...state,
    notifications: [],
    unreadNotifications: 0
  })),

  on(UIActions.clearNotificationsByType, (state, { type }) => {
    const removedCount = state.notifications.filter(n => n.type === type && !n.read).length;
    return {
      ...state,
      notifications: state.notifications.filter(n => n.type !== type),
      unreadNotifications: state.unreadNotifications - removedCount
    };
  }),

  // Sidebar Actions
  on(UIActions.toggleSidebar, (state) => ({
    ...state,
    sidebarCollapsed: !state.sidebarCollapsed,
    sidebarExpanded: !state.sidebarCollapsed
  })),

  on(UIActions.collapseSidebar, (state) => ({
    ...state,
    sidebarCollapsed: true,
    sidebarExpanded: false
  })),

  on(UIActions.expandSidebar, (state) => ({
    ...state,
    sidebarCollapsed: false,
    sidebarExpanded: true
  })),

  on(UIActions.setSidebarCollapsed, (state, { collapsed }) => ({
    ...state,
    sidebarCollapsed: collapsed,
    sidebarExpanded: !collapsed
  })),

  on(UIActions.setSidebarExpanded, (state, { expanded }) => ({
    ...state,
    sidebarExpanded: expanded,
    sidebarCollapsed: !expanded
  })),

  // Theme Actions
  on(UIActions.setTheme, (state, { theme }) => ({
    ...state,
    theme
  })),

  on(UIActions.setColorScheme, (state, { colorScheme }) => ({
    ...state,
    colorScheme
  })),

  on(UIActions.toggleTheme, (state) => ({
    ...state,
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),

  // Modal Actions
  on(UIActions.openModal, (state, { modalId }) => ({
    ...state,
    activeModals: [...state.activeModals, modalId]
  })),

  on(UIActions.closeModal, (state, { modalId }) => ({
    ...state,
    activeModals: state.activeModals.filter(id => id !== modalId)
  })),

  on(UIActions.closeAllModals, (state) => ({
    ...state,
    activeModals: []
  })),

  // Toast Actions
  on(UIActions.showToast, (state, { type, message, duration = 3000 }) => {
    const newToast = {
      id: Date.now().toString(),
      type,
      message,
      duration,
      timestamp: new Date()
    };
    return {
      ...state,
      toasts: [...state.toasts, newToast]
    };
  }),

  on(UIActions.hideToast, (state, { id }) => ({
    ...state,
    toasts: state.toasts.filter(t => t.id !== id)
  })),

  on(UIActions.clearToasts, (state) => ({
    ...state,
    toasts: []
  })),

  // Search Actions
  on(UIActions.setGlobalSearchQuery, (state, { query }) => ({
    ...state,
    globalSearchQuery: query
  })),

  on(UIActions.clearGlobalSearch, (state) => ({
    ...state,
    globalSearchQuery: '',
    globalSearchActive: false
  })),

  on(UIActions.setGlobalSearchActive, (state, { active }) => ({
    ...state,
    globalSearchActive: active
  })),

  on(UIActions.toggleGlobalSearch, (state) => ({
    ...state,
    globalSearchActive: !state.globalSearchActive
  })),

  // Breadcrumb Actions
  on(UIActions.setBreadcrumbs, (state, { breadcrumbs }) => ({
    ...state,
    breadcrumbs
  })),

  on(UIActions.addBreadcrumb, (state, { breadcrumb }) => ({
    ...state,
    breadcrumbs: [...state.breadcrumbs, breadcrumb]
  })),

  on(UIActions.clearBreadcrumbs, (state) => ({
    ...state,
    breadcrumbs: []
  })),

  on(UIActions.updateBreadcrumb, (state, { index, breadcrumb }) => ({
    ...state,
    breadcrumbs: state.breadcrumbs.map((b, i) => i === index ? breadcrumb : b)
  })),

  // Page Title Actions
  on(UIActions.setPageTitle, (state, { title }) => ({
    ...state,
    pageTitle: title
  })),

  on(UIActions.resetPageTitle, (state) => ({
    ...state,
    pageTitle: initialUIState.pageTitle
  })),

  // Responsive Actions
  on(UIActions.setResponsiveState, (state, { isMobile, isTablet, isDesktop }) => ({
    ...state,
    isMobile,
    isTablet,
    isDesktop
  })),

  on(UIActions.setMobile, (state, { isMobile }) => ({
    ...state,
    isMobile,
    isTablet: !isMobile,
    isDesktop: !isMobile
  })),

  on(UIActions.setTablet, (state, { isTablet }) => ({
    ...state,
    isTablet,
    isMobile: !isTablet,
    isDesktop: !isTablet
  })),

  on(UIActions.setDesktop, (state, { isDesktop }) => ({
    ...state,
    isDesktop,
    isMobile: !isDesktop,
    isTablet: !isDesktop
  })),

  // Keyboard Shortcuts Actions
  on(UIActions.toggleKeyboardShortcuts, (state) => ({
    ...state,
    keyboardShortcutsEnabled: !state.keyboardShortcutsEnabled
  })),

  on(UIActions.setKeyboardShortcutsEnabled, (state, { enabled }) => ({
    ...state,
    keyboardShortcutsEnabled: enabled
  })),

  // Accessibility Actions
  on(UIActions.setHighContrast, (state, { enabled }) => ({
    ...state,
    highContrast: enabled
  })),

  on(UIActions.setReducedMotion, (state, { enabled }) => ({
    ...state,
    reducedMotion: enabled
  })),

  on(UIActions.setFontSize, (state, { size }) => ({
    ...state,
    fontSize: size
  })),

  on(UIActions.increaseFontSize, (state) => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(state.fontSize);
    const newSize = sizes[Math.min(currentIndex + 1, sizes.length - 1)];
    return {
      ...state,
      fontSize: newSize
    };
  }),

  on(UIActions.decreaseFontSize, (state) => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(state.fontSize);
    const newSize = sizes[Math.max(currentIndex - 1, 0)];
    return {
      ...state,
      fontSize: newSize
    };
  }),

  // Performance Actions
  on(UIActions.toggleAnimations, (state) => ({
    ...state,
    animationsEnabled: !state.animationsEnabled
  })),

  on(UIActions.setAnimationsEnabled, (state, { enabled }) => ({
    ...state,
    animationsEnabled: enabled
  })),

  on(UIActions.toggleLazyLoading, (state) => ({
    ...state,
    lazyLoadingEnabled: !state.lazyLoadingEnabled
  })),

  on(UIActions.setLazyLoadingEnabled, (state, { enabled }) => ({
    ...state,
    lazyLoadingEnabled: enabled
  })),

  // Reset Actions
  on(UIActions.resetUIState, () => ({
    ...initialUIState
  })),

  on(UIActions.resetTheme, (state) => ({
    ...state,
    theme: initialUIState.theme,
    colorScheme: initialUIState.colorScheme
  })),

  on(UIActions.resetAccessibility, (state) => ({
    ...state,
    highContrast: initialUIState.highContrast,
    reducedMotion: initialUIState.reducedMotion,
    fontSize: initialUIState.fontSize
  })),

  on(UIActions.resetPerformance, (state) => ({
    ...state,
    animationsEnabled: initialUIState.animationsEnabled,
    lazyLoadingEnabled: initialUIState.lazyLoadingEnabled
  })),

  // Persistence Actions
  on(UIActions.loadUIState, (state) => ({
    ...state,
    // State will be loaded from localStorage
  })),

  on(UIActions.saveUIState, (state) => ({
    ...state,
    // State will be saved to localStorage
  })),

  // Error Actions
  on(UIActions.setUIError, (state, { error }) => ({
    ...state,
    // Error state can be handled here if needed
  })),

  on(UIActions.clearUIError, (state) => ({
    ...state,
    // Error state can be cleared here if needed
  })),

  // Success Actions
  on(UIActions.setUISuccess, (state, { message }) => ({
    ...state,
    // Success state can be handled here if needed
  })),

  on(UIActions.clearUISuccess, (state) => ({
    ...state,
    // Success state can be cleared here if needed
  })),

  // Warning Actions
  on(UIActions.setUIWarning, (state, { message }) => ({
    ...state,
    // Warning state can be handled here if needed
  })),

  on(UIActions.clearUIWarning, (state) => ({
    ...state,
    // Warning state can be cleared here if needed
  })),

  // Info Actions
  on(UIActions.setUIInfo, (state, { message }) => ({
    ...state,
    // Info state can be handled here if needed
  })),

  on(UIActions.clearUIInfo, (state) => ({
    ...state,
    // Info state can be cleared here if needed
  }))
);
