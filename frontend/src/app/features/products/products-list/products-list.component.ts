import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="row mb-4">
        <div class="col-md-6">
          <h2 class="text-gradient">Products Management</h2>
          <p class="text-muted">Manage your product catalog</p>
        </div>
        <div class="col-md-6 text-end">
          <a routerLink="/products/new" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>Add New Product
          </a>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="row mb-4">
        <div class="col-md-8">
          <div class="input-group">
            <input 
              type="text" 
              class="form-control" 
              placeholder="Search products by name, SKU, or description..."
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
            >
            <button class="btn btn-outline-secondary" type="button">
              <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div class="col-md-4">
          <select class="form-select" [(ngModel)]="selectedCategory" (change)="onCategoryChange()">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="books">Books</option>
            <option value="home">Home & Garden</option>
          </select>
        </div>
      </div>

      <!-- Products Table -->
      <div class="card">
        <div class="card-header">
          <h5 class="mb-0">
            <i class="fas fa-box me-2"></i>Products List
            <span class="badge bg-secondary ms-2">{{ filteredProducts.length }}</span>
          </h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of filteredProducts">
                  <td>
                    <img 
                      [src]="product.image || 'assets/placeholder-product.jpg'" 
                      alt="Product"
                      class="rounded"
                      style="width: 50px; height: 50px; object-fit: cover;"
                    >
                  </td>
                  <td>
                    <strong>{{ product.name }}</strong>
                    <br>
                    <small class="text-muted">{{ product.description }}</small>
                  </td>
                  <td><code>{{ product.sku }}</code></td>
                  <td>
                    <span class="badge bg-info">{{ product.category }}</span>
                  </td>
                  <td>
                    <strong class="text-success">${{ product.price }}</strong>
                  </td>
                  <td>
                    <span 
                      [class]="'badge ' + (product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger')"
                    >
                      {{ product.stock }}
                    </span>
                  </td>
                  <td>
                    <span 
                      [class]="'badge ' + (product.active ? 'bg-success' : 'bg-secondary')"
                    >
                      {{ product.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group" role="group">
                      <button class="btn btn-sm btn-outline-primary" [routerLink]="['/products/edit', product.id]">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" (click)="deleteProduct(product.id)">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="filteredProducts.length === 0" class="text-center py-5">
            <i class="fas fa-box fa-3x text-muted mb-3"></i>
            <h5 class="text-muted">No products found</h5>
            <p class="text-muted">Try adjusting your search criteria or add a new product.</p>
            <a routerLink="/products/new" class="btn btn-primary">
              <i class="fas fa-plus me-2"></i>Add First Product
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProductsListComponent implements OnInit {
  products = [
    {
      id: 1,
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with advanced features',
      sku: 'IPH15PRO-128',
      category: 'electronics',
      price: 999.99,
      stock: 25,
      active: true,
      image: 'https://via.placeholder.com/150x150?text=iPhone+15+Pro'
    },
    {
      id: 2,
      name: 'Samsung Galaxy S24',
      description: 'Premium Android smartphone',
      sku: 'SAMS24-256',
      category: 'electronics',
      price: 899.99,
      stock: 18,
      active: true,
      image: 'https://via.placeholder.com/150x150?text=Galaxy+S24'
    },
    {
      id: 3,
      name: 'MacBook Pro 16"',
      description: 'Professional laptop for developers',
      sku: 'MBP16-M2',
      category: 'electronics',
      price: 2499.99,
      stock: 8,
      active: true,
      image: 'https://via.placeholder.com/150x150?text=MacBook+Pro'
    },
    {
      id: 4,
      name: 'Nike Air Max',
      description: 'Comfortable running shoes',
      sku: 'NIKE-AM-001',
      category: 'clothing',
      price: 129.99,
      stock: 42,
      active: true,
      image: 'https://via.placeholder.com/150x150?text=Nike+Air+Max'
    },
    {
      id: 5,
      name: 'Coffee Maker',
      description: 'Automatic coffee brewing machine',
      sku: 'COFFEE-001',
      category: 'home',
      price: 89.99,
      stock: 5,
      active: true,
      image: 'https://via.placeholder.com/150x150?text=Coffee+Maker'
    }
  ];

  filteredProducts = this.products;
  searchTerm = '';
  selectedCategory = '';

  ngOnInit() {
    console.log('Products list initialized');
  }

  onSearch() {
    this.filterProducts();
  }

  onCategoryChange() {
    this.filterProducts();
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== id);
      this.filterProducts();
    }
  }
}
