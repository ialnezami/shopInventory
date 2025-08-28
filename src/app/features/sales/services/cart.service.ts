import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../pos/pos.component';
import { Product } from '@core/services/product.service';

export interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  lastUpdated: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'pos_cart';
  private cartSubject = new BehaviorSubject<CartState>(this.getInitialCartState());
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    this.loadCartFromStorage();
  }

  /**
   * Get current cart state
   */
  getCartState(): CartState {
    return this.cartSubject.value;
  }

  /**
   * Get cart items
   */
  getCartItems(): CartItem[] {
    return this.cartSubject.value.items;
  }

  /**
   * Get cart total
   */
  getCartTotal(): number {
    return this.cartSubject.value.total;
  }

  /**
   * Get cart item count
   */
  getCartItemCount(): number {
    return this.cartSubject.value.itemCount;
  }

  /**
   * Add product to cart
   */
  addToCart(product: Product, quantity: number = 1): void {
    const currentState = this.cartSubject.value;
    const existingItemIndex = currentState.items.findIndex(item => item.product._id === product._id);

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = currentState.items[existingItemIndex];
      const newQuantity = existingItem.quantity + quantity;
      
      if (newQuantity <= product.inventory.quantity) {
        currentState.items[existingItemIndex] = {
          ...existingItem,
          quantity: newQuantity,
          total: newQuantity * existingItem.price
        };
      }
    } else {
      // Add new item
      const newItem: CartItem = {
        product,
        quantity,
        price: product.price.selling,
        total: product.price.selling * quantity
      };
      currentState.items.push(newItem);
    }

    this.updateCart(currentState);
  }

  /**
   * Remove product from cart
   */
  removeFromCart(productId: string): void {
    const currentState = this.cartSubject.value;
    currentState.items = currentState.items.filter(item => item.product._id !== productId);
    this.updateCart(currentState);
  }

  /**
   * Update product quantity in cart
   */
  updateQuantity(productId: string, quantity: number): void {
    const currentState = this.cartSubject.value;
    const itemIndex = currentState.items.findIndex(item => item.product._id === productId);

    if (itemIndex >= 0) {
      const item = currentState.items[itemIndex];
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        currentState.items.splice(itemIndex, 1);
      } else if (quantity <= item.product.inventory.quantity) {
        // Update quantity
        currentState.items[itemIndex] = {
          ...item,
          quantity,
          total: quantity * item.price
        };
      }
    }

    this.updateCart(currentState);
  }

  /**
   * Clear entire cart
   */
  clearCart(): void {
    const emptyState: CartState = {
      items: [],
      total: 0,
      itemCount: 0,
      lastUpdated: new Date()
    };
    this.updateCart(emptyState);
  }

  /**
   * Update cart with new items
   */
  updateCart(items: CartItem[]): void {
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    const newState: CartState = {
      items,
      total,
      itemCount,
      lastUpdated: new Date()
    };

    this.cartSubject.next(newState);
    this.saveCartToStorage(newState);
  }

  /**
   * Check if product is in cart
   */
  isProductInCart(productId: string): boolean {
    return this.cartSubject.value.items.some(item => item.product._id === productId);
  }

  /**
   * Get product quantity in cart
   */
  getProductQuantity(productId: string): number {
    const item = this.cartSubject.value.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Check if cart is empty
   */
  isCartEmpty(): boolean {
    return this.cartSubject.value.items.length === 0;
  }

  /**
   * Get cart summary
   */
  getCartSummary(): {
    itemCount: number;
    total: number;
    tax: number;
    grandTotal: number;
    items: CartItem[];
  } {
    const state = this.cartSubject.value;
    const tax = state.total * 0.085; // 8.5% tax rate
    const grandTotal = state.total + tax;

    return {
      itemCount: state.itemCount,
      total: state.total,
      tax,
      grandTotal,
      items: state.items
    };
  }

  /**
   * Apply discount to cart
   */
  applyDiscount(discountPercentage: number): void {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Discount percentage must be between 0 and 100');
    }

    const currentState = this.cartSubject.value;
    const discountMultiplier = (100 - discountPercentage) / 100;

    const updatedItems = currentState.items.map(item => ({
      ...item,
      price: item.price * discountMultiplier,
      total: item.total * discountMultiplier
    }));

    this.updateCart(updatedItems);
  }

  /**
   * Remove discount from cart
   */
  removeDiscount(): void {
    const currentState = this.cartSubject.value;
    
    const updatedItems = currentState.items.map(item => ({
      ...item,
      price: item.product.price.selling,
      total: item.product.price.selling * item.quantity
    }));

    this.updateCart(updatedItems);
  }

  /**
   * Split cart into multiple transactions
   */
  splitCart(transactionCount: number): CartItem[][] {
    const items = this.cartSubject.value.items;
    const itemsPerTransaction = Math.ceil(items.length / transactionCount);
    const transactions: CartItem[][] = [];

    for (let i = 0; i < transactionCount; i++) {
      const startIndex = i * itemsPerTransaction;
      const endIndex = Math.min(startIndex + itemsPerTransaction, items.length);
      transactions.push(items.slice(startIndex, endIndex));
    }

    return transactions;
  }

  /**
   * Hold cart for later
   */
  holdCart(holdId: string): void {
    const currentState = this.cartSubject.value;
    const heldCart = {
      ...currentState,
      holdId,
      heldAt: new Date()
    };

    // Save to localStorage with hold ID
    localStorage.setItem(`${this.CART_STORAGE_KEY}_hold_${holdId}`, JSON.stringify(heldCart));
    
    // Clear current cart
    this.clearCart();
  }

  /**
   * Retrieve held cart
   */
  retrieveHeldCart(holdId: string): boolean {
    const heldCartData = localStorage.getItem(`${this.CART_STORAGE_KEY}_hold_${holdId}`);
    
    if (heldCartData) {
      try {
        const heldCart = JSON.parse(heldCartData);
        this.updateCart(heldCart.items);
        
        // Remove held cart from storage
        localStorage.removeItem(`${this.CART_STORAGE_KEY}_hold_${holdId}`);
        
        return true;
      } catch (error) {
        console.error('Error retrieving held cart:', error);
        return false;
      }
    }
    
    return false;
  }

  /**
   * Get all held carts
   */
  getHeldCarts(): Array<{ holdId: string; heldAt: Date; itemCount: number; total: number }> {
    const heldCarts: Array<{ holdId: string; heldAt: Date; itemCount: number; total: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${this.CART_STORAGE_KEY}_hold_`)) {
        try {
          const heldCartData = localStorage.getItem(key);
          if (heldCartData) {
            const heldCart = JSON.parse(heldCartData);
            heldCarts.push({
              holdId: heldCart.holdId,
              heldAt: new Date(heldCart.heldAt),
              itemCount: heldCart.itemCount,
              total: heldCart.total
            });
          }
        } catch (error) {
          console.error('Error parsing held cart:', error);
        }
      }
    }
    
    return heldCarts.sort((a, b) => b.heldAt.getTime() - a.heldAt.getTime());
  }

  /**
   * Clear expired held carts (older than 24 hours)
   */
  clearExpiredHeldCarts(): void {
    const heldCarts = this.getHeldCarts();
    const now = new Date();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    heldCarts.forEach(heldCart => {
      if (now.getTime() - heldCart.heldAt.getTime() > twentyFourHours) {
        localStorage.removeItem(`${this.CART_STORAGE_KEY}_hold_${heldCart.holdId}`);
      }
    });
  }

  /**
   * Export cart to CSV
   */
  exportCartToCSV(): string {
    const items = this.cartSubject.value.items;
    const headers = ['Product Name', 'SKU', 'Category', 'Quantity', 'Unit Price', 'Total Price'];
    
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        `"${item.product.name}"`,
        item.product.sku,
        item.product.category,
        item.quantity,
        item.price.toFixed(2),
        item.total.toFixed(2)
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }

  /**
   * Get cart statistics
   */
  getCartStatistics(): {
    totalItems: number;
    uniqueProducts: number;
    averagePrice: number;
    highestPrice: number;
    lowestPrice: number;
    categories: { [key: string]: number };
  } {
    const items = this.cartSubject.value.items;
    
    if (items.length === 0) {
      return {
        totalItems: 0,
        uniqueProducts: 0,
        averagePrice: 0,
        highestPrice: 0,
        lowestPrice: 0,
        categories: {}
      };
    }

    const prices = items.map(item => item.price);
    const categories: { [key: string]: number } = {};
    
    items.forEach(item => {
      const category = item.product.category;
      categories[category] = (categories[category] || 0) + item.quantity;
    });

    return {
      totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueProducts: items.length,
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      highestPrice: Math.max(...prices),
      lowestPrice: Math.min(...prices),
      categories
    };
  }

  /**
   * Validate cart items
   */
  validateCart(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const items = this.cartSubject.value.items;
    const errors: string[] = [];
    const warnings: string[] = [];

    if (items.length === 0) {
      errors.push('Cart is empty');
      return { isValid: false, errors, warnings };
    }

    items.forEach((item, index) => {
      // Check if product still exists and has sufficient stock
      if (item.quantity > item.product.inventory.quantity) {
        errors.push(`${item.product.name}: Insufficient stock (${item.product.inventory.quantity} available, ${item.quantity} requested)`);
      }

      // Check if product is still active
      if (!item.product.isActive) {
        errors.push(`${item.product.name}: Product is no longer active`);
      }

      // Check for low stock warning
      if (item.product.inventory.quantity <= item.product.inventory.minStock) {
        warnings.push(`${item.product.name}: Low stock (${item.product.inventory.quantity} remaining)`);
      }

      // Check for price changes
      if (item.price !== item.product.price.selling) {
        warnings.push(`${item.product.name}: Price has changed from ${item.price.toFixed(2)} to ${item.product.price.selling.toFixed(2)}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get initial cart state
   */
  private getInitialCartState(): CartState {
    return {
      items: [],
      total: 0,
      itemCount: 0,
      lastUpdated: new Date()
    };
  }

  /**
   * Load cart from localStorage
   */
  private loadCartFromStorage(): void {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartData) {
        const savedCart = JSON.parse(cartData);
        
        // Validate saved cart data
        if (this.isValidCartData(savedCart)) {
          this.cartSubject.next(savedCart);
        } else {
          // Clear invalid cart data
          localStorage.removeItem(this.CART_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      localStorage.removeItem(this.CART_STORAGE_KEY);
    }
  }

  /**
   * Save cart to localStorage
   */
  private saveCartToStorage(cartState: CartState): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartState));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  /**
   * Validate cart data structure
   */
  private isValidCartData(data: any): data is CartState {
    return (
      data &&
      Array.isArray(data.items) &&
      typeof data.total === 'number' &&
      typeof data.itemCount === 'number' &&
      data.lastUpdated
    );
  }

  /**
   * Clean up on service destroy
   */
  ngOnDestroy(): void {
    this.clearExpiredHeldCarts();
  }
}
