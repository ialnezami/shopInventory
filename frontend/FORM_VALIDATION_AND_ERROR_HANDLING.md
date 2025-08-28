# Form Validation and Error Handling

This document provides a comprehensive guide to the form validation and error handling architecture implemented in the Shop Inventory Management System.

## Overview

The application implements a robust form validation and error handling system that provides:

- **Custom Validators**: Comprehensive validation rules for different field types
- **Form Validation Service**: Centralized validation logic and error message management
- **Form Submission Service**: Advanced form submission with validation, retry, and progress tracking
- **Toast Notifications**: User-friendly notification system for success, error, warning, and info messages
- **Loading States**: Comprehensive loading state management throughout the application
- **Error Boundary**: Global error handling with automatic recovery mechanisms

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Components   │───▶│   Form Group    │───▶│   Validators    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │ Validation      │              │
         │              │ Service         │              │
         │              └─────────────────┘              │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Submission    │    │   Error         │    │   Toast         │
│   Service       │    │   Boundary      │    │   Service       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Loading       │    │   Recovery      │    │   User          │
│   Service       │    │   Mechanisms    │    │   Feedback     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Components

### 1. Custom Validators

Located in `src/app/core/validators/custom-validators.ts`, this class provides comprehensive validation rules:

#### Basic Validators
- `notEmpty()` - Ensures field is not empty or whitespace-only
- `alphanumericWithSpaces()` - Allows letters, numbers, and spaces
- `lettersWithSpaces()` - Allows only letters and spaces
- `textWithPunctuation()` - Allows text with common punctuation

#### Format Validators
- `email()` - Validates email address format
- `phoneNumber()` - Validates phone number format
- `postalCode()` - Validates postal code format
- `url()` - Validates URL format
- `sku()` - Validates SKU format (alphanumeric with hyphens)

#### Numeric Validators
- `currency()` - Validates currency amounts
- `percentage()` - Validates percentage values (0-100)
- `weight()` - Validates positive weight values
- `dimension()` - Validates positive dimension values
- `quantity()` - Validates non-negative integer quantities

#### Password Validators
- `passwordStrength()` - Ensures password meets complexity requirements
- `hasUppercase()` - Requires at least one uppercase letter
- `hasLowercase()` - Requires at least one lowercase letter
- `hasNumber()` - Requires at least one number
- `hasSpecialChar()` - Requires at least one special character

#### Date Validators
- `futureDate()` - Ensures date is not in the past
- `pastDate()` - Ensures date is not in the future
- `dateRange()` - Ensures start date is before end date

#### Conditional Validators
- `requiredIf()` - Makes field required based on condition
- `notEqual()` - Ensures field is not equal to another field
- `greaterThan()` - Ensures value is greater than another field
- `lessThan()` - Ensures value is less than another field

#### Usage Example
```typescript
import { CustomValidators } from '@core/validators/custom-validators';

const form = new FormGroup({
  name: new FormControl('', [
    Validators.required,
    CustomValidators.lettersWithSpaces,
    CustomValidators.minLength(2),
    CustomValidators.maxLength(50)
  ]),
  email: new FormControl('', [
    Validators.required,
    CustomValidators.email
  ]),
  password: new FormControl('', [
    Validators.required,
    CustomValidators.passwordStrength
  ]),
  sku: new FormControl('', [
    Validators.required,
    CustomValidators.sku
  ])
});
```

### 2. Form Validation Service

Located in `src/app/core/services/form-validation.service.ts`, this service provides:

#### Validation Patterns
Pre-configured validation patterns for common field types:
- `name` - Letters and spaces, 2-50 characters
- `email` - Email format validation
- `password` - Password strength requirements
- `phone` - Phone number format
- `address` - Text with punctuation, 5-100 characters
- `postalCode` - Postal code format
- `currency` - Currency amount validation
- `percentage` - Percentage validation (0-100)
- `sku` - SKU format validation
- `weight` - Positive weight values
- `dimension` - Positive dimension values
- `quantity` - Non-negative integers
- `url` - URL format validation
- `date` - Date validation
- `description` - Text with punctuation, max 500 characters

#### Key Methods
- `getValidationPattern(fieldType)` - Get validation pattern for field type
- `getErrorMessage(fieldType, errorKey, params)` - Get localized error message
- `hasErrors(control)` - Check if control has validation errors
- `getFirstErrorMessage(control, fieldType)` - Get first error message
- `markFormGroupTouched(formGroup)` - Mark all controls as touched
- `resetFormGroupValidation(formGroup)` - Reset validation state
- `isFormReady(formGroup)` - Check if form is ready for submission

#### Usage Example
```typescript
import { FormValidationService } from '@core/services/form-validation.service';

@Component({...})
export class ProductFormComponent {
  constructor(private validationService: FormValidationService) {}

  getFieldErrorMessage(control: AbstractControl, fieldType: string): string {
    return this.validationService.getFirstErrorMessage(control, fieldType);
  }

  hasFieldErrors(control: AbstractControl): boolean {
    return this.validationService.hasErrors(control);
  }

  onSubmit() {
    if (this.validationService.isFormReady(this.form)) {
      // Form is valid and dirty
      this.submitForm();
    } else {
      // Mark all fields as touched to show validation errors
      this.validationService.markFormGroupTouched(this.form);
    }
  }
}
```

### 3. Form Submission Service

Located in `src/app/core/services/form-submission.service.ts`, this service provides:

#### Core Submission
- `submitForm()` - Submit form with validation and error handling
- `validateForm()` - Validate form before submission
- `resetForm()` - Reset form with optional data preservation

#### Advanced Features
- `createDebouncedSubmission()` - Debounced form submission
- `createRetrySubmission()` - Submission with retry logic
- `createProgressSubmission()` - Submission with progress tracking
- `createConfirmationSubmission()` - Submission with confirmation dialog

#### Submission Options
```typescript
interface FormSubmissionOptions {
  showLoading?: boolean;           // Show loading indicator
  showSuccessMessage?: boolean;    // Show success message
  showErrorMessage?: boolean;      // Show error message
  successMessage?: string;         // Custom success message
  errorMessage?: string;           // Custom error message
  redirectUrl?: string;            // Redirect after submission
  resetForm?: boolean;             // Reset form after submission
  preserveData?: boolean;          // Preserve form data on reset
  customValidation?: Function;     // Custom validation function
  beforeSubmit?: Function;         // Pre-submission hook
  afterSubmit?: Function;          // Post-submission hook
  onError?: Function;              // Error handling hook
}
```

#### Usage Example
```typescript
import { FormSubmissionService } from '@core/services/form-submission.service';

@Component({...})
export class ProductFormComponent {
  constructor(private submissionService: FormSubmissionService) {}

  onSubmit() {
    this.submissionService.submitForm(
      this.form,
      (formData) => this.productService.createProduct(formData),
      {
        showLoading: true,
        showSuccessMessage: true,
        resetForm: true,
        successMessage: 'Product created successfully!',
        afterSubmit: (result) => {
          this.router.navigate(['/products', result._id]);
        }
      }
    ).subscribe(result => {
      if (result.success) {
        console.log('Form submitted successfully:', result.data);
      } else {
        console.error('Form submission failed:', result.error);
      }
    });
  }

  // With retry logic
  onSubmitWithRetry() {
    this.submissionService.createRetrySubmission(
      this.form,
      (formData) => this.productService.createProduct(formData),
      {
        maxRetries: 3,
        retryDelay: 1000,
        retryCondition: (error) => error.status >= 500
      }
    ).subscribe(result => {
      // Handle result
    });
  }
}
```

### 4. Toast Notification Service

Located in `src/app/core/services/toast.service.ts`, this service provides:

#### Basic Notifications
- `success(message, options)` - Success toast
- `error(message, options)` - Error toast
- `warning(message, options)` - Warning toast
- `info(message, options)` - Info toast

#### Advanced Features
- `showToastWithActions()` - Toast with action buttons
- `showConfirmation()` - Confirmation toast
- `showRetryToast()` - Toast with retry action
- `showProgressToast()` - Toast with progress indicator
- `showCountdownToast()` - Toast with countdown
- `showConditionalToast()` - Toast that auto-dismisses on condition

#### Toast Options
```typescript
interface ToastOptions {
  title?: string;           // Toast title
  duration?: number;         // Auto-dismiss duration (ms)
  persistent?: boolean;      // Don't auto-dismiss
  actions?: ToastAction[];   // Action buttons
  data?: any;               // Custom data
}

interface ToastAction {
  label: string;             // Button label
  action: () => void;        // Action function
  style?: 'primary' | 'secondary' | 'danger' | 'success';
}
```

#### Usage Example
```typescript
import { ToastService } from '@core/services/toast.service';

@Component({...})
export class ProductComponent {
  constructor(private toastService: ToastService) {}

  showSuccess() {
    this.toastService.success('Product saved successfully!', {
      title: 'Success',
      duration: 3000
    });
  }

  showConfirmation() {
    this.toastService.showConfirmation(
      'Are you sure you want to delete this product?',
      () => this.deleteProduct(),
      () => console.log('Cancelled'),
      { title: 'Confirm Deletion' }
    );
  }

  showRetry() {
    this.toastService.showRetryToast(
      'Failed to load products. Please try again.',
      () => this.loadProducts(),
      { title: 'Error' }
    );
  }
}
```

### 5. Loading Service

Located in `src/app/core/services/loading.service.ts`, this service provides:

#### Basic Loading
- `setLoading(key, loading, options)` - Set loading state for specific key
- `setGlobalLoading(loading, options)` - Set global loading state
- `isLoading(key)` - Check if specific key is loading
- `isGlobalLoading()` - Check if global loading is active

#### Advanced Features
- `setLoadingWithProgress()` - Loading with progress bar
- `setLoadingWithMessage()` - Loading with custom message
- `setLoadingWithSpinner()` - Loading with spinner
- `setLoadingWithBackdrop()` - Loading with backdrop
- `setDismissibleLoading()` - Loading that can be dismissed
- `setIndeterminateLoading()` - Loading with indeterminate progress

#### Loading Options
```typescript
interface LoadingOptions {
  message?: string;          // Loading message
  showSpinner?: boolean;     // Show spinner
  showProgress?: boolean;    // Show progress bar
  progress?: number;         // Progress percentage
  indeterminate?: boolean;   // Indeterminate progress
  backdrop?: boolean;        // Show backdrop
  dismissible?: boolean;     // Can be dismissed
}
```

#### Wrapper Methods
- `wrapWithLoading()` - Wrap promise with loading
- `wrapObservableWithLoading()` - Wrap observable with loading
- `wrapFunctionWithLoading()` - Wrap function with loading

#### Usage Example
```typescript
import { LoadingService } from '@core/services/loading.service';

@Component({...})
export class ProductComponent {
  constructor(private loadingService: LoadingService) {}

  loadProducts() {
    this.loadingService.setLoading('products', true, {
      message: 'Loading products...',
      showSpinner: true
    });

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
      complete: () => {
        this.loadingService.setLoading('products', false);
      }
    });
  }

  // With progress
  uploadFile(file: File) {
    this.loadingService.setLoadingWithProgress('upload', true, 0, {
      message: 'Uploading file...',
      showProgress: true
    });

    // Simulate upload progress
    const interval = setInterval(() => {
      const progress = Math.min(progress + 10, 100);
      this.loadingService.updateLoadingProgress('upload', progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        this.loadingService.setLoading('upload', false);
      }
    }, 100);
  }

  // Wrap with loading
  async saveProduct() {
    return this.loadingService.wrapWithLoading(
      this.productService.saveProduct(this.product),
      'save',
      { message: 'Saving product...' }
    );
  }
}
```

### 6. Error Boundary Service

Located in `src/app/core/services/error-boundary.service.ts`, this service provides:

#### Global Error Handling
- `handleError(error)` - Handle errors globally
- `handleSpecificError(error, options)` - Handle specific errors with custom recovery
- `handleNetworkError(error, retryAction)` - Handle network errors
- `handleAuthError(error)` - Handle authentication errors
- `handleValidationError(error, form)` - Handle validation errors
- `handlePermissionError(error)` - Handle permission errors
- `handleNotFoundError(error)` - Handle not found errors
- `handleServerError(error, retryAction)` - Handle server errors

#### Error Recovery Options
```typescript
interface ErrorRecoveryOptions {
  showToast?: boolean;       // Show error toast
  logToConsole?: boolean;    // Log to console
  redirectTo?: string;       // Redirect to safe page
  retryAction?: Function;    // Retry action
  fallbackAction?: Function; // Fallback action
  maxRetries?: number;       // Maximum retry attempts
  retryDelay?: number;       // Delay between retries
}
```

#### Wrapper Methods
- `createSafePromiseHandler()` - Safe promise error handling
- `createSafeObservableHandler()` - Safe observable error handling

#### Usage Example
```typescript
import { ErrorBoundaryService } from '@core/services/error-boundary.service';

@Component({...})
export class ProductComponent {
  constructor(private errorBoundary: ErrorBoundaryService) {}

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        this.errorBoundary.handleSpecificError(error, {
          showToast: true,
          retryAction: () => this.loadProducts(),
          maxRetries: 3
        });
      }
    });
  }

  // Handle specific error types
  handleNetworkError(error: any) {
    this.errorBoundary.handleNetworkError(error, () => {
      this.loadProducts();
    });
  }

  handleAuthError(error: any) {
    this.errorBoundary.handleAuthError(error);
  }

  // Safe promise handling
  async saveProduct() {
    return this.errorBoundary.createSafePromiseHandler(
      this.productService.saveProduct(this.product),
      {
        showToast: true,
        retryAction: () => this.saveProduct()
      }
    );
  }
}
```

## Integration with Components

### Form Component Example

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '@core/validators/custom-validators';
import { FormValidationService } from '@core/services/form-validation.service';
import { FormSubmissionService } from '@core/services/form-submission.service';
import { ToastService } from '@core/services/toast.service';
import { LoadingService } from '@core/services/loading.service';

@Component({
  selector: 'app-product-form',
  template: `
    <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="name">Product Name</label>
        <input 
          id="name" 
          type="text" 
          formControlName="name"
          [class.is-invalid]="hasFieldErrors(productForm.get('name'))"
          class="form-control"
        />
        <div 
          *ngIf="hasFieldErrors(productForm.get('name'))" 
          class="invalid-feedback"
        >
          {{ getFieldErrorMessage(productForm.get('name'), 'name') }}
        </div>
      </div>

      <div class="form-group">
        <label for="sku">SKU</label>
        <input 
          id="sku" 
          type="text" 
          formControlName="sku"
          [class.is-invalid]="hasFieldErrors(productForm.get('sku'))"
          class="form-control"
        />
        <div 
          *ngIf="hasFieldErrors(productForm.get('sku'))" 
          class="invalid-feedback"
        >
          {{ getFieldErrorMessage(productForm.get('sku'), 'sku') }}
        </div>
      </div>

      <div class="form-group">
        <label for="price">Price</label>
        <input 
          id="price" 
          type="number" 
          formControlName="price"
          [class.is-invalid]="hasFieldErrors(productForm.get('price'))"
          class="form-control"
        />
        <div 
          *ngIf="hasFieldErrors(productForm.get('price'))" 
          class="invalid-feedback"
        >
          {{ getFieldErrorMessage(productForm.get('price'), 'currency') }}
        </div>
      </div>

      <button 
        type="submit" 
        [disabled]="!productForm.valid || isLoading('submit')"
        class="btn btn-primary"
      >
        <span *ngIf="isLoading('submit')" class="spinner-border spinner-border-sm"></span>
        {{ isLoading('submit') ? 'Saving...' : 'Save Product' }}
      </button>
    </form>
  `
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private validationService: FormValidationService,
    private submissionService: FormSubmissionService,
    private toastService: ToastService,
    private loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.productForm = this.fb.group({
      name: ['', [
        Validators.required,
        CustomValidators.lettersWithSpaces,
        CustomValidators.minLength(2),
        CustomValidators.maxLength(50)
      ]],
      sku: ['', [
        Validators.required,
        CustomValidators.sku
      ]],
      price: ['', [
        Validators.required,
        CustomValidators.currency
      ]],
      description: ['', [
        CustomValidators.textWithPunctuation,
        CustomValidators.maxLength(500)
      ]]
    });
  }

  hasFieldErrors(control: AbstractControl): boolean {
    return this.validationService.hasErrors(control);
  }

  getFieldErrorMessage(control: AbstractControl, fieldType: string): string {
    return this.validationService.getFirstErrorMessage(control, fieldType);
  }

  isLoading(key: string): boolean {
    return this.loadingService.isLoading(key);
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.submissionService.submitForm(
        this.productForm,
        (formData) => this.productService.createProduct(formData),
        {
          showLoading: true,
          showSuccessMessage: true,
          resetForm: true,
          successMessage: 'Product created successfully!',
          beforeSubmit: (form) => {
            // Additional validation or preparation
            return true;
          },
          afterSubmit: (result, form) => {
            this.toastService.success('Product saved successfully!');
            this.router.navigate(['/products', result._id]);
          },
          onError: (error, form) => {
            this.toastService.error('Failed to save product. Please try again.');
          }
        }
      ).subscribe(result => {
        if (result.success) {
          console.log('Product created:', result.data);
        } else {
          console.error('Creation failed:', result.error);
        }
      });
    } else {
      this.validationService.markFormGroupTouched(this.productForm);
    }
  }
}
```

## Best Practices

### 1. Validation Strategy
- Use appropriate validators for field types
- Provide clear, user-friendly error messages
- Validate on blur and submit, not on every keystroke
- Use async validators for server-side validation

### 2. Error Handling
- Always handle errors gracefully
- Provide retry mechanisms for transient errors
- Log errors for debugging
- Show user-friendly error messages
- Implement fallback actions

### 3. Loading States
- Show loading indicators for async operations
- Use specific loading keys for different operations
- Provide progress indicators for long operations
- Allow users to cancel operations when possible

### 4. User Experience
- Show immediate feedback for user actions
- Use appropriate toast types (success, error, warning, info)
- Provide confirmation for destructive actions
- Implement auto-dismiss for non-critical messages

### 5. Performance
- Debounce form submissions when appropriate
- Use loading states to prevent multiple submissions
- Implement retry logic with exponential backoff
- Cache validation results when possible

## Testing

### Unit Testing Validators
```typescript
describe('CustomValidators', () => {
  it('should validate email format', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org'
    ];

    const invalidEmails = [
      'invalid-email',
      '@example.com',
      'user@',
      'user@.com'
    ];

    validEmails.forEach(email => {
      const control = { value: email } as AbstractControl;
      expect(CustomValidators.email(control)).toBeNull();
    });

    invalidEmails.forEach(email => {
      const control = { value: email } as AbstractControl;
      expect(CustomValidators.email(control)).toEqual({ email: { value: email } });
    });
  });
});
```

### Testing Form Submission
```typescript
describe('FormSubmissionService', () => {
  it('should handle successful submission', (done) => {
    const form = new FormGroup({
      name: new FormControl('Test Product')
    });

    const submissionFn = (data: any) => of({ id: '123', ...data });

    service.submitForm(form, submissionFn).subscribe(result => {
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('123');
      done();
    });
  });
});
```

## Conclusion

This comprehensive form validation and error handling system provides:

- **Robust Validation**: Comprehensive validation rules for all field types
- **User Experience**: Clear error messages and loading states
- **Error Recovery**: Automatic retry mechanisms and fallback actions
- **Developer Experience**: Easy-to-use services and clear APIs
- **Maintainability**: Centralized validation logic and error handling
- **Scalability**: Modular architecture that grows with the application

The system ensures that users receive immediate, helpful feedback while developers have powerful tools for handling complex validation and error scenarios.
