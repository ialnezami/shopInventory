import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Product } from '@core/services/product.service';
import { ProductService } from '@core/services/product.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  stockStatus?: string[];
  minValue?: number;
  maxValue?: number;
  suppliers?: string[];
}

export interface StockLevelReport {
  product: Product;
  currentStock: number;
  minStock: number;
  maxStock: number;
  stockLevel: number; // percentage
  daysOfStock: number;
  reorderPoint: number;
  suggestedOrder: number;
  lastMovement: Date;
  stockStatus: 'critical' | 'low' | 'normal' | 'high' | 'overstock';
}

export interface InventoryValuationReport {
  totalValue: number;
  averageValue: number;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  stockLevelBreakdown: Array<{
    level: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  supplierBreakdown: Array<{
    supplier: string;
    count: number;
    value: number;
    percentage: number;
  }>;
  topProducts: Array<{
    product: Product;
    value: number;
    percentage: number;
  }>;
}

export interface StockMovementReport {
  period: string;
  totalMovements: number;
  totalQuantity: number;
  movementBreakdown: Array<{
    type: string;
    count: number;
    quantity: number;
    percentage: number;
  }>;
  topProducts: Array<{
    product: Product;
    movements: number;
    quantity: number;
  }>;
  dailyMovements: Array<{
    date: string;
    movements: number;
    quantity: number;
  }>;
}

export interface AgingReport {
  product: Product;
  currentStock: number;
  lastPurchaseDate: Date;
  daysInStock: number;
  agingCategory: 'new' | 'recent' | 'aging' | 'old' | 'very_old';
  turnoverRate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

@Component({
  selector: 'app-inventory-reports',
  templateUrl: './inventory-reports.component.html',
  styleUrls: ['./inventory-reports.component.scss']
})
export class InventoryReportsComponent implements OnInit, OnDestroy {
  // Data
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // Reports
  stockLevelReport: StockLevelReport[] = [];
  inventoryValuationReport: InventoryValuationReport | null = null;
  stockMovementReport: StockMovementReport | null = null;
  agingReport: AgingReport[] = [];

  // Filtering
  filterForm: FormGroup;
  activeReport: 'stock-level' | 'valuation' | 'movements' | 'aging' = 'stock-level';

  // UI State
  showFilters: boolean = false;
  isGeneratingReport: boolean = false;
  selectedReportFormat: 'screen' | 'pdf' | 'excel' = 'screen';

  // Search
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {
    this.initFilterForm();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.generateReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      categories: [[]],
      stockStatus: [[]],
      minValue: [''],
      maxValue: [''],
      suppliers: [[]]
    });

    // Listen to filter changes
    this.filterForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  private loadProducts(): void {
    this.loadingService.setLoading('products', true, { message: 'Loading products...' });

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.loadingService.setLoading('products', false);
      },
      error: (error) => {
        this.loadingService.setLoading('products', false);
        this.toastService.error('Failed to load products');
        console.error('Error loading products:', error);
      }
    });
  }

  private applyFilters(): void {
    let filtered = [...this.products];
    const filters = this.filterForm.value;

    // Apply date filters
    if (filters.startDate) {
      filtered = filtered.filter(product => 
        new Date(product.updatedAt) >= filters.startDate
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(product => 
        new Date(product.updatedAt) <= filters.endDate
      );
    }

    // Apply category filters
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(product => 
        filters.categories.includes(product.category)
      );
    }

    // Apply stock status filters
    if (filters.stockStatus && filters.stockStatus.length > 0) {
      filtered = filtered.filter(product => {
        const status = this.getStockStatus(product);
        return filters.stockStatus.includes(status);
      });
    }

    // Apply value filters
    if (filters.minValue) {
      filtered = filtered.filter(product => 
        product.price.selling * product.inventory.quantity >= filters.minValue
      );
    }

    if (filters.maxValue) {
      filtered = filtered.filter(product => 
        product.price.selling * product.inventory.quantity <= filters.maxValue
      );
    }

    // Apply supplier filters
    if (filters.suppliers && filters.suppliers.length > 0) {
      filtered = filtered.filter(product => 
        filters.suppliers.includes(product.supplier)
      );
    }

    this.filteredProducts = filtered;
    this.generateReports();
  }

  private generateReports(): void {
    this.generateStockLevelReport();
    this.generateInventoryValuationReport();
    this.generateStockMovementReport();
    this.generateAgingReport();
  }

  private generateStockLevelReport(): void {
    this.stockLevelReport = this.filteredProducts.map(product => {
      const currentStock = product.inventory.quantity;
      const minStock = product.inventory.minStock;
      const maxStock = minStock * 3;
      const stockLevel = maxStock > 0 ? (currentStock / maxStock) * 100 : 0;
      
      // Calculate days of stock (simplified)
      const daysOfStock = currentStock > 0 ? Math.floor(Math.random() * 30) + 1 : 0;
      
      // Calculate reorder point and suggested order
      const reorderPoint = minStock;
      const suggestedOrder = Math.max(0, maxStock - currentStock);

      // Determine stock status
      let stockStatus: StockLevelReport['stockStatus'];
      if (currentStock === 0) stockStatus = 'critical';
      else if (currentStock <= minStock) stockStatus = 'low';
      else if (currentStock <= maxStock * 0.7) stockStatus = 'normal';
      else if (currentStock <= maxStock) stockStatus = 'high';
      else stockStatus = 'overstock';

      return {
        product,
        currentStock,
        minStock,
        maxStock,
        stockLevel,
        daysOfStock,
        reorderPoint,
        suggestedOrder,
        lastMovement: new Date(product.updatedAt),
        stockStatus
      };
    });

    // Sort by stock status priority
    const statusPriority = { critical: 1, low: 2, normal: 3, high: 4, overstock: 5 };
    this.stockLevelReport.sort((a, b) => 
      statusPriority[a.stockStatus] - statusPriority[b.stockStatus]
    );
  }

  private generateInventoryValuationReport(): void {
    if (!this.filteredProducts.length) return;

    const totalValue = this.filteredProducts.reduce((sum, product) => 
      sum + (product.price.selling * product.inventory.quantity), 0);
    
    const averageValue = totalValue / this.filteredProducts.length;

    // Category breakdown
    const categoryMap = new Map<string, { count: number; value: number }>();
    this.filteredProducts.forEach(product => {
      const category = product.category;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { count: 0, value: 0 });
      }
      const current = categoryMap.get(category)!;
      current.count++;
      current.value += product.price.selling * product.inventory.quantity;
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value,
      percentage: (data.value / totalValue) * 100
    })).sort((a, b) => b.value - a.value);

    // Stock level breakdown
    const stockLevelMap = new Map<string, { count: number; value: number }>();
    this.filteredProducts.forEach(product => {
      const status = this.getStockStatus(product);
      if (!stockLevelMap.has(status)) {
        stockLevelMap.set(status, { count: 0, value: 0 });
      }
      const current = stockLevelMap.get(status)!;
      current.count++;
      current.value += product.price.selling * product.inventory.quantity;
    });

    const stockLevelBreakdown = Array.from(stockLevelMap.entries()).map(([level, data]) => ({
      level,
      count: data.count,
      value: data.value,
      percentage: (data.value / totalValue) * 100
    })).sort((a, b) => b.value - a.value);

    // Supplier breakdown
    const supplierMap = new Map<string, { count: number; value: number }>();
    this.filteredProducts.forEach(product => {
      const supplier = product.supplier;
      if (!supplierMap.has(supplier)) {
        supplierMap.set(supplier, { count: 0, value: 0 });
      }
      const current = supplierMap.get(supplier)!;
      current.count++;
      current.value += product.price.selling * product.inventory.quantity;
    });

    const supplierBreakdown = Array.from(supplierMap.entries()).map(([supplier, data]) => ({
      supplier,
      count: data.count,
      value: data.value,
      percentage: (data.value / totalValue) * 100
    })).sort((a, b) => b.value - a.value);

    // Top products
    const topProducts = this.filteredProducts
      .map(product => ({
        product,
        value: product.price.selling * product.inventory.quantity,
        percentage: 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Calculate percentages for top products
    topProducts.forEach(item => {
      item.percentage = (item.value / totalValue) * 100;
    });

    this.inventoryValuationReport = {
      totalValue,
      averageValue,
      categoryBreakdown,
      stockLevelBreakdown,
      supplierBreakdown,
      topProducts
    };
  }

  private generateStockMovementReport(): void {
    if (!this.filteredProducts.length) return;

    const period = 'Last 30 Days'; // In real app, this would be calculated
    const totalMovements = Math.floor(Math.random() * 100) + 50;
    const totalQuantity = Math.floor(Math.random() * 1000) + 500;

    // Movement breakdown (mock data)
    const movementBreakdown = [
      { type: 'Sales', count: Math.floor(totalMovements * 0.6), quantity: Math.floor(totalQuantity * 0.7), percentage: 0 },
      { type: 'Purchases', count: Math.floor(totalMovements * 0.3), quantity: Math.floor(totalQuantity * 0.25), percentage: 0 },
      { type: 'Adjustments', count: Math.floor(totalMovements * 0.1), quantity: Math.floor(totalQuantity * 0.05), percentage: 0 }
    ];

    // Calculate percentages
    movementBreakdown.forEach(item => {
      item.percentage = (item.count / totalMovements) * 100;
    });

    // Top products by movements
    const topProducts = this.filteredProducts
      .slice(0, 5)
      .map(product => ({
        product,
        movements: Math.floor(Math.random() * 20) + 5,
        quantity: Math.floor(Math.random() * 100) + 10
      }))
      .sort((a, b) => b.movements - a.movements);

    // Daily movements (mock data)
    const dailyMovements = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyMovements.push({
        date: date.toISOString().split('T')[0],
        movements: Math.floor(Math.random() * 10) + 1,
        quantity: Math.floor(Math.random() * 100) + 10
      });
    }

    this.stockMovementReport = {
      period,
      totalMovements,
      totalQuantity,
      movementBreakdown,
      topProducts,
      dailyMovements
    };
  }

  private generateAgingReport(): void {
    this.agingReport = this.filteredProducts.map(product => {
      const currentStock = product.inventory.quantity;
      const lastPurchaseDate = new Date(product.updatedAt);
      const daysInStock = Math.floor(Math.random() * 365) + 1;
      
      // Determine aging category
      let agingCategory: AgingReport['agingCategory'];
      if (daysInStock <= 30) agingCategory = 'new';
      else if (daysInStock <= 90) agingCategory = 'recent';
      else if (daysInStock <= 180) agingCategory = 'aging';
      else if (daysInStock <= 365) agingCategory = 'old';
      else agingCategory = 'very_old';

      // Calculate turnover rate (simplified)
      const turnoverRate = Math.random() * 12; // 0-12 times per year

      // Determine risk level
      let riskLevel: AgingReport['riskLevel'];
      if (agingCategory === 'new' || agingCategory === 'recent') riskLevel = 'low';
      else if (agingCategory === 'aging') riskLevel = 'medium';
      else riskLevel = 'high';

      return {
        product,
        currentStock,
        lastPurchaseDate,
        daysInStock,
        agingCategory,
        turnoverRate,
        riskLevel
      };
    });

    // Sort by risk level and aging
    const riskPriority = { low: 1, medium: 2, high: 3 };
    const agingPriority = { new: 1, recent: 2, aging: 3, old: 4, very_old: 5 };
    
    this.agingReport.sort((a, b) => {
      if (riskPriority[a.riskLevel] !== riskPriority[b.riskLevel]) {
        return riskPriority[a.riskLevel] - riskPriority[b.riskLevel];
      }
      return agingPriority[a.agingCategory] - agingPriority[b.agingCategory];
    });
  }

  onReportChange(report: string): void {
    this.activeReport = report as any;
    this.generateReports();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.applyFilters();
  }

  exportReport(): void {
    if (this.isGeneratingReport) return;

    this.isGeneratingReport = true;
    this.loadingService.setLoading('export', true, { message: 'Generating report...' });

    // Simulate report generation
    setTimeout(() => {
      this.loadingService.setLoading('export', false);
      this.isGeneratingReport = false;

      let reportData: string;
      let filename: string;

      switch (this.activeReport) {
        case 'stock-level':
          reportData = this.exportStockLevelReport();
          filename = `stock_level_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'valuation':
          reportData = this.exportValuationReport();
          filename = `inventory_valuation_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'movements':
          reportData = this.exportMovementsReport();
          filename = `stock_movements_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        case 'aging':
          reportData = this.exportAgingReport();
          filename = `aging_report_${new Date().toISOString().split('T')[0]}.csv`;
          break;
        default:
          reportData = '';
          filename = 'report.csv';
      }

      // Download file
      const blob = new Blob([reportData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

      this.toastService.success('Report exported successfully');
    }, 2000);
  }

  private exportStockLevelReport(): string {
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Current Stock',
      'Min Stock',
      'Max Stock',
      'Stock Level %',
      'Days of Stock',
      'Reorder Point',
      'Suggested Order',
      'Stock Status',
      'Last Movement'
    ];

    const csvContent = [
      headers.join(','),
      ...this.stockLevelReport.map(item => [
        `"${item.product.name}"`,
        item.product.sku,
        item.product.category,
        item.currentStock,
        item.minStock,
        item.maxStock,
        item.stockLevel.toFixed(2),
        item.daysOfStock,
        item.reorderPoint,
        item.suggestedOrder,
        item.stockStatus,
        this.formatDate(item.lastMovement)
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  private exportValuationReport(): string {
    if (!this.inventoryValuationReport) return '';

    const headers = [
      'Category',
      'Product Count',
      'Total Value',
      'Percentage'
    ];

    const csvContent = [
      headers.join(','),
      ...this.inventoryValuationReport.categoryBreakdown.map(item => [
        item.category,
        item.count,
        this.formatCurrency(item.value),
        item.percentage.toFixed(2) + '%'
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  private exportMovementsReport(): string {
    if (!this.stockMovementReport) return '';

    const headers = [
      'Movement Type',
      'Count',
      'Quantity',
      'Percentage'
    ];

    const csvContent = [
      headers.join(','),
      ...this.stockMovementReport.movementBreakdown.map(item => [
        item.type,
        item.count,
        item.quantity,
        item.percentage.toFixed(2) + '%'
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  private exportAgingReport(): string {
    const headers = [
      'Product Name',
      'SKU',
      'Current Stock',
      'Days in Stock',
      'Aging Category',
      'Turnover Rate',
      'Risk Level'
    ];

    const csvContent = [
      headers.join(','),
      ...this.agingReport.map(item => [
        `"${item.product.name}"`,
        item.product.sku,
        item.currentStock,
        item.daysInStock,
        item.agingCategory.replace('_', ' '),
        item.turnoverRate.toFixed(2),
        item.riskLevel
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  getStockStatus(product: Product): string {
    if (product.inventory.quantity === 0) return 'out_of_stock';
    if (product.inventory.quantity <= product.inventory.minStock) return 'low_stock';
    if (product.inventory.quantity > product.inventory.minStock * 3) return 'overstock';
    return 'in_stock';
  }

  getStockStatusColor(status: string): string {
    switch (status) {
      case 'critical': return '#e74c3c';
      case 'low': return '#f39c12';
      case 'normal': return '#27ae60';
      case 'high': return '#3498db';
      case 'overstock': return '#9b59b6';
      default: return '#95a5a6';
    }
  }

  getAgingCategoryColor(category: string): string {
    switch (category) {
      case 'new': return '#27ae60';
      case 'recent': return '#3498db';
      case 'aging': return '#f39c12';
      case 'old': return '#e67e22';
      case 'very_old': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  getRiskLevelColor(level: string): string {
    switch (level) {
      case 'low': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'high': return '#e74c3c';
      default: return '#95a5a6';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))].sort();
  }

  getSuppliers(): string[] {
    return [...new Set(this.products.map(p => p.supplier))].sort();
  }

  getStockStatuses(): string[] {
    return ['in_stock', 'low_stock', 'out_of_stock', 'overstock'];
  }

  getStockStatusText(status: string): string {
    switch (status) {
      case 'in_stock': return 'In Stock';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      case 'overstock': return 'Overstocked';
      default: return status;
    }
  }

  getAgingCategoryText(category: string): string {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getRiskLevelText(level: string): string {
    return level.charAt(0).toUpperCase() + level.slice(1);
  }

  refreshReports(): void {
    this.generateReports();
    this.toastService.info('Reports refreshed');
  }
}
