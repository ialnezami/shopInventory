import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, interval } from 'rxjs';
import { Product } from '@core/services/product.service';
import { ProductService } from '@core/services/product.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';
import { CustomValidators } from '@core/validators/custom-validators';

export interface StockAdjustment {
  productId: string;
  productName: string;
  currentStock: number;
  adjustmentType: 'add' | 'remove' | 'set';
  quantity: number;
  reason: string;
  notes?: string;
  timestamp: Date;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: 'sale' | 'purchase' | 'adjustment' | 'return' | 'transfer';
  quantity: number;
  previousStock: number;
  newStock: number;
  reference: string;
  timestamp: Date;
  user: string;
  notes?: string;
}

export interface StockAlert {
  productId: string;
  productName: string;
  alertType: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiring';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentStock: number;
  threshold: number;
  timestamp: Date;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  overstockProducts: number;
  totalCategories: number;
  averageStockLevel: number;
  stockTurnoverRate: number;
  topProducts: Array<{ product: Product; stockLevel: number; value: number }>;
  categoryBreakdown: Array<{ category: string; count: number; value: number }>;
}

@Component({
  selector: 'app-inventory-dashboard',
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.scss']
})
export class InventoryDashboardComponent implements OnInit, OnDestroy {
  // Inventory data
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;

  // Stock adjustments
  adjustmentForm: FormGroup;
  showAdjustmentModal: boolean = false;
  productToAdjust: Product | null = null;

  // Inventory movements
  movements: InventoryMovement[] = [];
  filteredMovements: InventoryMovement[] = [];
  showMovementsModal: boolean = false;

  // Stock alerts
  stockAlerts: StockAlert[] = [];
  showAlertsModal: boolean = false;

  // Statistics
  inventoryStats: InventoryStats | null = null;

  // Filtering and search
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedStockStatus: string = '';
  sortBy: string = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // UI State
  activeTab: 'overview' | 'products' | 'movements' | 'alerts' | 'adjustments' = 'overview';
  refreshInterval: any;

  // Search
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {
    this.initAdjustmentForm();
  }

  ngOnInit(): void {
    this.loadInventoryData();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private initAdjustmentForm(): void {
    this.adjustmentForm = this.fb.group({
      adjustmentType: ['add', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0.01), CustomValidators.currency]],
      reason: ['', [Validators.required, CustomValidators.textWithPunctuation, CustomValidators.maxLength(100)]],
      notes: ['', [CustomValidators.textWithPunctuation, CustomValidators.maxLength(200)]]
    });
  }

  private setupAutoRefresh(): void {
    // Refresh inventory data every 5 minutes
    this.refreshInterval = interval(5 * 60 * 1000).subscribe(() => {
      this.refreshInventoryData();
    });
  }

  private loadInventoryData(): void {
    this.loadingService.setLoading('inventory', true, { message: 'Loading inventory data...' });

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.generateInventoryStats();
        this.generateStockAlerts();
        this.generateInventoryMovements();
        this.loadingService.setLoading('inventory', false);
      },
      error: (error) => {
        this.loadingService.setLoading('inventory', false);
        this.toastService.error('Failed to load inventory data');
        console.error('Error loading inventory data:', error);
      }
    });
  }

  private refreshInventoryData(): void {
    this.loadInventoryData();
    this.toastService.info('Inventory data refreshed');
  }

  private generateInventoryStats(): void {
    if (!this.products.length) return;

    const totalProducts = this.products.length;
    const totalValue = this.products.reduce((sum, product) => 
      sum + (product.price.selling * product.inventory.quantity), 0);
    
    const lowStockProducts = this.products.filter(p => 
      p.inventory.quantity <= p.inventory.minStock && p.inventory.quantity > 0).length;
    
    const outOfStockProducts = this.products.filter(p => p.inventory.quantity === 0).length;
    const overstockProducts = this.products.filter(p => 
      p.inventory.quantity > p.inventory.minStock * 3).length;

    const categories = [...new Set(this.products.map(p => p.category))];
    const totalCategories = categories.length;

    const averageStockLevel = this.products.reduce((sum, p) => sum + p.inventory.quantity, 0) / totalProducts;

    // Calculate stock turnover rate (simplified)
    const stockTurnoverRate = this.calculateStockTurnoverRate();

    // Top products by value
    const topProducts = this.products
      .map(p => ({
        product: p,
        stockLevel: p.inventory.quantity,
        value: p.price.selling * p.inventory.quantity
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Category breakdown
    const categoryBreakdown = categories.map(category => {
      const categoryProducts = this.products.filter(p => p.category === category);
      const count = categoryProducts.length;
      const value = categoryProducts.reduce((sum, p) => 
        sum + (p.price.selling * p.inventory.quantity), 0);
      
      return { category, count, value };
    }).sort((a, b) => b.value - a.value);

    this.inventoryStats = {
      totalProducts,
      totalValue,
      lowStockProducts,
      outOfStockProducts,
      overstockProducts,
      totalCategories,
      averageStockLevel,
      stockTurnoverRate,
      topProducts,
      categoryBreakdown
    };
  }

  private calculateStockTurnoverRate(): number {
    // Simplified calculation - in real app this would use actual sales data
    const totalStock = this.products.reduce((sum, p) => sum + p.inventory.quantity, 0);
    const averageStock = totalStock / this.products.length;
    
    // Mock turnover rate based on stock levels
    if (averageStock === 0) return 0;
    return Math.min(12, Math.max(1, Math.random() * 10 + 2)); // 2-12 times per year
  }

  private generateStockAlerts(): void {
    this.stockAlerts = [];

    this.products.forEach(product => {
      const currentStock = product.inventory.quantity;
      const minStock = product.inventory.minStock;

      // Out of stock alert
      if (currentStock === 0) {
        this.stockAlerts.push({
          productId: product._id,
          productName: product.name,
          alertType: 'out_of_stock',
          severity: 'critical',
          message: `${product.name} is out of stock`,
          currentStock,
          threshold: 0,
          timestamp: new Date()
        });
      }
      // Low stock alert
      else if (currentStock <= minStock) {
        this.stockAlerts.push({
          productId: product._id,
          productName: product.name,
          alertType: 'low_stock',
          severity: currentStock === minStock ? 'high' : 'medium',
          message: `${product.name} is low on stock (${currentStock}/${minStock})`,
          currentStock,
          threshold: minStock,
          timestamp: new Date()
        });
      }
      // Overstock alert
      else if (currentStock > minStock * 3) {
        this.stockAlerts.push({
          productId: product._id,
          productName: product.name,
          alertType: 'overstock',
          severity: 'low',
          message: `${product.name} may be overstocked (${currentStock} units)`,
          currentStock,
          threshold: minStock * 3,
          timestamp: new Date()
        });
      }
    });

    // Sort by severity
    this.stockAlerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  private generateInventoryMovements(): void {
    this.movements = [];

    // Generate mock movements for demonstration
    this.products.forEach((product, index) => {
      const baseTime = new Date();
      baseTime.setHours(baseTime.getHours() - index * 2);

      // Sale movement
      if (product.inventory.quantity < 50) {
        this.movements.push({
          id: `mov_${index}_1`,
          productId: product._id,
          productName: product.name,
          movementType: 'sale',
          quantity: Math.min(5, 50 - product.inventory.quantity),
          previousStock: product.inventory.quantity + Math.min(5, 50 - product.inventory.quantity),
          newStock: product.inventory.quantity,
          reference: `SALE-${Date.now()}-${index}`,
          timestamp: baseTime,
          user: 'John Doe',
          notes: 'Customer purchase'
        });
      }

      // Purchase movement
      if (product.inventory.quantity > 0) {
        this.movements.push({
          id: `mov_${index}_2`,
          productId: product._id,
          productName: product.name,
          movementType: 'purchase',
          quantity: Math.min(20, product.inventory.quantity),
          previousStock: Math.max(0, product.inventory.quantity - Math.min(20, product.inventory.quantity)),
          newStock: product.inventory.quantity,
          reference: `PO-${Date.now()}-${index}`,
          timestamp: new Date(baseTime.getTime() - 24 * 60 * 60 * 1000), // 1 day before
          user: 'Jane Smith',
          notes: 'Supplier delivery'
        });
      }
    });

    this.movements.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.filteredMovements = [...this.movements];
  }

  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchSubject.next(query);
    this.applyFilters();
  }

  onCategoryChange(event: any): void {
    this.selectedCategory = event.target.value;
    this.applyFilters();
  }

  onStockStatusChange(event: any): void {
    this.selectedStockStatus = event.target.value;
    this.applyFilters();
  }

  onSort(field: string): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.products];

    // Apply search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product => product.category === this.selectedCategory);
    }

    // Apply stock status filter
    if (this.selectedStockStatus) {
      switch (this.selectedStockStatus) {
        case 'in_stock':
          filtered = filtered.filter(product => product.inventory.quantity > 0);
          break;
        case 'low_stock':
          filtered = filtered.filter(product => 
            product.inventory.quantity <= product.inventory.minStock && 
            product.inventory.quantity > 0
          );
          break;
        case 'out_of_stock':
          filtered = filtered.filter(product => product.inventory.quantity === 0);
          break;
        case 'overstock':
          filtered = filtered.filter(product => 
            product.inventory.quantity > product.inventory.minStock * 3
          );
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'sku':
          aValue = a.sku.toLowerCase();
          bValue = b.sku.toLowerCase();
          break;
        case 'category':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'stock':
          aValue = a.inventory.quantity;
          bValue = b.inventory.quantity;
          break;
        case 'value':
          aValue = a.price.selling * a.inventory.quantity;
          bValue = b.price.selling * b.inventory.quantity;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (this.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredProducts = filtered;
  }

  openAdjustmentModal(product: Product): void {
    this.productToAdjust = product;
    this.adjustmentForm.patchValue({
      adjustmentType: 'add',
      quantity: '',
      reason: '',
      notes: ''
    });
    this.showAdjustmentModal = true;
  }

  closeAdjustmentModal(): void {
    this.showAdjustmentModal = false;
    this.productToAdjust = null;
    this.adjustmentForm.reset();
  }

  submitAdjustment(): void {
    if (this.adjustmentForm.invalid || !this.productToAdjust) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    const formValue = this.adjustmentForm.value;
    const adjustment: StockAdjustment = {
      productId: this.productToAdjust._id,
      productName: this.productToAdjust.name,
      currentStock: this.productToAdjust.inventory.quantity,
      adjustmentType: formValue.adjustmentType,
      quantity: parseFloat(formValue.quantity),
      reason: formValue.reason,
      notes: formValue.notes,
      timestamp: new Date()
    };

    // Calculate new stock level
    let newStock = this.productToAdjust.inventory.quantity;
    switch (adjustment.adjustmentType) {
      case 'add':
        newStock += adjustment.quantity;
        break;
      case 'remove':
        newStock = Math.max(0, newStock - adjustment.quantity);
        break;
      case 'set':
        newStock = adjustment.quantity;
        break;
    }

    // Update product stock
    this.productToAdjust.inventory.quantity = newStock;

    // Add movement record
    const movement: InventoryMovement = {
      id: `adj_${Date.now()}`,
      productId: this.productToAdjust._id,
      productName: this.productToAdjust.name,
      movementType: 'adjustment',
      quantity: Math.abs(newStock - adjustment.currentStock),
      previousStock: adjustment.currentStock,
      newStock,
      reference: `ADJ-${Date.now()}`,
      timestamp: new Date(),
      user: 'Current User', // In real app, get from auth service
      notes: `${adjustment.reason}: ${adjustment.notes}`
    };

    this.movements.unshift(movement);
    this.filteredMovements = [...this.movements];

    // Update statistics and alerts
    this.generateInventoryStats();
    this.generateStockAlerts();

    this.toastService.success(`Stock adjusted successfully. New stock level: ${newStock}`);
    this.closeAdjustmentModal();
  }

  openMovementsModal(): void {
    this.showMovementsModal = true;
  }

  closeMovementsModal(): void {
    this.showMovementsModal = false;
  }

  openAlertsModal(): void {
    this.showAlertsModal = true;
  }

  closeAlertsModal(): void {
    this.showAlertsModal = false;
  }

  getStockStatusClass(product: Product): string {
    if (product.inventory.quantity === 0) return 'out-of-stock';
    if (product.inventory.quantity <= product.inventory.minStock) return 'low-stock';
    if (product.inventory.quantity > product.inventory.minStock * 3) return 'overstock';
    return 'in-stock';
  }

  getStockStatusText(product: Product): string {
    const status = this.getStockStatusClass(product);
    switch (status) {
      case 'out-of-stock': return 'Out of Stock';
      case 'low-stock': return 'Low Stock';
      case 'overstock': return 'Overstocked';
      default: return 'In Stock';
    }
  }

  getStockStatusColor(product: Product): string {
    const status = this.getStockStatusClass(product);
    switch (status) {
      case 'out-of-stock': return '#e74c3c';
      case 'low-stock': return '#f39c12';
      case 'overstock': return '#9b59b6';
      default: return '#27ae60';
    }
  }

  getAlertSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#f1c40f';
      case 'low': return '#95a5a6';
      default: return '#95a5a6';
    }
  }

  getMovementTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'sale': '📤',
      'purchase': '📥',
      'adjustment': '⚖️',
      'return': '↩️',
      'transfer': '🔄'
    };
    return icons[type] || '📊';
  }

  getMovementTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'sale': '#e74c3c',
      'purchase': '#27ae60',
      'adjustment': '#3498db',
      'return': '#f39c12',
      'transfer': '#9b59b6'
    };
    return colors[type] || '#95a5a6';
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatDateOnly(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  getCategories(): string[] {
    return [...new Set(this.products.map(p => p.category))].sort();
  }

  getProductImage(product: Product): string {
    return product.images && product.images.length > 0 
      ? product.images[0] 
      : 'assets/images/product-placeholder.png';
  }

  refreshData(): void {
    this.refreshInventoryData();
  }

  exportInventoryData(): void {
    // Create CSV content
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Current Stock',
      'Min Stock',
      'Unit Price',
      'Total Value',
      'Status',
      'Last Updated'
    ];

    const csvContent = [
      headers.join(','),
      ...this.filteredProducts.map(product => [
        `"${product.name}"`,
        product.sku,
        product.category,
        product.inventory.quantity,
        product.inventory.minStock,
        product.price.selling,
        product.price.selling * product.inventory.quantity,
        this.getStockStatusText(product),
        this.formatDate(product.updatedAt)
      ].join(','))
    ].join('\n');

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.success('Inventory data exported successfully');
  }
}
