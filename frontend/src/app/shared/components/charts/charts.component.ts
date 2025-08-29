import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export interface ChartData {
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

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    title?: {
      display: boolean;
      text: string;
    };
    legend?: {
      display: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    tooltip?: {
      enabled: boolean;
    };
  };
  scales?: {
    x?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
    };
    y?: {
      display: boolean;
      title?: {
        display: boolean;
        text: string;
      };
      beginAtZero?: boolean;
    };
  };
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table';
  data: any;
  options?: any;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
}

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() chartType: ChartType = 'line';
  @Input() chartData: ChartData = { labels: [], datasets: [] };
  @Input() chartOptions: ChartOptions = {};
  @Input() height: string = '400px';
  @Input() width: string = '100%';
  @Input() showLegend: boolean = true;
  @Input() showTooltips: boolean = true;
  @Input() responsive: boolean = true;
  @Input() maintainAspectRatio: boolean = false;
  @Input() dashboardMode: boolean = false;
  @Input() widgets: DashboardWidget[] = [];

  @Output() chartClick = new EventEmitter<any>();
  @Output() chartHover = new EventEmitter<any>();
  @Output() widgetResize = new EventEmitter<{ widgetId: string; size: string }>();

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Default color schemes
  private readonly colorSchemes = {
    primary: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#6c757d'],
    pastel: ['#ffb3ba', '#baffc9', '#bae1ff', '#ffffba', '#ffb3f7', '#b3f7ff', '#f7b3ff', '#f7ffb3'],
    dark: ['#2c3e50', '#34495e', '#e74c3c', '#c0392b', '#9b59b6', '#8e44ad', '#3498db', '#2980b9']
  };

  ngOnInit() {
    this.initializeDefaultOptions();
  }

  ngAfterViewInit() {
    this.createChart();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  // Chart creation and management
  private createChart() {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: this.chartType,
      data: this.chartData,
      options: {
        responsive: this.responsive,
        maintainAspectRatio: this.maintainAspectRatio,
        plugins: {
          title: {
            display: this.chartOptions.plugins?.title?.display ?? false,
            text: this.chartOptions.plugins?.title?.text ?? ''
          },
          legend: {
            display: this.showLegend && (this.chartOptions.plugins?.legend?.display ?? true),
            position: this.chartOptions.plugins?.legend?.position ?? 'top'
          },
          tooltip: {
            enabled: this.showTooltips && (this.chartOptions.plugins?.tooltip?.enabled ?? true)
          }
        },
        scales: this.chartOptions.scales,
        onClick: (event, elements) => {
          this.chartClick.emit({ event, elements });
        },
        onHover: (event, elements) => {
          this.chartHover.emit({ event, elements });
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  private initializeDefaultOptions() {
    if (!this.chartOptions.scales) {
      this.chartOptions.scales = {
        x: {
          display: true,
          title: {
            display: false,
            text: ''
          }
        },
        y: {
          display: true,
          title: {
            display: false,
            text: ''
          },
          beginAtZero: true
        }
      };
    }
  }

  private setupResizeObserver() {
    if (this.chartCanvas && this.responsive) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.chart) {
          this.chart.resize();
        }
      });
      this.resizeObserver.observe(this.chartCanvas.nativeElement);
    }
  }

  // Public methods for updating chart
  updateChart(newData: ChartData) {
    if (this.chart) {
      this.chart.data = newData;
      this.chart.update();
    }
  }

  updateChartOptions(newOptions: ChartOptions) {
    if (this.chart) {
      this.chart.options = { ...this.chart.options, ...newOptions };
      this.chart.update();
    }
  }

  // Chart type switching
  changeChartType(newType: ChartType) {
    if (this.chart) {
      this.chart.destroy();
      this.chartType = newType;
      this.createChart();
    }
  }

  // Data export
  exportChart(format: 'png' | 'jpg' | 'pdf' = 'png') {
    if (this.chart) {
      return this.chart.toBase64String();
    }
    return null;
  }

  // Utility methods for common chart types
  createLineChart(data: ChartData, options?: ChartOptions): ChartConfiguration {
    return {
      type: 'line',
      data: {
        ...data,
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          borderWidth: dataset.borderWidth ?? 2,
          fill: dataset.fill ?? false,
          tension: dataset.tension ?? 0.4
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { enabled: true }
        },
        scales: {
          x: { display: true },
          y: { display: true, beginAtZero: true }
        },
        ...options
      }
    };
  }

  createBarChart(data: ChartData, options?: ChartOptions): ChartConfiguration {
    return {
      type: 'bar',
      data: {
        ...data,
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor ?? this.colorSchemes.primary[0],
          borderColor: dataset.borderColor ?? this.colorSchemes.primary[0],
          borderWidth: dataset.borderWidth ?? 1
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: { enabled: true }
        },
        scales: {
          x: { display: true },
          y: { display: true, beginAtZero: true }
        },
        ...options
      }
    };
  }

  createPieChart(data: ChartData, options?: ChartOptions): ChartConfiguration {
    return {
      type: 'pie',
      data: {
        ...data,
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor ?? this.colorSchemes.primary,
          borderColor: dataset.borderColor ?? '#fff',
          borderWidth: dataset.borderWidth ?? 2
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'right' },
          tooltip: { enabled: true }
        },
        ...options
      }
    };
  }

  createDoughnutChart(data: ChartData, options?: ChartOptions): ChartConfiguration {
    return {
      type: 'doughnut',
      data: {
        ...data,
        datasets: data.datasets.map(dataset => ({
          ...dataset,
          backgroundColor: dataset.backgroundColor ?? this.colorSchemes.primary,
          borderColor: dataset.borderColor ?? '#fff',
          borderWidth: dataset.borderWidth ?? 2
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'right' },
          tooltip: { enabled: true }
        },
        cutout: '60%',
        ...options
      }
    };
  }

  // Dashboard widget methods
  resizeWidget(widgetId: string, newSize: 'small' | 'medium' | 'large') {
    this.widgetResize.emit({ widgetId, size: newSize });
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
          borderColor: this.colorSchemes.primary[0],
          backgroundColor: this.colorSchemes.primary[0] + '20',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Sales 2024',
          data: [15000, 22000, 18000, 28000, 25000, 35000],
          borderColor: this.colorSchemes.primary[1],
          backgroundColor: this.colorSchemes.primary[1] + '20',
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
          backgroundColor: this.colorSchemes.primary,
          borderColor: this.colorSchemes.primary,
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
          backgroundColor: this.colorSchemes.primary[2],
          borderColor: this.colorSchemes.primary[2],
          borderWidth: 2
        }
      ]
    };
  }

  // Track by function for performance
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
