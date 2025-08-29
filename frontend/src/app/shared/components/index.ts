// Data Table Component
export { DataTableComponent } from './data-table/data-table.component';
export type { TableColumn, TableFilter, SortConfig, PaginationConfig } from './data-table/data-table.component';

// Charts Component
export { ChartsComponent } from './charts/charts.component';
export type { ChartData, ChartOptions, DashboardWidget } from './charts/charts.component';

// Responsive & Touch Components
export { ResponsiveService } from './responsive/responsive.service';
export type { BreakpointConfig, DeviceInfo } from './responsive/responsive.service';

export { TouchService } from './touch/touch.service';
export type { TouchGesture, TouchConfig } from './touch/touch.service';

export { PwaService } from './pwa/pwa.service';
export type { PWAInstallPrompt, PWAStatus } from './pwa/pwa.service';

export { TouchFriendlyDirective } from '../directives/touch-friendly.directive';
export type { TouchFriendlyConfig } from '../directives/touch-friendly.directive';

// Accessibility Components
export { AccessibilityService } from './accessibility/accessibility.service';
export type { AccessibilityConfig, AccessibilityStatus } from './accessibility/accessibility.service';

export { ColorContrastService } from './accessibility/color-contrast.service';
export type { ColorContrastResult, WCAGLevels } from './accessibility/color-contrast.service';

export { AccessibilityDirective } from '../directives/accessibility.directive';
export type { AccessibilityConfig as AccessibilityDirectiveConfig } from '../directives/accessibility.directive';
