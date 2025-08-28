import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse } from './api.service';

export interface ProductPrice {
  cost: number;
  selling: number;
  currency: string;
}

export interface ProductInventory {
  quantity: number;
  minStock: number;
  location: string;
}

export interface ProductVariant {
  name: string;
  value: string;
  priceModifier?: number;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: ProductPrice;
  inventory: ProductInventory;
  supplier?: string;
  variants?: ProductVariant[];
  images?: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: ProductPrice;
  inventory: ProductInventory;
  supplier?: string;
  variants?: ProductVariant[];
  images?: string[];
  weight?: number;
  dimensions?: ProductDimensions;
  isActive?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  price?: Partial<ProductPrice>;
  inventory?: Partial<ProductInventory>;
  supplier?: string;
  variants?: ProductVariant[];
  images?: string[];
  weight?: number;
  dimensions?: Partial<ProductDimensions>;
  isActive?: boolean;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  supplier?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StockUpdateDto {
  quantity: number;
  operation?: 'add' | 'subtract';
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly endpoint = '/products';

  constructor(private apiService: ApiService) {}

  /**
   * Get all products with optional filtering and pagination
   */
  getProducts(params?: ProductQueryParams): Observable<PaginatedResponse<Product>> {
    return this.apiService.get<PaginatedResponse<Product>>(this.endpoint, params);
  }

  /**
   * Get a single product by ID
   */
  getProduct(id: string): Observable<Product> {
    return this.apiService.get<Product>(`${this.endpoint}/${id}`);
  }

  /**
   * Get a product by SKU
   */
  getProductBySku(sku: string): Observable<Product> {
    return this.apiService.get<Product>(`${this.endpoint}/sku/${sku}`);
  }

  /**
   * Create a new product
   */
  createProduct(product: CreateProductDto): Observable<Product> {
    return this.apiService.post<Product>(this.endpoint, product);
  }

  /**
   * Update an existing product
   */
  updateProduct(id: string, product: UpdateProductDto): Observable<Product> {
    return this.apiService.put<Product>(`${this.endpoint}/${id}`, product);
  }

  /**
   * Delete a product
   */
  deleteProduct(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Update product stock
   */
  updateStock(id: string, stockUpdate: StockUpdateDto): Observable<Product> {
    return this.apiService.put<Product>(`${this.endpoint}/${id}/stock`, stockUpdate);
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: string, params?: Omit<ProductQueryParams, 'category'>): Observable<PaginatedResponse<Product>> {
    const queryParams = { ...params, category };
    return this.apiService.get<PaginatedResponse<Product>>(this.endpoint, queryParams);
  }

  /**
   * Get products by supplier
   */
  getProductsBySupplier(supplierId: string, params?: Omit<ProductQueryParams, 'supplier'>): Observable<PaginatedResponse<Product>> {
    const queryParams = { ...params, supplier: supplierId };
    return this.apiService.get<PaginatedResponse<Product>>(this.endpoint, queryParams);
  }

  /**
   * Search products by text
   */
  searchProducts(query: string, params?: Omit<ProductQueryParams, 'search'>): Observable<PaginatedResponse<Product>> {
    const queryParams = { ...params, search: query };
    return this.apiService.get<PaginatedResponse<Product>>(this.endpoint, queryParams);
  }

  /**
   * Get low stock products
   */
  getLowStockProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>(`${this.endpoint}/low-stock`);
  }

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(): Observable<Product[]> {
    return this.apiService.get<Product[]>(`${this.endpoint}/out-of-stock`);
  }

  /**
   * Get product categories
   */
  getCategories(): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.endpoint}/categories`);
  }

  /**
   * Get subcategories for a category
   */
  getSubcategories(category: string): Observable<string[]> {
    return this.apiService.get<string[]>(`${this.endpoint}/subcategories/${category}`);
  }

  /**
   * Upload product image
   */
  uploadImage(productId: string, file: File): Observable<{ imageUrl: string }> {
    return this.apiService.upload<{ imageUrl: string }>(`${this.endpoint}/${productId}/images`, file);
  }

  /**
   * Delete product image
   */
  deleteImage(productId: string, imageUrl: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${productId}/images`, { imageUrl });
  }

  /**
   * Bulk update products
   */
  bulkUpdate(updates: Array<{ id: string; updates: UpdateProductDto }>): Observable<Product[]> {
    return this.apiService.post<Product[]>(`${this.endpoint}/bulk-update`, { updates });
  }

  /**
   * Bulk delete products
   */
  bulkDelete(ids: string[]): Observable<{ deletedCount: number }> {
    return this.apiService.post<{ deletedCount: number }>(`${this.endpoint}/bulk-delete`, { ids });
  }

  /**
   * Export products to CSV
   */
  exportToCsv(params?: ProductQueryParams): Observable<Blob> {
    return this.apiService.download(`${this.endpoint}/export/csv`, params);
  }

  /**
   * Import products from CSV
   */
  importFromCsv(file: File): Observable<{ importedCount: number; errors: string[] }> {
    return this.apiService.upload<{ importedCount: number; errors: string[] }>(`${this.endpoint}/import/csv`, file);
  }

  /**
   * Get product statistics
   */
  getProductStats(): Observable<{
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalValue: number;
    categories: { name: string; count: number }[];
  }> {
    return this.apiService.get<{
      totalProducts: number;
      activeProducts: number;
      lowStockProducts: number;
      outOfStockProducts: number;
      totalValue: number;
      categories: { name: string; count: number }[];
    }>(`${this.endpoint}/stats`);
  }

  /**
   * Check if SKU exists
   */
  checkSkuExists(sku: string): Observable<{ exists: boolean }> {
    return this.apiService.get<{ exists: boolean }>(`${this.endpoint}/check-sku/${sku}`);
  }

  /**
   * Get product history
   */
  getProductHistory(id: string): Observable<{
    priceHistory: Array<{ date: Date; price: number }>;
    stockHistory: Array<{ date: Date; quantity: number; operation: string }>;
  }> {
    return this.apiService.get<{
      priceHistory: Array<{ date: Date; price: number }>;
      stockHistory: Array<{ date: Date; quantity: number; operation: string }>;
    }>(`${this.endpoint}/${id}/history`);
  }
}
