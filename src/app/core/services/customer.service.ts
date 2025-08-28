import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';

export interface CustomerAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Customer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: CustomerAddress;
  company?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: CustomerAddress;
  company?: string;
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Partial<CustomerAddress>;
  company?: string;
}

export interface CustomerQueryParams {
  search?: string;
  company?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly endpoint = '/customers';

  constructor(private apiService: ApiService) {}

  /**
   * Get all customers with optional filtering and pagination
   */
  getCustomers(params?: CustomerQueryParams): Observable<PaginatedResponse<Customer>> {
    return this.apiService.get<PaginatedResponse<Customer>>(this.endpoint, params);
  }

  /**
   * Get a single customer by ID
   */
  getCustomer(id: string): Observable<Customer> {
    return this.apiService.get<Customer>(`${this.endpoint}/${id}`);
  }

  /**
   * Get a customer by email
   */
  getCustomerByEmail(email: string): Observable<Customer> {
    return this.apiService.get<Customer>(`${this.endpoint}/email/${email}`);
  }

  /**
   * Create a new customer
   */
  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.apiService.post<Customer>(this.endpoint, customer);
  }

  /**
   * Update an existing customer
   */
  updateCustomer(id: string, customer: UpdateCustomerDto): Observable<Customer> {
    return this.apiService.put<Customer>(`${this.endpoint}/${id}`, customer);
  }

  /**
   * Delete a customer
   */
  deleteCustomer(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Search customers by query
   */
  searchCustomers(query: string, params?: Omit<CustomerQueryParams, 'search'>): Observable<PaginatedResponse<Customer>> {
    const queryParams = { ...params, search: query };
    return this.apiService.get<PaginatedResponse<Customer>>(this.endpoint, queryParams);
  }

  /**
   * Get customers by company
   */
  getCustomersByCompany(company: string, params?: Omit<CustomerQueryParams, 'company'>): Observable<PaginatedResponse<Customer>> {
    const queryParams = { ...params, company };
    return this.apiService.get<PaginatedResponse<Customer>>(this.endpoint, queryParams);
  }

  /**
   * Get active customers only
   */
  getActiveCustomers(params?: Omit<CustomerQueryParams, 'isActive'>): Observable<PaginatedResponse<Customer>> {
    const queryParams = { ...params, isActive: true };
    return this.apiService.get<PaginatedResponse<Customer>>(this.endpoint, queryParams);
  }

  /**
   * Get inactive customers only
   */
  getInactiveCustomers(params?: Omit<CustomerQueryParams, 'isActive'>): Observable<PaginatedResponse<Customer>> {
    const queryParams = { ...params, isActive: false };
    return this.apiService.get<PaginatedResponse<Customer>>(this.endpoint, queryParams);
  }

  /**
   * Deactivate a customer
   */
  deactivateCustomer(id: string): Observable<Customer> {
    return this.apiService.put<Customer>(`${this.endpoint}/${id}/deactivate`, {});
  }

  /**
   * Activate a customer
   */
  activateCustomer(id: string): Observable<Customer> {
    return this.apiService.put<Customer>(`${this.endpoint}/${id}/activate`, {});
  }

  /**
   * Get customer statistics
   */
  getCustomerStats(): Observable<{
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    newCustomersThisMonth: number;
    topCompanies: { company: string; count: number }[];
  }> {
    return this.apiService.get<{
      totalCustomers: number;
      activeCustomers: number;
      inactiveCustomers: number;
      newCustomersThisMonth: number;
      topCompanies: { company: string; count: number }[];
    }>(`${this.endpoint}/stats`);
  }

  /**
   * Get customer by phone number
   */
  getCustomerByPhone(phone: string): Observable<Customer> {
    return this.apiService.get<Customer>(`${this.endpoint}/phone/${phone}`);
  }

  /**
   * Check if email exists
   */
  checkEmailExists(email: string): Observable<{ exists: boolean }> {
    return this.apiService.get<{ exists: boolean }>(`${this.endpoint}/check-email/${email}`);
  }

  /**
   * Bulk update customers
   */
  bulkUpdate(updates: Array<{ id: string; updates: UpdateCustomerDto }>): Observable<Customer[]> {
    return this.apiService.post<Customer[]>(`${this.endpoint}/bulk-update`, { updates });
  }

  /**
   * Bulk delete customers
   */
  bulkDelete(ids: string[]): Observable<{ deletedCount: number }> {
    return this.apiService.post<{ deletedCount: number }>(`${this.endpoint}/bulk-delete`, { ids });
  }

  /**
   * Export customers to CSV
   */
  exportToCsv(params?: CustomerQueryParams): Observable<Blob> {
    return this.apiService.download(`${this.endpoint}/export/csv`, params);
  }

  /**
   * Import customers from CSV
   */
  importFromCsv(file: File): Observable<{ importedCount: number; errors: string[] }> {
    return this.apiService.upload<{ importedCount: number; errors: string[] }>(`${this.endpoint}/import/csv`, file);
  }

  /**
   * Get customer purchase history
   */
  getCustomerHistory(id: string): Observable<{
    totalPurchases: number;
    totalSpent: number;
    lastPurchase: Date;
    purchaseHistory: Array<{
      date: Date;
      amount: number;
      items: number;
      orderId: string;
    }>;
  }> {
    return this.apiService.get<{
      totalPurchases: number;
      totalSpent: number;
      lastPurchase: Date;
      purchaseHistory: Array<{
        date: Date;
        amount: number;
        items: number;
        orderId: string;
      }>;
    }>(`${this.endpoint}/${id}/history`);
  }

  /**
   * Get customer notes
   */
  getCustomerNotes(id: string): Observable<Array<{
    id: string;
    note: string;
    createdBy: string;
    createdAt: Date;
  }>> {
    return this.apiService.get<Array<{
      id: string;
      note: string;
      createdBy: string;
      createdAt: Date;
    }>>(`${this.endpoint}/${id}/notes`);
  }

  /**
   * Add note to customer
   */
  addCustomerNote(id: string, note: string): Observable<{
    id: string;
    note: string;
    createdBy: string;
    createdAt: Date;
  }> {
    return this.apiService.post<{
      id: string;
      note: string;
      createdBy: string;
      createdAt: Date;
    }>(`${this.endpoint}/${id}/notes`, { note });
  }

  /**
   * Get customer tags
   */
  getCustomerTags(id: string): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.endpoint}/${id}/tags`);
  }

  /**
   * Add tags to customer
   */
  addCustomerTags(id: string, tags: string[]): Observable<string[]> {
    return this.apiService.post<string[]>(`${this.endpoint}/${id}/tags`, { tags });
  }

  /**
   * Remove tags from customer
   */
  removeCustomerTags(id: string, tags: string[]): Observable<string[]> {
    return this.apiService.delete<string[]>(`${this.endpoint}/${id}/tags`, { tags });
  }

  /**
   * Get customers by tag
   */
  getCustomersByTag(tag: string, params?: Omit<CustomerQueryParams, 'search'>): Observable<PaginatedResponse<Customer>> {
    const queryParams = { ...params, tag };
    return this.apiService.get<PaginatedResponse<Customer>>(`${this.endpoint}/tag/${tag}`, queryParams);
  }
}
