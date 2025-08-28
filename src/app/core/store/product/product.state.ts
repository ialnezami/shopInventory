import { Product, ProductQueryParams } from '../../services/product.service';

export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  filters: ProductQueryParams;
  categories: string[];
  subcategories: string[];
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
  productStats: {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalValue: number;
    categories: { name: string; count: number }[];
  } | null;
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  selectedCategory: string | null;
  selectedSupplier: string | null;
  priceRange: {
    min: number | null;
    max: number | null;
  };
  inStockOnly: boolean;
}

export const initialProductState: ProductState = {
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,
  totalProducts: 0,
  currentPage: 1,
  pageSize: 20,
  totalPages: 0,
  filters: {},
  categories: [],
  subcategories: [],
  lowStockProducts: [],
  outOfStockProducts: [],
  productStats: null,
  searchQuery: '',
  sortBy: 'name',
  sortOrder: 'asc',
  selectedCategory: null,
  selectedSupplier: null,
  priceRange: {
    min: null,
    max: null
  },
  inStockOnly: false
};
