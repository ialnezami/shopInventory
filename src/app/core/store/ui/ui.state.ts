export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
  read: boolean;
}

export interface LoadingState {
  [key: string]: boolean;
}

export interface UIState {
  // Loading states
  loading: LoadingState;
  globalLoading: boolean;
  
  // Notifications
  notifications: Notification[];
  unreadNotifications: number;
  
  // Sidebar state
  sidebarCollapsed: boolean;
  sidebarExpanded: boolean;
  
  // Theme and appearance
  theme: 'light' | 'dark' | 'auto';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  
  // Modal states
  activeModals: string[];
  
  // Toast messages
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration: number;
    timestamp: Date;
  }>;
  
  // Search state
  globalSearchQuery: string;
  globalSearchActive: boolean;
  
  // Breadcrumb navigation
  breadcrumbs: Array<{
    label: string;
    url: string;
    active: boolean;
  }>;
  
  // Page title
  pageTitle: string;
  
  // Responsive state
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Keyboard shortcuts
  keyboardShortcutsEnabled: boolean;
  
  // Accessibility
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Performance
  animationsEnabled: boolean;
  lazyLoadingEnabled: boolean;
}

export const initialUIState: UIState = {
  loading: {},
  globalLoading: false,
  notifications: [],
  unreadNotifications: 0,
  sidebarCollapsed: false,
  sidebarExpanded: false,
  theme: 'light',
  colorScheme: 'blue',
  activeModals: [],
  toasts: [],
  globalSearchQuery: '',
  globalSearchActive: false,
  breadcrumbs: [],
  pageTitle: 'Shop Inventory Management System',
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  keyboardShortcutsEnabled: true,
  highContrast: false,
  reducedMotion: false,
  fontSize: 'medium',
  animationsEnabled: true,
  lazyLoadingEnabled: true
};
