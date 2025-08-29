# Advanced UI Components Documentation

This document describes the advanced UI components implemented for the Shop Inventory Management System, including data tables with advanced features and interactive charts with dashboard capabilities.

## Table of Contents

1. [Data Table Component](#data-table-component)
2. [Charts Component](#charts-component)
3. [Demo Component](#demo-component)
4. [Installation & Setup](#installation--setup)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)

## Data Table Component

### Overview
A comprehensive data table component with advanced features including pagination, sorting, filtering, and bulk operations.

### Features
- ✅ **Pagination**: Configurable page sizes and navigation
- ✅ **Sorting**: Multi-column sorting with visual indicators
- ✅ **Filtering**: Advanced filtering with multiple operators
- ✅ **Bulk Operations**: Select and perform actions on multiple items
- ✅ **Responsive Design**: Mobile-friendly layout
- ✅ **Loading States**: Visual feedback during data operations
- ✅ **Type Support**: Different data types (text, number, date, boolean, action)

### Basic Usage

```typescript
import { DataTableComponent, TableColumn } from './shared/components';

@Component({
  selector: 'app-example',
  template: `
    <app-data-table
      [columns]="tableColumns"
      [data]="tableData"
      [pageSize]="10"
      [showFilters]="true"
      [showBulkActions]="true"
      (pageChange)="onPageChange($event)"
      (sortChange)="onSortChange($event)"
      (filterChange)="onFilterChange($event)"
      (bulkAction)="onBulkAction($event)">
    </app-data-table>
  `
})
export class ExampleComponent {
  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, filterable: true, type: 'number' },
    { key: 'name', label: 'Name', sortable: true, filterable: true, type: 'text' },
    { key: 'price', label: 'Price', sortable: true, filterable: true, type: 'number' },
    { key: 'actions', label: 'Actions', type: 'action' }
  ];

  tableData = [
    { id: 1, name: 'Product 1', price: 99.99 },
    { id: 2, name: 'Product 2', price: 149.99 }
  ];
}
```

### Column Configuration

```typescript
interface TableColumn {
  key: string;           // Property key in data object
  label: string;         // Display label
  sortable?: boolean;    // Enable sorting (default: false)
  filterable?: boolean;  // Enable filtering (default: false)
  width?: string;        // CSS width (e.g., '100px')
  type?: 'text' | 'number' | 'date' | 'boolean' | 'action';
}
```

### Filter Operators
- `contains`: Text contains value
- `equals`: Exact match
- `startsWith`: Text starts with value
- `endsWith`: Text ends with value
- `greaterThan`: Numeric comparison
- `lessThan`: Numeric comparison

## Charts Component

### Overview
A versatile charting component built with Chart.js, supporting multiple chart types and dashboard widgets.

### Features
- ✅ **Multiple Chart Types**: Line, Bar, Pie, Doughnut, Radar, Polar Area
- ✅ **Interactive Dashboard**: Resizable widgets with grid layout
- ✅ **Responsive Design**: Adapts to container size
- ✅ **Export Functionality**: PNG, JPG export options
- ✅ **Customizable Themes**: Color schemes and styling
- ✅ **Real-time Updates**: Dynamic data updates
- ✅ **Event Handling**: Click and hover events

### Basic Usage

```typescript
import { ChartsComponent, ChartData } from './shared/components';

@Component({
  selector: 'app-example',
  template: `
    <app-charts
      chartType="line"
      [chartData]="salesData"
      [chartOptions]="chartOptions"
      height="400px"
      (chartClick)="onChartClick($event)"
      (chartHover)="onChartHover($event)">
    </app-charts>
  `
})
export class ExampleComponent {
  salesData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar'],
    datasets: [{
      label: 'Sales',
      data: [1000, 2000, 1500],
      borderColor: '#007bff',
      backgroundColor: '#007bff20'
    }]
  };
}
```

### Dashboard Mode

```typescript
<app-charts
  [dashboardMode]="true"
  [widgets]="dashboardWidgets"
  height="600px"
  (widgetResize)="onWidgetResize($event)">
</app-charts>
```

### Widget Configuration

```typescript
interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table';
  data: any;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
}
```

## Demo Component

### Overview
A comprehensive demonstration page showcasing all advanced UI components with sample data and interactive examples.

### Features
- 📊 **Summary Cards**: Key metrics display
- 📋 **Data Table Demo**: Full-featured table example
- 📈 **Chart Gallery**: Multiple chart types demonstration
- 🎛️ **Interactive Dashboard**: Resizable widget showcase
- 📱 **Responsive Layout**: Mobile-optimized design

### Access
Navigate to `/demo` in the application to view the demo page.

## Installation & Setup

### Prerequisites
- Angular 17+
- Node.js 18+
- npm or yarn

### Dependencies

```bash
# Core dependencies
npm install chart.js

# UI framework
npm install bootstrap bootstrap-icons

# Additional features
npm install ngx-toastr sweetalert2
```

### Angular Configuration

Add to `angular.json`:

```json
{
  "styles": [
    "node_modules/bootstrap/dist/css/bootstrap.min.css",
    "node_modules/bootstrap-icons/font/bootstrap-icons.css",
    "node_modules/ngx-toastr/toastr.css"
  ],
  "scripts": [
    "node_modules/@popperjs/core/dist/umd/popper.min.js",
    "node_modules/bootstrap/dist/js/bootstrap.min.js"
  ]
}
```

## Usage Examples

### Advanced Data Table

```typescript
// Custom bulk actions
onBulkAction(action: { action: string; items: any[] }) {
  switch (action.action) {
    case 'delete':
      this.deleteItems(action.items);
      break;
    case 'export':
      this.exportItems(action.items);
      break;
    case 'update':
      this.updateItems(action.items);
      break;
  }
}

// Custom filtering
onFilterChange(filters: TableFilter[]) {
  console.log('Active filters:', filters);
  // Apply filters to backend API
  this.loadFilteredData(filters);
}
```

### Interactive Charts

```typescript
// Dynamic chart updates
updateChartData() {
  this.chartData = {
    labels: this.getTimeLabels(),
    datasets: [{
      label: 'Real-time Sales',
      data: this.getSalesData(),
      borderColor: '#28a745',
      backgroundColor: '#28a74520'
    }]
  };
}

// Chart interaction handling
onChartClick(event: any) {
  const element = event.elements[0];
  if (element) {
    const dataIndex = element.index;
    const value = this.chartData.datasets[0].data[dataIndex];
    this.showDataDetails(dataIndex, value);
  }
}
```

### Dashboard Customization

```typescript
// Custom widget sizes
resizeWidget(widgetId: string, newSize: 'small' | 'medium' | 'large') {
  const widget = this.widgets.find(w => w.id === widgetId);
  if (widget) {
    widget.size = newSize;
    this.saveWidgetLayout();
  }
}

// Dynamic widget loading
loadWidgetData(widgetId: string) {
  this.widgets.find(w => w.id === widgetId)?.loading = true;
  
  this.dataService.getWidgetData(widgetId).subscribe(data => {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (widget) {
      widget.data = data;
      widget.loading = false;
    }
  });
}
```

## API Reference

### Data Table Events

| Event | Type | Description |
|-------|------|-------------|
| `pageChange` | `PaginationConfig` | Fired when page or page size changes |
| `sortChange` | `SortConfig` | Fired when sorting changes |
| `filterChange` | `TableFilter[]` | Fired when filters change |
| `bulkAction` | `{action: string, items: any[]}` | Fired when bulk action is performed |

### Chart Events

| Event | Type | Description |
|-------|------|-------------|
| `chartClick` | `any` | Fired when chart element is clicked |
| `chartHover` | `any` | Fired when hovering over chart |
| `widgetResize` | `{widgetId: string, size: string}` | Fired when widget is resized |

### Configuration Interfaces

```typescript
// Pagination
interface PaginationConfig {
  page: number;
  pageSize: number;
  totalItems: number;
}

// Sorting
interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

// Filtering
interface TableFilter {
  column: string;
  value: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
}

// Chart Data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}
```

## Customization

### Styling

Components use SCSS with CSS custom properties for easy theming:

```scss
// Custom color scheme
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
}

// Dark mode support
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #4a9eff;
    --background-color: #2d3748;
    --text-color: #e2e8f0;
  }
}
```

### Theme Customization

```typescript
// Custom color schemes for charts
const customColors = {
  primary: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
  pastel: ['#ffb3ba', '#baffc9', '#bae1ff', '#ffffba'],
  dark: ['#2c3e50', '#34495e', '#e74c3c', '#c0392b']
};

// Apply custom theme
this.chartComponent.updateChartOptions({
  plugins: {
    legend: {
      labels: {
        color: '#e2e8f0'
      }
    }
  }
});
```

## Troubleshooting

### Common Issues

#### Data Table Not Rendering
- Check if data array is properly initialized
- Verify column configuration matches data structure
- Ensure all required inputs are provided

#### Charts Not Displaying
- Verify Chart.js is properly installed
- Check if canvas element is accessible
- Ensure data format matches ChartData interface

#### Styling Issues
- Confirm Bootstrap CSS is loaded
- Check for CSS conflicts in global styles
- Verify component styles are properly encapsulated

### Performance Optimization

```typescript
// Use trackBy function for large datasets
trackByFn(index: number, item: any): any {
  return item.id || index;
}

// Implement virtual scrolling for very large datasets
// Consider using ngx-virtual-scroller for tables with 1000+ rows

// Lazy load chart data
loadChartData() {
  if (!this.chartDataLoaded) {
    this.dataService.getChartData().subscribe(data => {
      this.chartData = data;
      this.chartDataLoaded = true;
    });
  }
}
```

### Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Contributing

### Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `ng serve`
4. Navigate to `/demo` to test components

### Code Standards

- Use TypeScript strict mode
- Follow Angular style guide
- Write unit tests for components
- Document public APIs
- Use semantic HTML and ARIA attributes

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run e2e

# Build verification
npm run build
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions and support:
- Create an issue in the repository
- Check the demo page at `/demo`
- Review the API documentation above
- Consult the Angular and Chart.js documentation
