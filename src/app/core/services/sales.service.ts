import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';

export interface SaleItem {
  product: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  _id: string;
  customer: string;
  items: SaleItem[];
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check';
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  date: Date;
  staffId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSaleDto {
  customer: string;
  items: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check';
  notes?: string;
}

export interface UpdateSaleDto {
  customer?: string;
  items?: Array<{
    product: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod?: 'cash' | 'card' | 'transfer' | 'check';
  status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
}

export interface SaleQueryParams {
  customer?: string;
  staffId?: string;
  status?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
  salesToday: number;
  revenueToday: number;
  salesThisWeek: number;
  revenueThisWeek: number;
  salesThisMonth: number;
  revenueThisMonth: number;
  topProducts: Array<{
    product: string;
    quantity: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customer: string;
    orders: number;
    totalSpent: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private readonly endpoint = '/sales';

  constructor(private apiService: ApiService) {}

  /**
   * Get all sales with optional filtering and pagination
   */
  getSales(params?: SaleQueryParams): Observable<PaginatedResponse<Sale>> {
    return this.apiService.get<PaginatedResponse<Sale>>(this.endpoint, params);
  }

  /**
   * Get a single sale by ID
   */
  getSale(id: string): Observable<Sale> {
    return this.apiService.get<Sale>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new sale
   */
  createSale(sale: CreateSaleDto, staffId: string): Observable<Sale> {
    return this.apiService.post<Sale>(this.endpoint, { ...sale, staffId });
  }

  /**
   * Update an existing sale
   */
  updateSale(id: string, sale: UpdateSaleDto): Observable<Sale> {
    return this.apiService.put<Sale>(`${this.endpoint}/${id}`, sale);
  }

  /**
   * Delete a sale
   */
  deleteSale(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Get sales by customer
   */
  getSalesByCustomer(customerId: string, params?: Omit<SaleQueryParams, 'customer'>): Observable<PaginatedResponse<Sale>> {
    const queryParams = { ...params, customer: customerId };
    return this.apiService.get<PaginatedResponse<Sale>>(this.endpoint, queryParams);
  }

  /**
   * Get sales by staff member
   */
  getSalesByStaff(staffId: string, params?: Omit<SaleQueryParams, 'staffId'>): Observable<PaginatedResponse<Sale>> {
    const queryParams = { ...params, staffId };
    return this.apiService.get<PaginatedResponse<Sale>>(this.endpoint, queryParams);
  }

  /**
   * Get sales by status
   */
  getSalesByStatus(status: string, params?: Omit<SaleQueryParams, 'status'>): Observable<PaginatedResponse<Sale>> {
    const queryParams = { ...params, status };
    return this.apiService.get<PaginatedResponse<Sale>>(this.endpoint, queryParams);
  }

  /**
   * Get sales by date range
   */
  getSalesByDateRange(startDate: Date, endDate: Date, params?: Omit<SaleQueryParams, 'startDate' | 'endDate'>): Observable<PaginatedResponse<Sale>> {
    const queryParams = { ...params, startDate, endDate };
    return this.apiService.get<PaginatedResponse<Sale>>(this.endpoint, queryParams);
  }

  /**
   * Get sales by payment method
   */
  getSalesByPaymentMethod(paymentMethod: string, params?: Omit<SaleQueryParams, 'paymentMethod'>): Observable<PaginatedResponse<Sale>> {
    const queryParams = { ...params, paymentMethod };
    return this.apiService.get<PaginatedResponse<Sale>>(this.endpoint, queryParams);
  }

  /**
   * Get sales statistics
   */
  getSalesStats(startDate?: Date, endDate?: Date): Observable<SalesStats> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return this.apiService.get<SalesStats>(`${this.endpoint}/stats`, params);
  }

  /**
   * Get daily sales report
   */
  getDailySalesReport(date: Date): Observable<{
    date: Date;
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    salesByHour: Array<{ hour: number; sales: number; revenue: number }>;
  }> {
    return this.apiService.get<{
      date: Date;
      totalSales: number;
      totalRevenue: number;
      averageOrderValue: number;
      salesByHour: Array<{ hour: number; sales: number; revenue: number }>;
    }>(`${this.endpoint}/daily-report`, { date });
  }

  /**
   * Get weekly sales report
   */
  getWeeklySalesReport(startDate: Date): Observable<{
    weekStart: Date;
    weekEnd: Date;
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    salesByDay: Array<{ date: Date; sales: number; revenue: number }>;
  }> {
    return this.apiService.get<{
      weekStart: Date;
      weekEnd: Date;
      totalSales: number;
      totalRevenue: number;
      averageOrderValue: number;
      salesByDay: Array<{ date: Date; sales: number; revenue: number }>;
    }>(`${this.endpoint}/weekly-report`, { startDate });
  }

  /**
   * Get monthly sales report
   */
  getMonthlySalesReport(year: number, month: number): Observable<{
    year: number;
    month: number;
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    salesByDay: Array<{ date: Date; sales: number; revenue: number }>;
  }> {
    return this.apiService.get<{
      year: number;
      month: number;
      totalSales: number;
      totalRevenue: number;
      averageOrderValue: number;
      salesByDay: Array<{ date: Date; sales: number; revenue: number }>;
    }>(`${this.endpoint}/monthly-report`, { year, month });
  }

  /**
   * Get yearly sales report
   */
  getYearlySalesReport(year: number): Observable<{
    year: number;
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    salesByMonth: Array<{ month: number; sales: number; revenue: number }>;
  }> {
    return this.apiService.get<{
      year: number;
      totalSales: number;
      totalRevenue: number;
      averageOrderValue: number;
      salesByMonth: Array<{ month: number; sales: number; revenue: number }>;
    }>(`${this.endpoint}/yearly-report`, { year });
  }

  /**
   * Get top selling products
   */
  getTopSellingProducts(limit: number = 10, startDate?: Date, endDate?: Date): Observable<Array<{
    product: string;
    quantity: number;
    revenue: number;
    productDetails: {
      name: string;
      sku: string;
      category: string;
    };
  }>> {
    const params: any = { limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return this.apiService.get<Array<{
      product: string;
      quantity: number;
      revenue: number;
      productDetails: {
        name: string;
        sku: string;
        category: string;
      };
    }>>(`${this.endpoint}/top-products`, params);
  }

  /**
   * Get top customers by revenue
   */
  getTopCustomers(limit: number = 10, startDate?: Date, endDate?: Date): Observable<Array<{
    customer: string;
    orders: number;
    totalSpent: number;
    customerDetails: {
      firstName: string;
      lastName: string;
      email: string;
      company?: string;
    };
  }>> {
    const params: any = { limit };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    return this.apiService.get<Array<{
      customer: string;
      orders: number;
      totalSpent: number;
      customerDetails: {
        firstName: string;
        lastName: string;
        email: string;
        company?: string;
      };
    }>>(`${this.endpoint}/top-customers`, params);
  }

  /**
   * Export sales to CSV
   */
  exportSalesToCsv(params?: SaleQueryParams): Observable<Blob> {
    return this.apiService.download(`${this.endpoint}/export/csv`, params);
  }

  /**
   * Export sales to PDF
   */
  exportSalesToPdf(params?: SaleQueryParams): Observable<Blob> {
    return this.apiService.download(`${this.endpoint}/export/pdf`, params);
  }

  /**
   * Get sales forecast
   */
  getSalesForecast(days: number = 30): Observable<Array<{
    date: Date;
    predictedSales: number;
    predictedRevenue: number;
    confidence: number;
  }>> {
    return this.apiService.get<Array<{
      date: Date;
      predictedSales: number;
      predictedRevenue: number;
      confidence: number;
    }>>(`${this.endpoint}/forecast`, { days });
  }

  /**
   * Cancel a sale
   */
  cancelSale(id: string, reason?: string): Observable<Sale> {
    return this.apiService.put<Sale>(`${this.endpoint}/${id}/cancel`, { reason });
  }

  /**
   * Refund a sale
   */
  refundSale(id: string, amount: number, reason?: string): Observable<Sale> {
    return this.apiService.put<Sale>(`${this.endpoint}/${id}/refund`, { amount, reason });
  }

  /**
   * Get sale receipt
   */
  getSaleReceipt(id: string): Observable<Blob> {
    return this.apiService.download(`${this.endpoint}/${id}/receipt`);
  }

  /**
   * Get sale invoice
   */
  getSaleInvoice(id: string): Observable<Blob> {
    return this.apiService.download(`${this.endpoint}/${id}/invoice`);
  }

  /**
   * Send sale receipt by email
   */
  sendSaleReceiptByEmail(id: string, email: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>(`${this.endpoint}/${id}/send-receipt`, { email });
  }

  /**
   * Send sale invoice by email
   */
  sendSaleInvoiceByEmail(id: string, email: string): Observable<{ message: string }> {
    return this.apiService.post<{ message: string }>(`${this.endpoint}/${id}/send-invoice`, { email });
  }
}
