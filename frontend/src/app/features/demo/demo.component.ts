import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn, TableFilter, SortConfig, PaginationConfig } from '../../shared/components/data-table/data-table.component';
import { ChartsComponent, ChartData, ChartOptions } from '../../shared/components/charts/charts.component';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ChartsComponent],
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {
  // Sample data for the data table
  sampleData = [
    { id: 1, name: 'Laptop', category: 'Electronics', price: 999.99, stock: 25, inStock: true, createdAt: new Date('2024-01-15') },
    { id: 2, name: 'Smartphone', category: 'Electronics', price: 699.99, stock: 50, inStock: true, createdAt: new Date('2024-01-20') },
    { id: 3, name: 'T-Shirt', category: 'Clothing', price: 29.99, stock: 100, inStock: true, createdAt: new Date('2024-01-10') },
    { id: 4, name: 'Jeans', category: 'Clothing', price: 79.99, stock: 75, inStock: true, createdAt: new Date('2024-01-12') },
    { id: 5, name: 'Book: Angular Guide', category: 'Books', price: 49.99, stock: 30, inStock: true, createdAt: new Date('2024-01-18') },
    { id: 6, name: 'Coffee Mug', category: 'Home', price: 19.99, stock: 0, inStock: false, createdAt: new Date('2024-01-05') },
    { id: 7, name: 'Running Shoes', category: 'Sports', price: 129.99, stock: 40, inStock: true, createdAt: new Date('2024-01-22') },
    { id: 8, name: 'Headphones', category: 'Electronics', price: 199.99, stock: 15, inStock: true, createdAt: new Date('2024-01-25') },
    { id: 9, name: 'Desk Lamp', category: 'Home', price: 89.99, stock: 20, inStock: true, createdAt: new Date('2024-01-08') },
    { id: 10, name: 'Yoga Mat', category: 'Sports', price: 39.99, stock: 60, inStock: true, createdAt: new Date('2024-01-30') }
  ];

  // Table columns configuration
  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, filterable: true, width: '80px', type: 'number' },
    { key: 'name', label: 'Product Name', sortable: true, filterable: true, type: 'text' },
    { key: 'category', label: 'Category', sortable: true, filterable: true, type: 'text' },
    { key: 'price', label: 'Price', sortable: true, filterable: true, width: '120px', type: 'number' },
    { key: 'stock', label: 'Stock', sortable: true, filterable: true, width: '100px', type: 'number' },
    { key: 'inStock', label: 'In Stock', sortable: true, filterable: true, width: '100px', type: 'boolean' },
    { key: 'createdAt', label: 'Created Date', sortable: true, filterable: true, width: '150px', type: 'date' },
    { key: 'actions', label: 'Actions', sortable: false, filterable: false, width: '150px', type: 'action' }
  ];

  // Chart data
  salesChartData: ChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales 2023',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: '#007bff',
        backgroundColor: '#007bff20',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Sales 2024',
        data: [15000, 22000, 18000, 28000, 25000, 35000],
        borderColor: '#28a745',
        backgroundColor: '#28a74520',
        fill: true,
        tension: 0.4
      }
    ]
  };

  inventoryChartData: ChartData = {
    labels: ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'],
    datasets: [
      {
        label: 'Current Stock',
        data: [150, 300, 200, 180, 120],
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
        borderColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
        borderWidth: 1
      }
    ]
  };

  revenueChartData: ChartData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue',
        data: [45000, 52000, 48000, 61000],
        backgroundColor: '#ffc107',
        borderColor: '#ffc107',
        borderWidth: 2
      }
    ]
  };

  // Chart options
  chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Sales Performance'
      },
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Sales ($)'
        },
        beginAtZero: true
      }
    }
  };

  // Dashboard widgets configuration
  dashboardWidgets = [
    { id: 'sales-trend', title: 'Sales Trends', type: 'chart', data: this.salesChartData, size: 'large', position: { x: 0, y: 0 } },
    { id: 'inventory', title: 'Inventory by Category', type: 'chart', data: this.inventoryChartData, size: 'medium', position: { x: 0, y: 1 } },
    { id: 'revenue', title: 'Revenue Metrics', type: 'metric', data: null, size: 'small', position: { x: 1, y: 0 } },
    { id: 'actions', title: 'Quick Actions', type: 'table', data: null, size: 'small', position: { x: 1, y: 1 } }
  ];

  constructor() {}

  ngOnInit() {}

  // Data table event handlers
  onPageChange(pagination: PaginationConfig) {
    console.log('Page changed:', pagination);
  }

  onSortChange(sort: SortConfig) {
    console.log('Sort changed:', sort);
  }

  onFilterChange(filters: TableFilter[]) {
    console.log('Filters changed:', filters);
  }

  onBulkAction(action: { action: string; items: any[] }) {
    console.log('Bulk action:', action);
    alert(`${action.action} action performed on ${action.items.length} items`);
  }

  // Chart event handlers
  onChartClick(event: any) {
    console.log('Chart clicked:', event);
  }

  onChartHover(event: any) {
    console.log('Chart hover:', event);
  }

  onWidgetResize(resize: { widgetId: string; size: string }) {
    console.log('Widget resized:', resize);
    // Update widget size in the configuration
    const widget = this.dashboardWidgets.find(w => w.id === resize.widgetId);
    if (widget) {
      widget.size = resize.size as 'small' | 'medium' | 'large';
    }
  }

  // Utility methods
  getTotalValue(): number {
    return this.sampleData.reduce((sum, item) => sum + item.price * item.stock, 0);
  }

  getAveragePrice(): number {
    const total = this.sampleData.reduce((sum, item) => sum + item.price, 0);
    return total / this.sampleData.length;
  }

  getLowStockItems(): number {
    return this.sampleData.filter(item => item.stock < 20).length;
  }

  // Sample data generators for demo purposes
  generateSampleSalesData(): ChartData {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
      labels: months,
      datasets: [
        {
          label: 'Sales 2023',
          data: [12000, 19000, 15000, 25000, 22000, 30000],
          borderColor: '#007bff',
          backgroundColor: '#007bff20',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Sales 2024',
          data: [15000, 22000, 18000, 28000, 25000, 35000],
          borderColor: '#28a745',
          backgroundColor: '#28a74520',
          fill: true,
          tension: 0.4
        }
      ]
    };
  }

  generateSampleInventoryData(): ChartData {
    const categories = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports'];
    return {
      labels: categories,
      datasets: [
        {
          label: 'Current Stock',
          data: [150, 300, 200, 180, 120],
          backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
          borderColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1'],
          borderWidth: 1
        }
      ]
    };
  }

  generateSampleRevenueData(): ChartData {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    return {
      labels: quarters,
      datasets: [
        {
          label: 'Revenue',
          data: [45000, 52000, 48000, 61000],
          backgroundColor: '#ffc107',
          borderColor: '#ffc107',
          borderWidth: 2
        }
      ]
    };
  }
}
