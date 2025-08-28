import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SaleReceipt } from '../services/pos.service';
import { PosService } from '../services/pos.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';

export interface SalesFilter {
  startDate?: Date;
  endDate?: Date;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  cashier?: string;
  customer?: string;
}

export interface SalesSort {
  field: 'timestamp' | 'total' | 'grandTotal' | 'method' | 'cashier';
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-sales-list',
  templateUrl: './sales-list.component.html',
  styleUrls: ['./sales-list.component.scss']
})
export class SalesListComponent implements OnInit, OnDestroy {
  // Sales data
  sales: SaleReceipt[] = [];
  filteredSales: SaleReceipt[] = [];
  selectedSale: SaleReceipt | null = null;

  // Filtering and sorting
  filterForm: FormGroup;
  currentSort: SalesSort = { field: 'timestamp', direction: 'desc' };
  searchQuery: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 20;
  totalPages: number = 1;

  // UI State
  showFilters: boolean = false;
  showSaleDetails: boolean = false;
  showDeleteConfirm: boolean = false;
  saleToDelete: SaleReceipt | null = null;

  // Statistics
  totalSales: number = 0;
  totalRevenue: number = 0;
  averageSale: number = 0;

  // Search
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private posService: PosService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {
    this.initFilterForm();
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadSales();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      paymentMethod: [''],
      minAmount: [''],
      maxAmount: [''],
      cashier: [''],
      customer: ['']
    });

    // Listen to filter changes
    this.filterForm.valueChanges.pipe(
      takeUntil(this.destroy$),
      debounceTime(300)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery = query;
      this.applyFilters();
    });
  }

  private loadSales(): void {
    this.loadingService.setLoading('sales', true, { message: 'Loading sales...' });

    this.posService.getAllSales().subscribe({
      next: (sales) => {
        this.sales = sales;
        this.applyFilters();
        this.loadingService.setLoading('sales', false);
      },
      error: (error) => {
        this.loadingService.setLoading('sales', false);
        this.toastService.error('Failed to load sales');
        console.error('Error loading sales:', error);
      }
    });
  }

  private loadStatistics(): void {
    this.posService.getPosStats().subscribe({
      next: (stats) => {
        this.totalSales = stats.totalSales;
        this.totalRevenue = stats.totalRevenue;
        this.averageSale = stats.averageSale;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchSubject.next(query);
  }

  private applyFilters(): void {
    let filtered = [...this.sales];

    // Apply search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(sale =>
        sale.id.toLowerCase().includes(query) ||
        sale.method.toLowerCase().includes(query) ||
        sale.cashier?.toLowerCase().includes(query) ||
        sale.customer?.toLowerCase().includes(query) ||
        sale.items.some(item => 
          item.product.name.toLowerCase().includes(query) ||
          item.product.sku.toLowerCase().includes(query)
        )
      );
    }

    // Apply form filters
    const filters = this.filterForm.value;

    if (filters.startDate) {
      filtered = filtered.filter(sale => sale.timestamp >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(sale => sale.timestamp <= filters.endDate);
    }

    if (filters.paymentMethod) {
      filtered = filtered.filter(sale => sale.method === filters.paymentMethod);
    }

    if (filters.minAmount) {
      filtered = filtered.filter(sale => sale.grandTotal >= filters.minAmount);
    }

    if (filters.maxAmount) {
      filtered = filtered.filter(sale => sale.grandTotal <= filters.maxAmount);
    }

    if (filters.cashier) {
      filtered = filtered.filter(sale => 
        sale.cashier?.toLowerCase().includes(filters.cashier.toLowerCase())
      );
    }

    if (filters.customer) {
      filtered = filtered.filter(sale => 
        sale.customer?.toLowerCase().includes(filters.customer.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (this.currentSort.field) {
        case 'timestamp':
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'grandTotal':
          aValue = a.grandTotal;
          bValue = b.grandTotal;
          break;
        case 'method':
          aValue = a.method;
          bValue = b.method;
          break;
        case 'cashier':
          aValue = a.cashier || '';
          bValue = b.cashier || '';
          break;
        default:
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
      }

      if (this.currentSort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    this.filteredSales = filtered;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredSales.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;
  }

  getCurrentPageSales(): SaleReceipt[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredSales.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onSort(field: SalesSort['field']): void {
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.field = field;
      this.currentSort.direction = 'asc';
    }
    this.applyFilters();
  }

  getSortIcon(field: SalesSort['field']): string {
    if (this.currentSort.field !== field) return '↕️';
    return this.currentSort.direction === 'asc' ? '↑' : '↓';
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.searchQuery = '';
    this.applyFilters();
  }

  selectSale(sale: SaleReceipt): void {
    this.selectedSale = sale;
    this.showSaleDetails = true;
  }

  closeSaleDetails(): void {
    this.showSaleDetails = false;
    this.selectedSale = null;
  }

  printSale(sale: SaleReceipt): void {
    this.posService.printReceipt(sale);
    this.toastService.success('Receipt sent to printer');
  }

  emailSale(sale: SaleReceipt): void {
    const email = prompt('Enter customer email address:');
    if (email) {
      this.loadingService.setLoading('email', true, { message: 'Sending email...' });
      
      this.posService.emailReceipt(sale, email).subscribe({
        next: (success) => {
          this.loadingService.setLoading('email', false);
          if (success) {
            this.toastService.success('Receipt sent successfully');
          } else {
            this.toastService.error('Failed to send receipt');
          }
        },
        error: (error) => {
          this.loadingService.setLoading('email', false);
          this.toastService.error('Failed to send receipt');
          console.error('Error sending email:', error);
        }
      });
    }
  }

  deleteSale(sale: SaleReceipt): void {
    this.saleToDelete = sale;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.saleToDelete) return;

    const reason = prompt('Please provide a reason for voiding this sale:');
    if (reason) {
      this.loadingService.setLoading('delete', true, { message: 'Voiding sale...' });

      this.posService.voidSale(this.saleToDelete.id, reason).subscribe({
        next: (success) => {
          this.loadingService.setLoading('delete', false);
          if (success) {
            this.toastService.success('Sale voided successfully');
            this.loadSales();
            this.loadStatistics();
          } else {
            this.toastService.error('Failed to void sale');
          }
        },
        error: (error) => {
          this.loadingService.setLoading('delete', false);
          this.toastService.error('Failed to void sale');
          console.error('Error voiding sale:', error);
        }
      });
    }

    this.cancelDelete();
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.saleToDelete = null;
  }

  exportSales(): void {
    const filters = this.filterForm.value;
    let salesToExport = this.filteredSales;

    // If filters are applied, export filtered sales
    if (filters.startDate || filters.endDate || filters.paymentMethod || 
        filters.minAmount || filters.maxAmount || filters.cashier || filters.customer) {
      salesToExport = this.filteredSales;
    }

    const csvContent = this.posService.exportSalesToCSV(
      filters.startDate,
      filters.endDate
    );

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    this.toastService.success('Sales exported successfully');
  }

  getPaymentMethodIcon(method: string): string {
    const icons: { [key: string]: string } = {
      'cash': '💰',
      'card': '💳',
      'mobile': '📱',
      'bank': '🏦',
      'check': '📄'
    };
    return icons[method] || '💳';
  }

  getPaymentMethodColor(method: string): string {
    const colors: { [key: string]: string } = {
      'cash': '#27ae60',
      'card': '#3498db',
      'mobile': '#9b59b6',
      'bank': '#e67e22',
      'check': '#95a5a6'
    };
    return colors[method] || '#95a5a6';
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

  getSaleItemsSummary(sale: SaleReceipt): string {
    const itemCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
    const productCount = sale.items.length;
    
    if (productCount === 1) {
      return `${itemCount} item`;
    } else {
      return `${itemCount} items (${productCount} products)`;
    }
  }

  getSaleStatus(sale: SaleReceipt): { text: string; class: string } {
    // In a real application, you might have different statuses
    // For now, all sales are considered completed
    return {
      text: 'Completed',
      class: 'status-completed'
    };
  }

  refreshSales(): void {
    this.loadSales();
    this.loadStatistics();
    this.toastService.info('Sales refreshed');
  }

  getFilterSummary(): string {
    const filters = this.filterForm.value;
    const activeFilters = [];

    if (filters.startDate) activeFilters.push(`From: ${this.formatDateOnly(filters.startDate)}`);
    if (filters.endDate) activeFilters.push(`To: ${this.formatDateOnly(filters.endDate)}`);
    if (filters.paymentMethod) activeFilters.push(`Method: ${filters.paymentMethod}`);
    if (filters.minAmount) activeFilters.push(`Min: ${this.formatCurrency(filters.minAmount)}`);
    if (filters.maxAmount) activeFilters.push(`Max: ${this.formatCurrency(filters.maxAmount)}`);
    if (filters.cashier) activeFilters.push(`Cashier: ${filters.cashier}`);
    if (filters.customer) activeFilters.push(`Customer: ${filters.customer}`);

    if (activeFilters.length === 0) return 'No filters applied';
    return activeFilters.join(', ');
  }

  hasActiveFilters(): boolean {
    const filters = this.filterForm.value;
    return Object.values(filters).some(value => value !== '' && value !== null);
  }
}
