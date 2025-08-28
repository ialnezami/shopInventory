import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Product } from '@core/services/product.service';
import { CartService } from '../../services/cart.service';
import { PosService } from '../../services/pos.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';
import { CustomValidators } from '@core/validators/custom-validators';

export interface CartItem {
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

@Component({
  selector: 'app-pos',
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss']
})
export class PosComponent implements OnInit, OnDestroy {
  // Search and Products
  searchForm: FormGroup;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;

  // Cart
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  cartItemCount: number = 0;

  // Payment
  paymentMethods: PaymentMethod[] = [
    { id: 'cash', name: 'Cash', icon: '💰', enabled: true },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳', enabled: true },
    { id: 'mobile', name: 'Mobile Payment', icon: '📱', enabled: true },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', enabled: true }
  ];
  selectedPaymentMethod: PaymentMethod | null = null;
  paymentForm: FormGroup;

  // UI State
  isSearching = false;
  showPaymentModal = false;
  showReceiptModal = false;
  currentReceipt: any = null;

  // Search
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private posService: PosService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {
    this.initForms();
    this.setupSearch();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForms(): void {
    this.searchForm = this.fb.group({
      searchQuery: ['', [Validators.required, CustomValidators.minLength(2)]]
    });

    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, CustomValidators.currency]],
      change: ['', [CustomValidators.currency]],
      reference: ['', [CustomValidators.alphanumericWithSpaces, CustomValidators.maxLength(50)]],
      notes: ['', [CustomValidators.textWithPunctuation, CustomValidators.maxLength(200)]]
    });
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  private loadProducts(): void {
    this.loadingService.setLoading('products', true, { message: 'Loading products...' });
    
    this.posService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.loadingService.setLoading('products', false);
      },
      error: (error) => {
        this.loadingService.setLoading('products', false);
        this.toastService.error('Failed to load products');
        console.error('Error loading products:', error);
      }
    });
  }

  private loadCart(): void {
    this.cartItems = this.cartService.getCartItems();
    this.updateCartTotals();
  }

  private performSearch(query: string): void {
    if (!query.trim()) {
      this.filteredProducts = this.products;
      return;
    }

    this.isSearching = true;
    const lowerQuery = query.toLowerCase();

    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.sku.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery) ||
      product.description?.toLowerCase().includes(lowerQuery)
    );

    this.isSearching = false;
  }

  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchSubject.next(query);
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.addToCart(product);
  }

  addToCart(product: Product): void {
    const existingItem = this.cartItems.find(item => item.product._id === product._id);

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.total = existingItem.quantity * existingItem.price;
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        price: product.price.selling,
        total: product.price.selling
      };
      this.cartItems.push(newItem);
    }

    this.updateCartTotals();
    this.cartService.updateCart(this.cartItems);
    this.toastService.success(`${product.name} added to cart`);
  }

  removeFromCart(index: number): void {
    const item = this.cartItems[index];
    this.cartItems.splice(index, 1);
    this.updateCartTotals();
    this.cartService.updateCart(this.cartItems);
    this.toastService.info(`${item.product.name} removed from cart`);
  }

  updateQuantity(index: number, change: number): void {
    const item = this.cartItems[index];
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeFromCart(index);
      return;
    }

    if (newQuantity > item.product.inventory.quantity) {
      this.toastService.warning(`Only ${item.product.inventory.quantity} available in stock`);
      return;
    }

    item.quantity = newQuantity;
    item.total = item.quantity * item.price;
    this.updateCartTotals();
    this.cartService.updateCart(this.cartItems);
  }

  private updateCartTotals(): void {
    this.cartTotal = this.cartItems.reduce((total, item) => total + item.total, 0);
    this.cartItemCount = this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCartTotals();
    this.cartService.updateCart(this.cartItems);
    this.toastService.info('Cart cleared');
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    this.showPaymentModal = true;
    
    // Pre-fill amount for cash payments
    if (method.id === 'cash') {
      this.paymentForm.patchValue({ amount: this.cartTotal });
    }
  }

  calculateChange(amount: number): number {
    return Math.max(0, amount - this.cartTotal);
  }

  onAmountChange(event: any): void {
    const amount = parseFloat(event.target.value) || 0;
    const change = this.calculateChange(amount);
    this.paymentForm.patchValue({ change: change.toFixed(2) });
  }

  processPayment(): void {
    if (this.paymentForm.invalid || !this.selectedPaymentMethod) {
      this.toastService.error('Please fill in all required fields');
      return;
    }

    const paymentData = {
      ...this.paymentForm.value,
      method: this.selectedPaymentMethod.id,
      items: this.cartItems,
      total: this.cartTotal,
      timestamp: new Date()
    };

    this.loadingService.setLoading('payment', true, { message: 'Processing payment...' });

    this.posService.processSale(paymentData).subscribe({
      next: (result) => {
        this.loadingService.setLoading('payment', false);
        this.currentReceipt = result;
        this.showPaymentModal = false;
        this.showReceiptModal = true;
        
        // Clear cart after successful sale
        this.clearCart();
        
        this.toastService.success('Sale completed successfully!');
      },
      error: (error) => {
        this.loadingService.setLoading('payment', false);
        this.toastService.error('Payment failed. Please try again.');
        console.error('Payment error:', error);
      }
    });
  }

  printReceipt(): void {
    if (this.currentReceipt) {
      this.posService.printReceipt(this.currentReceipt);
      this.toastService.info('Receipt sent to printer');
    }
  }

  closeReceipt(): void {
    this.showReceiptModal = false;
    this.currentReceipt = null;
    this.paymentForm.reset();
  }

  getProductStockStatus(product: Product): string {
    if (product.inventory.quantity === 0) return 'out-of-stock';
    if (product.inventory.quantity <= product.inventory.minStock) return 'low-stock';
    return 'in-stock';
  }

  getStockStatusClass(product: Product): string {
    const status = this.getProductStockStatus(product);
    switch (status) {
      case 'out-of-stock': return 'text-danger';
      case 'low-stock': return 'text-warning';
      default: return 'text-success';
    }
  }

  getStockStatusText(product: Product): string {
    const status = this.getProductStockStatus(product);
    switch (status) {
      case 'out-of-stock': return 'Out of Stock';
      case 'low-stock': return 'Low Stock';
      default: return 'In Stock';
    }
  }

  canAddToCart(product: Product): boolean {
    return product.inventory.quantity > 0;
  }

  getProductImage(product: Product): string {
    return product.images && product.images.length > 0 
      ? product.images[0] 
      : 'assets/images/product-placeholder.png';
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
}
