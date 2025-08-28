import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Product } from '@core/services/product.service';
import { CartItem } from '../pos/pos.component';

export interface SaleData {
  items: CartItem[];
  total: number;
  method: string;
  amount?: number;
  change?: number;
  reference?: string;
  notes?: string;
  timestamp: Date;
}

export interface SaleReceipt {
  id: string;
  items: CartItem[];
  total: number;
  tax: number;
  grandTotal: number;
  method: string;
  amount?: number;
  change?: number;
  reference?: string;
  notes?: string;
  timestamp: Date;
  cashier?: string;
  customer?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  requiresAmount: boolean;
  requiresReference: boolean;
}

export interface PosStats {
  totalSales: number;
  totalRevenue: number;
  averageSale: number;
  todaySales: number;
  todayRevenue: number;
  topProducts: Array<{ product: Product; quantity: number; revenue: number }>;
  paymentMethodBreakdown: { [key: string]: { count: number; amount: number } };
}

@Injectable({
  providedIn: 'root'
})
export class PosService {
  private readonly SALES_STORAGE_KEY = 'pos_sales';
  private readonly RECEIPTS_STORAGE_KEY = 'pos_receipts';
  private sales: SaleReceipt[] = [];

  constructor() {
    this.loadSalesFromStorage();
  }

  /**
   * Get products for POS
   */
  getProducts(): Observable<Product[]> {
    // In a real application, this would call the ProductService
    // For now, return mock data
    const mockProducts: Product[] = [
      {
        _id: '1',
        name: 'iPhone 15 Pro',
        sku: 'IPHONE-15-PRO',
        description: 'Latest iPhone with advanced features',
        price: { cost: 799, selling: 999, currency: 'USD' },
        inventory: { quantity: 25, minStock: 5, location: 'Main Store' },
        category: 'Electronics',
        subcategory: 'Smartphones',
        supplier: 'Apple Inc.',
        variants: [],
        images: [],
        weight: 0.187,
        dimensions: { length: 146.7, width: 71.5, height: 8.25 },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '2',
        name: 'MacBook Air M2',
        sku: 'MACBOOK-AIR-M2',
        description: 'Lightweight laptop with M2 chip',
        price: { cost: 999, selling: 1199, currency: 'USD' },
        inventory: { quantity: 15, minStock: 3, location: 'Main Store' },
        category: 'Electronics',
        subcategory: 'Laptops',
        supplier: 'Apple Inc.',
        variants: [],
        images: [],
        weight: 1.24,
        dimensions: { length: 304.1, width: 215.1, height: 11.3 },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '3',
        name: 'AirPods Pro',
        sku: 'AIRPODS-PRO',
        description: 'Wireless earbuds with noise cancellation',
        price: { cost: 199, selling: 249, currency: 'USD' },
        inventory: { quantity: 50, minStock: 10, location: 'Main Store' },
        category: 'Electronics',
        subcategory: 'Audio',
        supplier: 'Apple Inc.',
        variants: [],
        images: [],
        weight: 0.0056,
        dimensions: { length: 1.22, width: 0.86, height: 0.94 },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '4',
        name: 'iPad Air',
        sku: 'IPAD-AIR',
        description: 'Versatile tablet for work and play',
        price: { cost: 499, selling: 599, currency: 'USD' },
        inventory: { quantity: 30, minStock: 8, location: 'Main Store' },
        category: 'Electronics',
        subcategory: 'Tablets',
        supplier: 'Apple Inc.',
        variants: [],
        images: [],
        weight: 0.461,
        dimensions: { length: 247.6, width: 178.5, height: 6.1 },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '5',
        name: 'Apple Watch Series 9',
        sku: 'APPLE-WATCH-9',
        description: 'Advanced smartwatch with health features',
        price: { cost: 299, selling: 399, currency: 'USD' },
        inventory: { quantity: 20, minStock: 5, location: 'Main Store' },
        category: 'Electronics',
        subcategory: 'Wearables',
        supplier: 'Apple Inc.',
        variants: [],
        images: [],
        weight: 0.031,
        dimensions: { length: 41, width: 35, height: 10.7 },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return of(mockProducts).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Process a sale
   */
  processSale(saleData: SaleData): Observable<SaleReceipt> {
    // Validate sale data
    if (!saleData.items || saleData.items.length === 0) {
      return throwError(() => new Error('Sale must contain at least one item'));
    }

    if (saleData.total <= 0) {
      return throwError(() => new Error('Sale total must be greater than zero'));
    }

    // Create receipt
    const receipt: SaleReceipt = {
      id: this.generateSaleId(),
      items: saleData.items,
      total: saleData.total,
      tax: saleData.total * 0.085, // 8.5% tax
      grandTotal: saleData.total * 1.085,
      method: saleData.method,
      amount: saleData.amount,
      change: saleData.change,
      reference: saleData.reference,
      notes: saleData.notes,
      timestamp: saleData.timestamp,
      cashier: this.getCurrentUser(),
      customer: this.getCurrentCustomer()
    };

    // Save sale
    this.sales.push(receipt);
    this.saveSalesToStorage();

    // Update inventory (in a real app, this would call the inventory service)
    this.updateInventory(receipt);

    // Return receipt with simulated delay
    return of(receipt).pipe(delay(1000));
  }

  /**
   * Get sale by ID
   */
  getSaleById(saleId: string): Observable<SaleReceipt | null> {
    const sale = this.sales.find(s => s.id === saleId);
    return of(sale || null);
  }

  /**
   * Get all sales
   */
  getAllSales(): Observable<SaleReceipt[]> {
    return of([...this.sales]);
  }

  /**
   * Get sales by date range
   */
  getSalesByDateRange(startDate: Date, endDate: Date): Observable<SaleReceipt[]> {
    const filteredSales = this.sales.filter(sale => 
      sale.timestamp >= startDate && sale.timestamp <= endDate
    );
    return of(filteredSales);
  }

  /**
   * Get today's sales
   */
  getTodaySales(): Observable<SaleReceipt[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getSalesByDateRange(today, tomorrow);
  }

  /**
   * Get sales statistics
   */
  getPosStats(): Observable<PosStats> {
    const totalSales = this.sales.length;
    const totalRevenue = this.sales.reduce((sum, sale) => sum + sale.grandTotal, 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Today's stats
    const todaySales = this.sales.filter(sale => {
      const today = new Date();
      const saleDate = new Date(sale.timestamp);
      return saleDate.toDateString() === today.toDateString();
    });

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.grandTotal, 0);

    // Top products
    const productStats: { [key: string]: { product: Product; quantity: number; revenue: number } } = {};
    
    this.sales.forEach(sale => {
      sale.items.forEach(item => {
        const productId = item.product._id;
        if (!productStats[productId]) {
          productStats[productId] = {
            product: item.product,
            quantity: 0,
            revenue: 0
          };
        }
        productStats[productId].quantity += item.quantity;
        productStats[productId].revenue += item.total;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Payment method breakdown
    const paymentMethodBreakdown: { [key: string]: { count: number; amount: number } } = {};
    
    this.sales.forEach(sale => {
      if (!paymentMethodBreakdown[sale.method]) {
        paymentMethodBreakdown[sale.method] = { count: 0, amount: 0 };
      }
      paymentMethodBreakdown[sale.method].count++;
      paymentMethodBreakdown[sale.method].amount += sale.grandTotal;
    });

    const stats: PosStats = {
      totalSales,
      totalRevenue,
      averageSale,
      todaySales: todaySales.length,
      todayRevenue,
      topProducts,
      paymentMethodBreakdown
    };

    return of(stats);
  }

  /**
   * Print receipt
   */
  printReceipt(receipt: SaleReceipt): void {
    // In a real application, this would send the receipt to a printer
    // For now, we'll just log it and open a print dialog
    console.log('Printing receipt:', receipt);
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(this.generateReceiptHTML(receipt));
      printWindow.document.close();
      printWindow.print();
    }
  }

  /**
   * Email receipt
   */
  emailReceipt(receipt: SaleReceipt, email: string): Observable<boolean> {
    // In a real application, this would send an email
    // For now, just simulate success
    console.log('Emailing receipt to:', email, receipt);
    
    return of(true).pipe(delay(1000));
  }

  /**
   * Void sale
   */
  voidSale(saleId: string, reason: string): Observable<boolean> {
    const saleIndex = this.sales.findIndex(s => s.id === saleId);
    
    if (saleIndex === -1) {
      return throwError(() => new Error('Sale not found'));
    }

    // In a real application, you would need proper authorization
    // and the sale would be marked as voided rather than deleted
    
    // For now, we'll just remove it
    this.sales.splice(saleIndex, 1);
    this.saveSalesToStorage();

    console.log(`Sale ${saleId} voided. Reason: ${reason}`);
    
    return of(true);
  }

  /**
   * Get payment methods
   */
  getPaymentMethods(): Observable<PaymentMethod[]> {
    const methods: PaymentMethod[] = [
      {
        id: 'cash',
        name: 'Cash',
        icon: '💰',
        enabled: true,
        requiresAmount: true,
        requiresReference: false
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        icon: '💳',
        enabled: true,
        requiresAmount: false,
        requiresReference: true
      },
      {
        id: 'mobile',
        name: 'Mobile Payment',
        icon: '📱',
        enabled: true,
        requiresAmount: false,
        requiresReference: true
      },
      {
        id: 'bank',
        name: 'Bank Transfer',
        icon: '🏦',
        enabled: true,
        requiresAmount: false,
        requiresReference: true
      },
      {
        id: 'check',
        name: 'Check',
        icon: '📄',
        enabled: false,
        requiresAmount: false,
        requiresReference: true
      }
    ];

    return of(methods);
  }

  /**
   * Search products
   */
  searchProducts(query: string): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => {
        if (!query.trim()) return products;
        
        const lowerQuery = query.toLowerCase();
        return products.filter(product =>
          product.name.toLowerCase().includes(lowerQuery) ||
          product.sku.toLowerCase().includes(lowerQuery) ||
          product.category.toLowerCase().includes(lowerQuery) ||
          product.description?.toLowerCase().includes(lowerQuery)
        );
      })
    );
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => 
        products.filter(product => 
          product.inventory.quantity <= product.inventory.minStock
        )
      )
    );
  }

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(): Observable<Product[]> {
    return this.getProducts().pipe(
      map(products => 
        products.filter(product => product.inventory.quantity === 0)
      )
    );
  }

  /**
   * Export sales to CSV
   */
  exportSalesToCSV(startDate?: Date, endDate?: Date): string {
    let salesToExport = this.sales;
    
    if (startDate && endDate) {
      salesToExport = this.sales.filter(sale => 
        sale.timestamp >= startDate && sale.timestamp <= endDate
      );
    }

    const headers = [
      'Sale ID',
      'Date',
      'Items',
      'Subtotal',
      'Tax',
      'Total',
      'Payment Method',
      'Cashier',
      'Customer'
    ];

    const csvContent = [
      headers.join(','),
      ...salesToExport.map(sale => [
        sale.id,
        sale.timestamp.toISOString(),
        sale.items.map(item => `${item.product.name} (${item.quantity})`).join('; '),
        sale.total.toFixed(2),
        sale.tax.toFixed(2),
        sale.grandTotal.toFixed(2),
        sale.method,
        sale.cashier || '',
        sale.customer || ''
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Generate unique sale ID
   */
  private generateSaleId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `SALE-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Get current user (cashier)
   */
  private getCurrentUser(): string {
    // In a real application, this would come from the auth service
    return 'John Doe';
  }

  /**
   * Get current customer
   */
  private getCurrentCustomer(): string {
    // In a real application, this would be selected or entered
    return 'Walk-in Customer';
  }

  /**
   * Update inventory after sale
   */
  private updateInventory(receipt: SaleReceipt): void {
    // In a real application, this would call the inventory service
    // to update stock levels
    console.log('Updating inventory for sale:', receipt.id);
    
    receipt.items.forEach(item => {
      console.log(`Reducing ${item.product.name} stock by ${item.quantity}`);
      // item.product.inventory.quantity -= item.quantity;
    });
  }

  /**
   * Generate receipt HTML for printing
   */
  private generateReceiptHTML(receipt: SaleReceipt): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt ${receipt.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { max-width: 400px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px solid #000; padding-top: 10px; margin-top: 20px; font-weight: bold; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>Shop Inventory Management</h2>
              <p>Receipt #${receipt.id}</p>
              <p>${receipt.timestamp.toLocaleString()}</p>
            </div>
            
            <div class="items">
              ${receipt.items.map(item => `
                <div class="item">
                  <span>${item.product.name} x${item.quantity}</span>
                  <span>$${item.total.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              <div class="item">
                <span>Subtotal:</span>
                <span>$${receipt.total.toFixed(2)}</span>
              </div>
              <div class="item">
                <span>Tax (8.5%):</span>
                <span>$${receipt.tax.toFixed(2)}</span>
              </div>
              <div class="item">
                <span>Total:</span>
                <span>$${receipt.grandTotal.toFixed(2)}</span>
              </div>
              ${receipt.method === 'cash' && receipt.amount ? `
                <div class="item">
                  <span>Amount Received:</span>
                  <span>$${receipt.amount.toFixed(2)}</span>
                </div>
                <div class="item">
                  <span>Change:</span>
                  <span>$${receipt.change?.toFixed(2) || '0.00'}</span>
                </div>
              ` : ''}
            </div>
            
            <div class="footer">
              <p>Payment Method: ${receipt.method}</p>
              ${receipt.reference ? `<p>Reference: ${receipt.reference}</p>` : ''}
              ${receipt.notes ? `<p>Notes: ${receipt.notes}</p>` : ''}
              <p>Thank you for your purchase!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Load sales from localStorage
   */
  private loadSalesFromStorage(): void {
    try {
      const salesData = localStorage.getItem(this.SALES_STORAGE_KEY);
      if (salesData) {
        const savedSales = JSON.parse(salesData);
        if (Array.isArray(savedSales)) {
          this.sales = savedSales.map(sale => ({
            ...sale,
            timestamp: new Date(sale.timestamp)
          }));
        }
      }
    } catch (error) {
      console.error('Error loading sales from storage:', error);
    }
  }

  /**
   * Save sales to localStorage
   */
  private saveSalesToStorage(): void {
    try {
      localStorage.setItem(this.SALES_STORAGE_KEY, JSON.stringify(this.sales));
    } catch (error) {
      console.error('Error saving sales to storage:', error);
    }
  }
}
