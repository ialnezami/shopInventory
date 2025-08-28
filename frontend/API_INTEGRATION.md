# API Integration Documentation

This document describes the API integration services implemented for the Shop Inventory Management System frontend.

## Overview

The API integration layer provides a clean, type-safe interface for communicating with the backend API. It includes:

- **Base API Service**: Common HTTP functionality and error handling
- **Feature Services**: Domain-specific services for products, customers, sales, and authentication
- **Interceptors**: Automatic token management and error handling
- **Guards**: Route protection and role-based access control

## Architecture

```
src/app/core/
├── services/           # API services
│   ├── api.service.ts      # Base HTTP service
│   ├── auth.service.ts     # Authentication service
│   ├── product.service.ts  # Product management
│   ├── customer.service.ts # Customer management
│   ├── sales.service.ts    # Sales management
│   └── index.ts            # Service exports
├── interceptors/       # HTTP interceptors
│   ├── auth.interceptor.ts # Token management
│   └── error.interceptor.ts # Error handling
├── guards/             # Route guards
│   ├── auth.guard.ts       # Authentication guard
│   ├── role.guard.ts       # Role-based access
│   └── permission.guard.ts # Permission-based access
└── core.module.ts      # Core module configuration
```

## Services

### Base API Service (`ApiService`)

The foundation service that provides common HTTP functionality:

```typescript
import { ApiService } from '@app/core/services';

export class MyComponent {
  constructor(private apiService: ApiService) {}

  getData() {
    return this.apiService.get<MyData>('/endpoint');
  }

  createData(data: CreateDto) {
    return this.apiService.post<MyData>('/endpoint', data);
  }
}
```

**Features:**
- Automatic authentication headers
- Error handling and retry logic
- File upload/download support
- Token expiration checking
- Automatic logout on authentication failure

### Authentication Service (`AuthService`)

Manages user authentication and session state:

```typescript
import { AuthService, LoginCredentials } from '@app/core/services';

export class LoginComponent {
  constructor(private authService: AuthService) {}

  login(credentials: LoginCredentials) {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        // User is now logged in
        console.log('Welcome,', this.authService.getUserFullName());
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }

  logout() {
    this.authService.logout().subscribe(() => {
      // User is now logged out
    });
  }
}
```

**Features:**
- JWT token management
- Automatic token refresh
- Role-based permissions
- User profile management
- Password reset functionality

### Product Service (`ProductService`)

Handles all product-related operations:

```typescript
import { ProductService, Product, CreateProductDto } from '@app/core/services';

export class ProductComponent {
  constructor(private productService: ProductService) {}

  getProducts() {
    return this.productService.getProducts({
      page: 1,
      limit: 20,
      category: 'Electronics'
    });
  }

  createProduct(product: CreateProductDto) {
    return this.productService.createProduct(product);
  }

  updateStock(productId: string, quantity: number) {
    return this.productService.updateStock(productId, { quantity });
  }
}
```

**Features:**
- CRUD operations
- Search and filtering
- Inventory management
- Image upload
- Bulk operations
- Export/import functionality

### Customer Service (`CustomerService`)

Manages customer data and relationships:

```typescript
import { CustomerService, Customer, CreateCustomerDto } from '@app/core/services';

export class CustomerComponent {
  constructor(private customerService: CustomerService) {}

  getCustomers() {
    return this.customerService.getCustomers({
      isActive: true,
      page: 1,
      limit: 20
    });
  }

  createCustomer(customer: CreateCustomerDto) {
    return this.customerService.createCustomer(customer);
  }

  searchCustomers(query: string) {
    return this.customerService.searchCustomers(query);
  }
}
```

**Features:**
- Customer CRUD operations
- Search and filtering
- Company grouping
- Purchase history
- Notes and tags
- Export functionality

### Sales Service (`SalesService`)

Handles sales transactions and reporting:

```typescript
import { SalesService, CreateSaleDto, SalesStats } from '@app/core/services';

export class SalesComponent {
  constructor(private salesService: SalesService) {}

  createSale(sale: CreateSaleDto, staffId: string) {
    return this.salesService.createSale(sale, staffId);
  }

  getSalesStats() {
    return this.salesService.getSalesStats();
  }

  getDailyReport(date: Date) {
    return this.salesService.getDailySalesReport(date);
  }
}
```

**Features:**
- Sales creation and management
- Payment processing
- Sales reporting (daily, weekly, monthly, yearly)
- Top products and customers
- Sales forecasting
- Receipt and invoice generation

## Interceptors

### Authentication Interceptor

Automatically adds JWT tokens to requests and handles token refresh:

```typescript
// Automatically adds Authorization header to all requests
// Handles 401 responses by refreshing tokens
// Retries failed requests with new tokens
```

### Error Interceptor

Provides global error handling and user-friendly error messages:

```typescript
// Converts HTTP errors to user-friendly messages
// Handles authentication failures
// Logs errors for debugging
// Redirects on unauthorized access
```

## Guards

### Authentication Guard

Protects routes that require authentication:

```typescript
// In routing configuration
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}
```

### Role Guard

Protects routes based on user roles:

```typescript
// In routing configuration
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [RoleGuard],
  data: { roles: ['admin'] }
}
```

### Permission Guard

Protects routes based on specific permissions:

```typescript
// In routing configuration
{
  path: 'products/create',
  component: CreateProductComponent,
  canActivate: [PermissionGuard],
  data: { permissions: ['products:write'] }
}
```

## Usage Examples

### Component Integration

```typescript
import { Component, OnInit } from '@angular/core';
import { ProductService, Product } from '@app/core/services';

@Component({
  selector: 'app-product-list',
  template: `
    <div *ngFor="let product of products">
      {{ product.name }} - {{ product.price.selling | currency }}
    </div>
  `
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getProducts({
      page: 1,
      limit: 20,
      sortBy: 'name',
      sortOrder: 'asc'
    }).subscribe({
      next: (response) => {
        this.products = response.data;
      },
      error: (error) => {
        console.error('Failed to load products:', error);
      }
    });
  }
}
```

### Error Handling

```typescript
import { Component } from '@angular/core';
import { ProductService } from '@app/core/services';

@Component({
  selector: 'app-create-product',
  template: `...`
})
export class CreateProductComponent {
  constructor(private productService: ProductService) {}

  createProduct(productData: CreateProductDto) {
    this.productService.createProduct(productData).subscribe({
      next: (product) => {
        console.log('Product created:', product);
        // Show success message
      },
      error: (error) => {
        if (error.status === 409) {
          // Handle conflict (e.g., SKU already exists)
          console.error('SKU already exists');
        } else if (error.status === 422) {
          // Handle validation errors
          console.error('Validation failed:', error.message);
        } else {
          // Handle other errors
          console.error('Creation failed:', error.message);
        }
      }
    });
  }
}
```

### Reactive Forms Integration

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService, CreateProductDto } from '@app/core/services';

@Component({
  selector: 'app-product-form',
  template: `...`
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      sku: ['', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
      description: [''],
      category: ['', Validators.required],
      price: this.fb.group({
        cost: [0, [Validators.required, Validators.min(0)]],
        selling: [0, [Validators.required, Validators.min(0)]],
        currency: ['USD']
      }),
      inventory: this.fb.group({
        quantity: [0, [Validators.required, Validators.min(0)]],
        minStock: [10, [Validators.required, Validators.min(0)]],
        location: ['Main Store']
      })
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const productData: CreateProductDto = this.productForm.value;
      
      this.productService.createProduct(productData).subscribe({
        next: (product) => {
          console.log('Product created successfully:', product);
          this.productForm.reset();
        },
        error: (error) => {
          console.error('Failed to create product:', error);
        }
      });
    }
  }
}
```

## Configuration

### Environment Setup

Ensure your environment files are configured with the correct API URL:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  appName: 'Shop Inventory Management System'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api/v1',
  appName: 'Shop Inventory Management System'
};
```

### Module Import

Import the CoreModule in your AppModule:

```typescript
import { NgModule } from '@angular/core';
import { CoreModule } from './core/core.module';

@NgModule({
  imports: [
    CoreModule,
    // ... other modules
  ],
  // ... rest of module configuration
})
export class AppModule { }
```

## Best Practices

1. **Error Handling**: Always handle errors in your subscriptions
2. **Loading States**: Use loading indicators during API calls
3. **Type Safety**: Use the provided interfaces for type safety
4. **Unsubscribe**: Unsubscribe from observables to prevent memory leaks
5. **Error Boundaries**: Implement error boundaries for better UX
6. **Retry Logic**: Use the built-in retry functionality for failed requests

## Testing

The services are designed to be easily testable:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **Authentication Failures**: Check token expiration and refresh logic
3. **Type Errors**: Ensure you're using the correct interfaces
4. **Network Errors**: Check API URL configuration and network connectivity

### Debug Mode

Enable debug logging by setting the log level in your environment:

```typescript
export const environment = {
  // ... other config
  debug: true,
  logLevel: 'debug'
};
```

## Support

For issues or questions about the API integration:

1. Check the console for error messages
2. Verify your API endpoints are working
3. Check network tab for failed requests
4. Review the backend API documentation
5. Check authentication token validity

---

This API integration layer provides a robust, scalable foundation for your Shop Inventory Management System frontend.
