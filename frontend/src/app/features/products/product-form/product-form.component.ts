import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="text-gradient">{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h2>
          <p class="text-muted">{{ isEditMode ? 'Update product information' : 'Create a new product for your catalog' }}</p>
        </div>
      </div>

      <!-- Product Form -->
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-box me-2"></i>
                {{ isEditMode ? 'Edit Product' : 'New Product Details' }}
              </h5>
            </div>
            <div class="card-body">
              <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
                <div class="row">
                  <!-- Basic Information -->
                  <div class="col-md-6">
                    <h6 class="mb-3 text-primary">Basic Information</h6>
                    
                    <div class="mb-3">
                      <label for="name" class="form-label">Product Name *</label>
                      <input
                        type="text"
                        class="form-control"
                        id="name"
                        formControlName="name"
                        placeholder="Enter product name"
                        [class.is-invalid]="isFieldInvalid('name')"
                      >
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('name')">
                        Product name is required.
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="sku" class="form-label">SKU *</label>
                      <input
                        type="text"
                        class="form-control"
                        id="sku"
                        formControlName="sku"
                        placeholder="Enter SKU"
                        [class.is-invalid]="isFieldInvalid('sku')"
                      >
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('sku')">
                        SKU is required.
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="category" class="form-label">Category *</label>
                      <select
                        class="form-select"
                        id="category"
                        formControlName="category"
                        [class.is-invalid]="isFieldInvalid('category')"
                      >
                        <option value="">Select category</option>
                        <option value="electronics">Electronics</option>
                        <option value="clothing">Clothing</option>
                        <option value="books">Books</option>
                        <option value="home">Home & Garden</option>
                        <option value="sports">Sports & Outdoors</option>
                      </select>
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('category')">
                        Category is required.
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="description" class="form-label">Description</label>
                      <textarea
                        class="form-control"
                        id="description"
                        rows="3"
                        formControlName="description"
                        placeholder="Enter product description"
                      ></textarea>
                    </div>
                  </div>

                  <!-- Pricing & Inventory -->
                  <div class="col-md-6">
                    <h6 class="mb-3 text-primary">Pricing & Inventory</h6>
                    
                    <div class="mb-3">
                      <label for="costPrice" class="form-label">Cost Price *</label>
                      <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input
                          type="number"
                          class="form-control"
                          id="costPrice"
                          formControlName="costPrice"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          [class.is-invalid]="isFieldInvalid('costPrice')"
                        >
                      </div>
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('costPrice')">
                        Cost price is required and must be positive.
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="sellingPrice" class="form-label">Selling Price *</label>
                      <div class="input-group">
                        <span class="input-group-text">$</span>
                        <input
                          type="number"
                          class="form-control"
                          id="sellingPrice"
                          formControlName="sellingPrice"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          [class.is-invalid]="isFieldInvalid('sellingPrice')"
                        >
                      </div>
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('sellingPrice')">
                        Selling price is required and must be positive.
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="quantity" class="form-label">Initial Stock *</label>
                      <input
                        type="number"
                        class="form-control"
                        id="quantity"
                        formControlName="quantity"
                        placeholder="0"
                        min="0"
                        [class.is-invalid]="isFieldInvalid('quantity')"
                      >
                      <div class="invalid-feedback" *ngIf="isFieldInvalid('quantity')">
                        Initial stock is required and must be non-negative.
                      </div>
                    </div>

                    <div class="mb-3">
                      <label for="minStock" class="form-label">Minimum Stock Level</label>
                      <input
                        type="number"
                        class="form-control"
                        id="minStock"
                        formControlName="minStock"
                        placeholder="10"
                        min="0"
                      >
                    </div>
                  </div>
                </div>

                <!-- Additional Information -->
                <div class="row mt-4">
                  <div class="col-12">
                    <h6 class="mb-3 text-primary">Additional Information</h6>
                    
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="weight" class="form-label">Weight (kg)</label>
                          <input
                            type="number"
                            class="form-control"
                            id="weight"
                            formControlName="weight"
                            placeholder="0.0"
                            step="0.1"
                            min="0"
                          >
                        </div>
                      </div>
                      
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="supplier" class="form-label">Supplier</label>
                          <input
                            type="text"
                            class="form-control"
                            id="supplier"
                            formControlName="supplier"
                            placeholder="Enter supplier name"
                          >
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          id="isActive"
                          formControlName="isActive"
                        >
                        <label class="form-check-label" for="isActive">
                          Product is active and available for sale
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Form Actions -->
                <div class="row mt-4">
                  <div class="col-12">
                    <hr>
                    <div class="d-flex justify-content-between">
                      <button type="button" class="btn btn-outline-secondary" routerLink="/products">
                        <i class="fas fa-arrow-left me-2"></i>Cancel
                      </button>
                      <button type="submit" class="btn btn-primary" [disabled]="productForm.invalid || isLoading">
                        <span *ngIf="!isLoading">
                          <i class="fas fa-save me-2"></i>
                          {{ isEditMode ? 'Update Product' : 'Create Product' }}
                        </span>
                        <span *ngIf="isLoading">
                          <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                          Saving...
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  productId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      sku: ['', [Validators.required, Validators.minLength(3)]],
      category: ['', Validators.required],
      description: [''],
      costPrice: ['', [Validators.required, Validators.min(0)]],
      sellingPrice: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      minStock: [10, [Validators.min(0)]],
      weight: [''],
      supplier: [''],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = params['id'];
        this.loadProduct(this.productId);
      }
    });
  }

  loadProduct(id: string) {
    // In a real app, this would load from a service
    // For demo purposes, we'll create a mock product
    const mockProduct = {
      name: 'Sample Product',
      sku: 'SAMPLE-001',
      category: 'electronics',
      description: 'This is a sample product',
      costPrice: 50.00,
      sellingPrice: 99.99,
      quantity: 100,
      minStock: 10,
      weight: 0.5,
      supplier: 'Sample Supplier',
      isActive: true
    };

    this.productForm.patchValue(mockProduct);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        console.log('Product data:', this.productForm.value);
        
        // In a real app, this would save to the backend
        alert(this.isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
        
        this.router.navigate(['/products']);
        this.isLoading = false;
      }, 1000);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.productForm.controls).forEach(key => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }
}
