import { createReducer, on } from '@ngrx/store';
import { ProductState, initialProductState } from './product.state';
import * as ProductActions from './product.actions';

export const productReducer = createReducer(
  initialProductState,

  // Load Products
  on(ProductActions.loadProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.loadProductsSuccess, (state, { products, total, page, limit, totalPages, filters }) => ({
    ...state,
    products,
    totalProducts: total,
    currentPage: page,
    pageSize: limit,
    totalPages,
    filters,
    isLoading: false,
    error: null
  })),

  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Load Single Product
  on(ProductActions.loadProduct, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.loadProductSuccess, (state, { product }) => ({
    ...state,
    selectedProduct: product,
    isLoading: false,
    error: null
  })),

  on(ProductActions.loadProductFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Create Product
  on(ProductActions.createProduct, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.createProductSuccess, (state, { product }) => ({
    ...state,
    products: [product, ...state.products],
    totalProducts: state.totalProducts + 1,
    isLoading: false,
    error: null
  })),

  on(ProductActions.createProductFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Update Product
  on(ProductActions.updateProduct, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.updateProductSuccess, (state, { product }) => ({
    ...state,
    products: state.products.map(p => p._id === product._id ? product : p),
    selectedProduct: state.selectedProduct?._id === product._id ? product : state.selectedProduct,
    isLoading: false,
    error: null
  })),

  on(ProductActions.updateProductFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Delete Product
  on(ProductActions.deleteProduct, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.deleteProductSuccess, (state, { id }) => ({
    ...state,
    products: state.products.filter(p => p._id !== id),
    selectedProduct: state.selectedProduct?._id === id ? null : state.selectedProduct,
    totalProducts: state.totalProducts - 1,
    isLoading: false,
    error: null
  })),

  on(ProductActions.deleteProductFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Update Stock
  on(ProductActions.updateProductStock, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.updateProductStockSuccess, (state, { product }) => ({
    ...state,
    products: state.products.map(p => p._id === product._id ? product : p),
    selectedProduct: state.selectedProduct?._id === product._id ? product : state.selectedProduct,
    isLoading: false,
    error: null
  })),

  on(ProductActions.updateProductStockFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Load Categories
  on(ProductActions.loadCategories, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.loadCategoriesSuccess, (state, { categories }) => ({
    ...state,
    categories,
    isLoading: false,
    error: null
  })),

  on(ProductActions.loadCategoriesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Load Subcategories
  on(ProductActions.loadSubcategories, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.loadSubcategoriesSuccess, (state, { subcategories }) => ({
    ...state,
    subcategories,
    isLoading: false,
    error: null
  })),

  on(ProductActions.loadSubcategoriesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Load Low Stock Products
  on(ProductActions.loadLowStockProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.loadLowStockProductsSuccess, (state, { products }) => ({
    ...state,
    lowStockProducts: products,
    isLoading: false,
    error: null
  })),

  on(ProductActions.loadLowStockProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Load Out of Stock Products
  on(ProductActions.loadOutOfStockProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.loadOutOfStockProductsSuccess, (state, { products }) => ({
    ...state,
    outOfStockProducts: products,
    isLoading: false,
    error: null
  })),

  on(ProductActions.loadOutOfStockProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Load Product Stats
  on(ProductActions.loadProductStats, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.loadProductStatsSuccess, (state, { stats }) => ({
    ...state,
    productStats: stats,
    isLoading: false,
    error: null
  })),

  on(ProductActions.loadProductStatsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Search Products
  on(ProductActions.searchProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.searchProductsSuccess, (state, { products, total, page, limit, totalPages, searchQuery }) => ({
    ...state,
    products,
    totalProducts: total,
    currentPage: page,
    pageSize: limit,
    totalPages,
    searchQuery,
    isLoading: false,
    error: null
  })),

  on(ProductActions.searchProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Filter Products
  on(ProductActions.setProductFilters, (state, { filters }) => ({
    ...state,
    filters: { ...state.filters, ...filters },
    currentPage: 1 // Reset to first page when filters change
  })),

  on(ProductActions.clearProductFilters, (state) => ({
    ...state,
    filters: {},
    searchQuery: '',
    selectedCategory: null,
    selectedSupplier: null,
    priceRange: { min: null, max: null },
    inStockOnly: false,
    currentPage: 1
  })),

  on(ProductActions.setProductCategory, (state, { category }) => ({
    ...state,
    selectedCategory: category,
    currentPage: 1
  })),

  on(ProductActions.setProductSupplier, (state, { supplier }) => ({
    ...state,
    selectedSupplier: supplier,
    currentPage: 1
  })),

  on(ProductActions.setPriceRange, (state, { min, max }) => ({
    ...state,
    priceRange: { min, max },
    currentPage: 1
  })),

  on(ProductActions.setInStockOnly, (state, { inStockOnly }) => ({
    ...state,
    inStockOnly,
    currentPage: 1
  })),

  // Pagination
  on(ProductActions.setProductPage, (state, { page }) => ({
    ...state,
    currentPage: page
  })),

  on(ProductActions.setProductPageSize, (state, { pageSize }) => ({
    ...state,
    pageSize,
    currentPage: 1
  })),

  // Sorting
  on(ProductActions.setProductSort, (state, { sortBy, sortOrder }) => ({
    ...state,
    sortBy,
    sortOrder
  })),

  // Selection
  on(ProductActions.selectProduct, (state, { product }) => ({
    ...state,
    selectedProduct: product
  })),

  on(ProductActions.clearSelectedProduct, (state) => ({
    ...state,
    selectedProduct: null
  })),

  // Bulk Operations
  on(ProductActions.bulkUpdateProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.bulkUpdateProductsSuccess, (state, { products }) => ({
    ...state,
    products: state.products.map(p => {
      const updatedProduct = products.find(up => up._id === p._id);
      return updatedProduct || p;
    }),
    isLoading: false,
    error: null
  })),

  on(ProductActions.bulkUpdateProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(ProductActions.bulkDeleteProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.bulkDeleteProductsSuccess, (state, { deletedCount }) => ({
    ...state,
    products: state.products.filter(p => !state.products.slice(0, deletedCount).some(dp => dp._id === p._id)),
    totalProducts: state.totalProducts - deletedCount,
    isLoading: false,
    error: null
  })),

  on(ProductActions.bulkDeleteProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Export/Import
  on(ProductActions.exportProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.exportProductsSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(ProductActions.exportProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(ProductActions.importProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.importProductsSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null
  })),

  on(ProductActions.importProductsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Image Upload
  on(ProductActions.uploadProductImage, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.uploadProductImageSuccess, (state, { productId, imageUrl }) => ({
    ...state,
    products: state.products.map(p => 
      p._id === productId 
        ? { ...p, images: [...(p.images || []), imageUrl] }
        : p
    ),
    selectedProduct: state.selectedProduct?._id === productId 
      ? { ...state.selectedProduct, images: [...(state.selectedProduct.images || []), imageUrl] }
      : state.selectedProduct,
    isLoading: false,
    error: null
  })),

  on(ProductActions.uploadProductImageFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  on(ProductActions.deleteProductImage, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.deleteProductImageSuccess, (state, { productId, imageUrl }) => ({
    ...state,
    products: state.products.map(p => 
      p._id === productId 
        ? { ...p, images: (p.images || []).filter(img => img !== imageUrl) }
        : p
    ),
    selectedProduct: state.selectedProduct?._id === productId 
      ? { ...state.selectedProduct, images: (state.selectedProduct.images || []).filter(img => img !== imageUrl) }
      : state.selectedProduct,
    isLoading: false,
    error: null
  })),

  on(ProductActions.deleteProductImageFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),

  // Clear Actions
  on(ProductActions.clearProductError, (state) => ({
    ...state,
    error: null
  })),

  on(ProductActions.clearProductState, () => ({
    ...initialProductState
  })),

  // Refresh Actions
  on(ProductActions.refreshProducts, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(ProductActions.refreshProductStats, (state) => ({
    ...state,
    isLoading: true,
    error: null
  }))
);
