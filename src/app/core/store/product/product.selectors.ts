import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from './product.state';

export const selectProductState = createFeatureSelector<ProductState>('products');

// Basic State Selectors
export const selectProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);

export const selectSelectedProduct = createSelector(
  selectProductState,
  (state: ProductState) => state.selectedProduct
);

export const selectIsLoading = createSelector(
  selectProductState,
  (state: ProductState) => state.isLoading
);

export const selectError = createSelector(
  selectProductState,
  (state: ProductState) => state.error
);

export const selectTotalProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.totalProducts
);

export const selectCurrentPage = createSelector(
  selectProductState,
  (state: ProductState) => state.currentPage
);

export const selectPageSize = createSelector(
  selectProductState,
  (state: ProductState) => state.pageSize
);

export const selectTotalPages = createSelector(
  selectProductState,
  (state: ProductState) => state.totalPages
);

export const selectFilters = createSelector(
  selectProductState,
  (state: ProductState) => state.filters
);

export const selectCategories = createSelector(
  selectProductState,
  (state: ProductState) => state.categories
);

export const selectSubcategories = createSelector(
  selectProductState,
  (state: ProductState) => state.subcategories
);

export const selectLowStockProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.lowStockProducts
);

export const selectOutOfStockProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.outOfStockProducts
);

export const selectProductStats = createSelector(
  selectProductState,
  (state: ProductState) => state.productStats
);

export const selectSearchQuery = createSelector(
  selectProductState,
  (state: ProductState) => state.searchQuery
);

export const selectSortBy = createSelector(
  selectProductState,
  (state: ProductState) => state.sortBy
);

export const selectSortOrder = createSelector(
  selectProductState,
  (state: ProductState) => state.sortOrder
);

export const selectSelectedCategory = createSelector(
  selectProductState,
  (state: ProductState) => state.selectedCategory
);

export const selectSelectedSupplier = createSelector(
  selectProductState,
  (state: ProductState) => state.selectedSupplier
);

export const selectPriceRange = createSelector(
  selectProductState,
  (state: ProductState) => state.priceRange
);

export const selectInStockOnly = createSelector(
  selectProductState,
  (state: ProductState) => state.inStockOnly
);

// Computed Selectors
export const selectHasProducts = createSelector(
  selectProducts,
  (products) => products.length > 0
);

export const selectIsFirstPage = createSelector(
  selectCurrentPage,
  (page) => page === 1
);

export const selectIsLastPage = createSelector(
  selectCurrentPage,
  selectTotalPages,
  (page, totalPages) => page === totalPages
);

export const selectHasNextPage = createSelector(
  selectCurrentPage,
  selectTotalPages,
  (page, totalPages) => page < totalPages
);

export const selectHasPreviousPage = createSelector(
  selectCurrentPage,
  (page) => page > 1
);

export const selectPaginationInfo = createSelector(
  selectCurrentPage,
  selectPageSize,
  selectTotalPages,
  selectTotalProducts,
  (currentPage, pageSize, totalPages, totalProducts) => ({
    currentPage,
    pageSize,
    totalPages,
    totalProducts,
    startIndex: (currentPage - 1) * pageSize + 1,
    endIndex: Math.min(currentPage * pageSize, totalProducts)
  })
);

export const selectFilteredProducts = createSelector(
  selectProducts,
  selectSelectedCategory,
  selectSelectedSupplier,
  selectPriceRange,
  selectInStockOnly,
  (products, category, supplier, priceRange, inStockOnly) => {
    let filtered = products;

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    if (supplier) {
      filtered = filtered.filter(p => p.supplier === supplier);
    }

    if (priceRange.min !== null) {
      filtered = filtered.filter(p => p.price.selling >= priceRange.min!);
    }

    if (priceRange.max !== null) {
      filtered = filtered.filter(p => p.price.selling <= priceRange.max!);
    }

    if (inStockOnly) {
      filtered = filtered.filter(p => p.inventory.quantity > 0);
    }

    return filtered;
  }
);

export const selectProductsByCategory = createSelector(
  selectProducts,
  (products) => (category: string) => products.filter(p => p.category === category)
);

export const selectProductsBySupplier = createSelector(
  selectProducts,
  (products) => (supplier: string) => products.filter(p => p.supplier === supplier)
);

export const selectProductsInPriceRange = createSelector(
  selectProducts,
  (products) => (min: number, max: number) => 
    products.filter(p => p.price.selling >= min && p.price.selling <= max)
);

export const selectLowStockCount = createSelector(
  selectLowStockProducts,
  (products) => products.length
);

export const selectOutOfStockCount = createSelector(
  selectOutOfStockProducts,
  (products) => products.length
);

export const selectActiveProducts = createSelector(
  selectProducts,
  (products) => products.filter(p => p.isActive)
);

export const selectInactiveProducts = createSelector(
  selectProducts,
  (products) => products.filter(p => !p.isActive)
);

export const selectProductsWithImages = createSelector(
  selectProducts,
  (products) => products.filter(p => p.images && p.images.length > 0)
);

export const selectProductsWithoutImages = createSelector(
  selectProducts,
  (products) => products.filter(p => !p.images || p.images.length === 0)
);

export const selectProductsByStockLevel = createSelector(
  selectProducts,
  (products) => (level: 'low' | 'out' | 'normal') => {
    switch (level) {
      case 'low':
        return products.filter(p => p.inventory.quantity <= p.inventory.minStock && p.inventory.quantity > 0);
      case 'out':
        return products.filter(p => p.inventory.quantity === 0);
      case 'normal':
        return products.filter(p => p.inventory.quantity > p.inventory.minStock);
      default:
        return products;
    }
  }
);

export const selectTopProductsByValue = createSelector(
  selectProducts,
  (products) => (limit: number = 10) => {
    return [...products]
      .sort((a, b) => (b.price.selling * b.inventory.quantity) - (a.price.selling * a.inventory.quantity))
      .slice(0, limit);
  }
);

export const selectProductsByWeight = createSelector(
  selectProducts,
  (products) => (minWeight: number, maxWeight: number) => {
    return products.filter(p => p.weight && p.weight >= minWeight && p.weight <= maxWeight);
  }
);

export const selectProductsWithVariants = createSelector(
  selectProducts,
  (products) => products.filter(p => p.variants && p.variants.length > 0)
);

export const selectProductsWithoutVariants = createSelector(
  selectProducts,
  (products) => products.filter(p => !p.variants || p.variants.length === 0)
);

export const selectProductCategories = createSelector(
  selectProducts,
  (products) => {
    const categories = new Set(products.map(p => p.category));
    return Array.from(categories).sort();
  }
);

export const selectProductSuppliers = createSelector(
  selectProducts,
  (products) => {
    const suppliers = new Set(products.map(p => p.supplier).filter(Boolean));
    return Array.from(suppliers).sort();
  }
);

export const selectProductPriceRange = createSelector(
  selectProducts,
  (products) => {
    if (products.length === 0) return { min: 0, max: 0 };
    
    const prices = products.map(p => p.price.selling);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }
);

export const selectProductInventoryValue = createSelector(
  selectProducts,
  (products) => {
    return products.reduce((total, product) => {
      return total + (product.price.selling * product.inventory.quantity);
    }, 0);
  }
);

export const selectProductCostValue = createSelector(
  selectProducts,
  (products) => {
    return products.reduce((total, product) => {
      return total + (product.price.cost * product.inventory.quantity);
    }, 0);
  }
);

export const selectProductProfitMargin = createSelector(
  selectProductInventoryValue,
  selectProductCostValue,
  (inventoryValue, costValue) => {
    if (costValue === 0) return 0;
    return ((inventoryValue - costValue) / costValue) * 100;
  }
);

// Search and Filter Selectors
export const selectSearchResults = createSelector(
  selectProducts,
  selectSearchQuery,
  (products, query) => {
    if (!query) return products;
    
    const lowerQuery = query.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.sku.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    );
  }
);

export const selectFilteredAndSortedProducts = createSelector(
  selectFilteredProducts,
  selectSortBy,
  selectSortOrder,
  (products, sortBy, sortOrder) => {
    const sorted = [...products].sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      // Handle nested properties
      if (sortBy === 'price.selling') {
        aValue = a.price.selling;
        bValue = b.price.selling;
      } else if (sortBy === 'price.cost') {
        aValue = a.price.cost;
        bValue = b.price.cost;
      } else if (sortBy === 'inventory.quantity') {
        aValue = a.inventory.quantity;
        bValue = b.inventory.quantity;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }
);

// Error and Loading Selectors
export const selectProductError = createSelector(
  selectError,
  (error) => error
);

export const selectHasProductError = createSelector(
  selectError,
  (error) => !!error
);

export const selectProductLoading = createSelector(
  selectIsLoading,
  (loading) => loading
);

export const selectProductStateStatus = createSelector(
  selectIsLoading,
  selectError,
  selectHasProducts,
  (loading, error, hasProducts) => ({
    loading,
    hasError: !!error,
    error,
    hasProducts,
    isEmpty: !hasProducts && !loading
  })
);
