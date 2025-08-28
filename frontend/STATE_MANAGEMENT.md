# State Management with NgRx

This document provides a comprehensive guide to the state management architecture implemented in the Shop Inventory Management System using NgRx.

## Overview

The application uses NgRx for state management, providing a predictable state container with actions, reducers, effects, and selectors. This architecture ensures:

- **Predictable State Updates**: All state changes go through actions and reducers
- **Side Effect Management**: Effects handle async operations and external API calls
- **Performance Optimization**: Selectors with memoization prevent unnecessary re-renders
- **Developer Experience**: Redux DevTools integration for debugging
- **Type Safety**: Full TypeScript support with strict typing

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components   │───▶│   Actions       │───▶│   Reducers      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   Effects       │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       │                       ▼
┌─────────────────┐              │              ┌─────────────────┐
│   Selectors     │◀─────────────┘              │   State         │
└─────────────────┘                             └─────────────────┘
```

## Store Structure

The application state is organized into feature slices:

```typescript
export interface AppState {
  auth: AuthState;        // Authentication and user management
  products: ProductState;  // Product catalog and inventory
  customers: CustomerState; // Customer management
  sales: SalesState;      // Sales transactions and reporting
  ui: UIState;            // Application-wide UI state
}
```

## Core Concepts

### 1. Actions

Actions are plain objects that describe what happened in the application. They are the only way to send data to the store.

**Example:**
```typescript
// Action definition
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginCredentials }>()
);

// Action usage
this.store.dispatch(AuthActions.login({ credentials }));
```

### 2. Reducers

Reducers are pure functions that take the current state and an action, then return a new state.

**Example:**
```typescript
export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    user: response.user,
    isAuthenticated: true,
    isLoading: false
  }))
);
```

### 3. Effects

Effects handle side effects like API calls, timers, and other async operations.

**Example:**
```typescript
@Injectable()
export class AuthEffects {
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map(response => AuthActions.loginSuccess({ response })),
          catchError(error => of(AuthActions.loginFailure({ error: error.message })))
        )
      )
    )
  );
}
```

### 4. Selectors

Selectors are pure functions that extract specific pieces of state from the store.

**Example:**
```typescript
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectUserFullName = createSelector(
  selectUser,
  (user) => user ? `${user.firstName} ${user.lastName}` : ''
);
```

## Feature Modules

### Authentication (Auth)

**State Interface:**
```typescript
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  permissions: string[];
  roles: string[];
}
```

**Key Actions:**
- `login` / `loginSuccess` / `loginFailure`
- `logout` / `logoutSuccess` / `logoutFailure`
- `refreshToken` / `refreshTokenSuccess` / `refreshTokenFailure`
- `loadUserProfile` / `loadUserProfileSuccess` / `loadUserProfileFailure`

**Key Selectors:**
- `selectIsAuthenticated` - Check if user is logged in
- `selectUser` - Get current user object
- `selectUserRole` - Get user's role
- `selectIsAdmin` - Check if user is admin
- `selectHasPermission` - Check if user has specific permission

**Usage Example:**
```typescript
@Component({
  selector: 'app-header',
  template: `
    <div *ngIf="isAuthenticated$ | async">
      Welcome, {{ userFullName$ | async }}!
      <button (click)="logout()">Logout</button>
    </div>
  `
})
export class HeaderComponent {
  isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
  userFullName$ = this.store.select(AuthSelectors.selectUserFullName);

  constructor(private store: Store<AppState>) {}

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
```

### Products

**State Interface:**
```typescript
export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  filters: ProductQueryParams;
  categories: string[];
  searchQuery: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
```

**Key Actions:**
- `loadProducts` / `loadProductsSuccess` / `loadProductsFailure`
- `createProduct` / `createProductSuccess` / `createProductFailure`
- `updateProduct` / `updateProductSuccess` / `updateProductFailure`
- `deleteProduct` / `deleteProductSuccess` / `deleteProductFailure`
- `searchProducts` / `searchProductsSuccess` / `searchProductsFailure`
- `setProductFilters` / `clearProductFilters`

**Key Selectors:**
- `selectProducts` - Get all products
- `selectSelectedProduct` - Get currently selected product
- `selectFilteredProducts` - Get products with applied filters
- `selectProductStats` - Get product statistics
- `selectLowStockProducts` - Get products with low stock

**Usage Example:**
```typescript
@Component({
  selector: 'app-product-list',
  template: `
    <div *ngIf="products$ | async as products">
      <div *ngFor="let product of products">
        {{ product.name }} - {{ product.price.selling | currency }}
      </div>
    </div>
    <div *ngIf="loading$ | async">Loading...</div>
  `
})
export class ProductListComponent implements OnInit {
  products$ = this.store.select(ProductSelectors.selectProducts);
  loading$ = this.store.select(ProductSelectors.selectIsLoading);

  constructor(private store: Store<AppState>) {}

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());
  }

  search(query: string) {
    this.store.dispatch(ProductActions.searchProducts({ query }));
  }
}
```

### UI State

**State Interface:**
```typescript
export interface UIState {
  loading: LoadingState;
  globalLoading: boolean;
  notifications: Notification[];
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'auto';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange';
  activeModals: string[];
  toasts: Toast[];
  globalSearchQuery: string;
  breadcrumbs: Breadcrumb[];
  pageTitle: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
```

**Key Actions:**
- `setLoading` / `clearLoading` / `setGlobalLoading`
- `addNotification` / `removeNotification` / `markNotificationAsRead`
- `toggleSidebar` / `collapseSidebar` / `expandSidebar`
- `setTheme` / `toggleTheme` / `setColorScheme`
- `showToast` / `hideToast` / `clearToasts`
- `setGlobalSearchQuery` / `toggleGlobalSearch`

**Key Selectors:**
- `selectGlobalLoading` - Check if app is globally loading
- `selectNotifications` - Get all notifications
- `selectUnreadNotifications` - Get unread notification count
- `selectTheme` - Get current theme
- `selectIsMobile` / `selectIsTablet` / `selectIsDesktop`

**Usage Example:**
```typescript
@Component({
  selector: 'app-layout',
  template: `
    <div [class]="themeClass$ | async">
      <div [class.sidebar-collapsed]="sidebarCollapsed$ | async">
        <app-sidebar></app-sidebar>
      </div>
      <div class="main-content">
        <app-header></app-header>
        <router-outlet></router-outlet>
      </div>
    </div>
    <app-toast-container [toasts]="toasts$ | async"></app-toast-container>
  `
})
export class LayoutComponent {
  themeClass$ = this.store.select(UISelectors.selectThemeClass);
  sidebarCollapsed$ = this.store.select(UISelectors.selectSidebarCollapsed);
  toasts$ = this.store.select(UISelectors.selectToasts);

  constructor(private store: Store<AppState>) {}

  toggleSidebar() {
    this.store.dispatch(UIActions.toggleSidebar());
  }

  setTheme(theme: 'light' | 'dark') {
    this.store.dispatch(UIActions.setTheme({ theme }));
  }
}
```

## State Service

The `StateService` provides a convenient wrapper around the store, offering:

- **Simplified Access**: Easy-to-use methods for common operations
- **Type Safety**: Full TypeScript support
- **Consistent API**: Unified interface for all state operations

**Usage Example:**
```typescript
@Component({
  selector: 'app-login',
  template: `...`
})
export class LoginComponent {
  constructor(private stateService: StateService) {}

  login(credentials: LoginCredentials) {
    this.stateService.login(credentials);
  }

  showSuccessMessage(message: string) {
    this.stateService.showSuccessToast(message);
  }

  setPageLoading(loading: boolean) {
    this.stateService.setLoading('login', loading);
  }
}
```

## Best Practices

### 1. Action Naming Convention

Use the format `[Feature] Action` for action types:
```typescript
export const loadProducts = createAction('[Product] Load Products');
export const loadProductsSuccess = createAction('[Product] Load Products Success');
export const loadProductsFailure = createAction('[Product] Load Products Failure');
```

### 2. State Immutability

Always create new state objects, never mutate existing ones:
```typescript
// ✅ Correct - Create new state
on(AuthActions.loginSuccess, (state, { response }) => ({
  ...state,
  user: response.user,
  isAuthenticated: true
}))

// ❌ Wrong - Mutate existing state
on(AuthActions.loginSuccess, (state, { response }) => {
  state.user = response.user; // Don't do this!
  return state;
})
```

### 3. Selector Composition

Compose selectors to build complex queries:
```typescript
export const selectActiveProducts = createSelector(
  selectProducts,
  (products) => products.filter(p => p.isActive)
);

export const selectActiveProductCount = createSelector(
  selectActiveProducts,
  (activeProducts) => activeProducts.length
);
```

### 4. Effect Error Handling

Always handle errors in effects:
```typescript
login$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.login),
    mergeMap(({ credentials }) =>
      this.authService.login(credentials).pipe(
        map(response => AuthActions.loginSuccess({ response })),
        catchError(error => of(AuthActions.loginFailure({ error: error.message })))
      )
    )
  )
);
```

### 5. Loading States

Use specific loading keys for different operations:
```typescript
// Set loading for specific operation
this.stateService.setLoading('product-creation', true);

// Clear loading when done
this.stateService.clearLoading('product-creation');

// Check loading state
this.store.select(UISelectors.selectIsLoading('product-creation'))
```

## Performance Optimization

### 1. Memoized Selectors

Selectors automatically memoize results, preventing unnecessary recalculations:
```typescript
export const selectExpensiveCalculation = createSelector(
  selectProducts,
  selectFilters,
  (products, filters) => {
    // This calculation only runs when products or filters change
    return products.filter(/* complex filtering logic */);
  }
);
```

### 2. OnPush Change Detection

Use OnPush change detection strategy with observables:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ data$ | async }}`
})
export class OptimizedComponent {
  data$ = this.store.select(SomeSelector.selectData);
}
```

### 3. Async Pipe

Use the async pipe to automatically handle subscription lifecycle:
```typescript
// ✅ Good - Async pipe handles subscription
<div *ngIf="data$ | async as data">{{ data.name }}</div>

// ❌ Avoid - Manual subscription management
ngOnInit() {
  this.subscription = this.store.select(selector).subscribe(data => {
    this.data = data;
  });
}
```

## Testing

### 1. Testing Reducers

```typescript
describe('AuthReducer', () => {
  it('should handle login', () => {
    const initialState = initialAuthState;
    const action = AuthActions.login({ credentials: mockCredentials });
    const newState = authReducer(initialState, action);

    expect(newState.isLoading).toBe(true);
    expect(newState.error).toBeNull();
  });
});
```

### 2. Testing Effects

```typescript
describe('AuthEffects', () => {
  let actions$: Actions;
  let authService: jasmine.SpyObj<AuthService>;
  let effects: AuthEffects;

  beforeEach(() => {
    actions$ = new Actions();
    authService = jasmine.createSpyObj('AuthService', ['login']);
    effects = new AuthEffects(actions$, authService, store, router);
  });

  it('should handle login success', (done) => {
    const credentials = { email: 'test@example.com', password: 'password' };
    const user = { id: '1', email: 'test@example.com' };
    const response = { user, access_token: 'token' };

    authService.login.and.returnValue(of(response));

    actions$ = of(AuthActions.login({ credentials }));

    effects.login$.subscribe(action => {
      expect(action).toEqual(AuthActions.loginSuccess({ response }));
      done();
    });
  });
});
```

### 3. Testing Selectors

```typescript
describe('AuthSelectors', () => {
  it('should select isAuthenticated', () => {
    const state = {
      auth: {
        ...initialAuthState,
        isAuthenticated: true
      }
    };

    const result = selectIsAuthenticated.projector(state.auth);
    expect(result).toBe(true);
  });
});
```

## Debugging

### 1. Redux DevTools

The application includes Redux DevTools integration for debugging:
- **Time Travel**: Navigate through state changes
- **Action Log**: View all dispatched actions
- **State Inspection**: Examine current state structure
- **Performance**: Monitor selector performance

### 2. Console Logging

Add logging to effects for debugging:
```typescript
login$ = createEffect(() =>
  this.actions$.pipe(
    ofType(AuthActions.login),
    tap(action => console.log('Login action dispatched:', action)),
    mergeMap(({ credentials }) =>
      this.authService.login(credentials).pipe(
        tap(response => console.log('Login response:', response)),
        map(response => AuthActions.loginSuccess({ response })),
        catchError(error => {
          console.error('Login error:', error);
          return of(AuthActions.loginFailure({ error: error.message }));
        })
      )
    )
  )
);
```

## Migration Guide

### From Service-Based State

If migrating from a service-based approach:

1. **Identify State**: Determine what data should be in the store
2. **Create Actions**: Define actions for all state changes
3. **Implement Reducers**: Create pure functions for state updates
4. **Add Effects**: Handle side effects and async operations
5. **Update Components**: Replace service calls with store dispatch/select
6. **Remove Services**: Clean up old state management code

### Example Migration

**Before (Service-based):**
```typescript
export class ProductService {
  private products = new BehaviorSubject<Product[]>([]);
  products$ = this.products.asObservable();

  loadProducts() {
    this.http.get<Product[]>('/api/products').subscribe(products => {
      this.products.next(products);
    });
  }
}
```

**After (NgRx):**
```typescript
// Actions
export const loadProducts = createAction('[Product] Load Products');
export const loadProductsSuccess = createAction('[Product] Load Products Success', props<{ products: Product[] }>());

// Reducer
on(ProductActions.loadProductsSuccess, (state, { products }) => ({
  ...state,
  products,
  isLoading: false
}))

// Effect
loadProducts$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ProductActions.loadProducts),
    mergeMap(() => this.http.get<Product[]>('/api/products').pipe(
      map(products => ProductActions.loadProductsSuccess({ products }))
    ))
  )
);

// Component
ngOnInit() {
  this.store.dispatch(ProductActions.loadProducts());
  this.products$ = this.store.select(ProductSelectors.selectProducts);
}
```

## Conclusion

This NgRx implementation provides a robust, scalable, and maintainable state management solution for the Shop Inventory Management System. The architecture ensures predictable state updates, efficient rendering, and excellent developer experience.

For more information, refer to:
- [NgRx Documentation](https://ngrx.io/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Angular Best Practices](https://angular.io/guide/styleguide)
