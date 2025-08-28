import { createAction, props } from '@ngrx/store';
import { Product, CreateProductDto, UpdateProductDto, ProductQueryParams } from '../../services/product.service';

// Load Products Actions
export const loadProducts = createAction(
  '[Product] Load Products',
  props<{ params?: ProductQueryParams }>()
);

export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ 
    products: Product[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
    filters: ProductQueryParams;
  }>()
);

export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: string }>()
);

// Load Single Product Actions
export const loadProduct = createAction(
  '[Product] Load Product',
  props<{ id: string }>()
);

export const loadProductSuccess = createAction(
  '[Product] Load Product Success',
  props<{ product: Product }>()
);

export const loadProductFailure = createAction(
  '[Product] Load Product Failure',
  props<{ error: string }>()
);

// Create Product Actions
export const createProduct = createAction(
  '[Product] Create Product',
  props<{ product: CreateProductDto }>()
);

export const createProductSuccess = createAction(
  '[Product] Create Product Success',
  props<{ product: Product }>()
);

export const createProductFailure = createAction(
  '[Product] Create Product Failure',
  props<{ error: string }>()
);

// Update Product Actions
export const updateProduct = createAction(
  '[Product] Update Product',
  props<{ id: string; updates: UpdateProductDto }>()
);

export const updateProductSuccess = createAction(
  '[Product] Update Product Success',
  props<{ product: Product }>()
);

export const updateProductFailure = createAction(
  '[Product] Update Product Failure',
  props<{ error: string }>()
);

// Delete Product Actions
export const deleteProduct = createAction(
  '[Product] Delete Product',
  props<{ id: string }>()
);

export const deleteProductSuccess = createAction(
  '[Product] Delete Product Success',
  props<{ id: string }>()
);

export const deleteProductFailure = createAction(
  '[Product] Delete Product Failure',
  props<{ error: string }>()
);

// Update Stock Actions
export const updateProductStock = createAction(
  '[Product] Update Product Stock',
  props<{ id: string; quantity: number; operation?: 'add' | 'subtract' }>()
);

export const updateProductStockSuccess = createAction(
  '[Product] Update Product Stock Success',
  props<{ product: Product }>()
);

export const updateProductStockFailure = createAction(
  '[Product] Update Product Stock Failure',
  props<{ error: string }>()
);

// Load Categories Actions
export const loadCategories = createAction('[Product] Load Categories');

export const loadCategoriesSuccess = createAction(
  '[Product] Load Categories Success',
  props<{ categories: string[] }>()
);

export const loadCategoriesFailure = createAction(
  '[Product] Load Categories Failure',
  props<{ error: string }>()
);

// Load Subcategories Actions
export const loadSubcategories = createAction(
  '[Product] Load Subcategories',
  props<{ category: string }>()
);

export const loadSubcategoriesSuccess = createAction(
  '[Product] Load Subcategories Success',
  props<{ subcategories: string[] }>()
);

export const loadSubcategoriesFailure = createAction(
  '[Product] Load Subcategories Failure',
  props<{ error: string }>()
);

// Load Low Stock Products Actions
export const loadLowStockProducts = createAction('[Product] Load Low Stock Products');

export const loadLowStockProductsSuccess = createAction(
  '[Product] Load Low Stock Products Success',
  props<{ products: Product[] }>()
);

export const loadLowStockProductsFailure = createAction(
  '[Product] Load Low Stock Products Failure',
  props<{ error: string }>()
);

// Load Out of Stock Products Actions
export const loadOutOfStockProducts = createAction('[Product] Load Out of Stock Products');

export const loadOutOfStockProductsSuccess = createAction(
  '[Product] Load Out of Stock Products Success',
  props<{ products: Product[] }>()
);

export const loadOutOfStockProductsFailure = createAction(
  '[Product] Load Out of Stock Products Failure',
  props<{ error: string }>()
);

// Load Product Stats Actions
export const loadProductStats = createAction('[Product] Load Product Stats');

export const loadProductStatsSuccess = createAction(
  '[Product] Load Product Stats Success',
  props<{ stats: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalValue: number;
    categories: { name: string; count: number }[];
  } }>()
);

export const loadProductStatsFailure = createAction(
  '[Product] Load Product Stats Failure',
  props<{ error: string }>()
);

// Search Products Actions
export const searchProducts = createAction(
  '[Product] Search Products',
  props<{ query: string; params?: Omit<ProductQueryParams, 'search'> }>()
);

export const searchProductsSuccess = createAction(
  '[Product] Search Products Success',
  props<{ 
    products: Product[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
    searchQuery: string;
  }>()
);

export const searchProductsFailure = createAction(
  '[Product] Search Products Failure',
  props<{ error: string }>()
);

// Filter Products Actions
export const setProductFilters = createAction(
  '[Product] Set Filters',
  props<{ filters: Partial<ProductQueryParams> }>()
);

export const clearProductFilters = createAction('[Product] Clear Filters');

export const setProductCategory = createAction(
  '[Product] Set Category',
  props<{ category: string | null }>()
);

export const setProductSupplier = createAction(
  '[Product] Set Supplier',
  props<{ supplier: string | null }>()
);

export const setPriceRange = createAction(
  '[Product] Set Price Range',
  props<{ min: number | null; max: number | null }>()
);

export const setInStockOnly = createAction(
  '[Product] Set In Stock Only',
  props<{ inStockOnly: boolean }>()
);

// Pagination Actions
export const setProductPage = createAction(
  '[Product] Set Page',
  props<{ page: number }>()
);

export const setProductPageSize = createAction(
  '[Product] Set Page Size',
  props<{ pageSize: number }>()
);

// Sorting Actions
export const setProductSort = createAction(
  '[Product] Set Sort',
  props<{ sortBy: string; sortOrder: 'asc' | 'desc' }>()
);

// Selection Actions
export const selectProduct = createAction(
  '[Product] Select Product',
  props<{ product: Product | null }>()
);

export const clearSelectedProduct = createAction('[Product] Clear Selected Product');

// Bulk Operations Actions
export const bulkUpdateProducts = createAction(
  '[Product] Bulk Update Products',
  props<{ updates: Array<{ id: string; updates: UpdateProductDto }> }>()
);

export const bulkUpdateProductsSuccess = createAction(
  '[Product] Bulk Update Products Success',
  props<{ products: Product[] }>()
);

export const bulkUpdateProductsFailure = createAction(
  '[Product] Bulk Update Products Failure',
  props<{ error: string }>()
);

export const bulkDeleteProducts = createAction(
  '[Product] Bulk Delete Products',
  props<{ ids: string[] }>()
);

export const bulkDeleteProductsSuccess = createAction(
  '[Product] Bulk Delete Products Success',
  props<{ deletedCount: number }>()
);

export const bulkDeleteProductsFailure = createAction(
  '[Product] Bulk Delete Products Failure',
  props<{ error: string }>()
);

// Export/Import Actions
export const exportProducts = createAction(
  '[Product] Export Products',
  props<{ params?: ProductQueryParams }>()
);

export const exportProductsSuccess = createAction(
  '[Product] Export Products Success',
  props<{ blob: Blob; filename: string }>()
);

export const exportProductsFailure = createAction(
  '[Product] Export Products Failure',
  props<{ error: string }>()
);

export const importProducts = createAction(
  '[Product] Import Products',
  props<{ file: File }>()
);

export const importProductsSuccess = createAction(
  '[Product] Import Products Success',
  props<{ importedCount: number; errors: string[] }>()
);

export const importProductsFailure = createAction(
  '[Product] Import Products Failure',
  props<{ error: string }>()
);

// Image Upload Actions
export const uploadProductImage = createAction(
  '[Product] Upload Product Image',
  props<{ productId: string; file: File }>()
);

export const uploadProductImageSuccess = createAction(
  '[Product] Upload Product Image Success',
  props<{ productId: string; imageUrl: string }>()
);

export const uploadProductImageFailure = createAction(
  '[Product] Upload Product Image Failure',
  props<{ error: string }>()
);

export const deleteProductImage = createAction(
  '[Product] Delete Product Image',
  props<{ productId: string; imageUrl: string }>()
);

export const deleteProductImageSuccess = createAction(
  '[Product] Delete Product Image Success',
  props<{ productId: string; imageUrl: string }>()
);

export const deleteProductImageFailure = createAction(
  '[Product] Delete Product Image Failure',
  props<{ error: string }>()
);

// Clear Actions
export const clearProductError = createAction('[Product] Clear Error');

export const clearProductState = createAction('[Product] Clear State');

// Refresh Actions
export const refreshProducts = createAction('[Product] Refresh Products');

export const refreshProductStats = createAction('[Product] Refresh Product Stats');
