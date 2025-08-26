import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="text-gradient">Dashboard</h2>
          <p class="text-muted">Welcome to your shop management dashboard</p>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="dashboard-card text-center">
            <div class="icon text-primary">
              <i class="fas fa-box"></i>
            </div>
            <div class="number">1,234</div>
            <div class="label">Total Products</div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="dashboard-card text-center">
            <div class="icon text-success">
              <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="number">89</div>
            <div class="label">Today's Sales</div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="dashboard-card text-center">
            <div class="icon text-warning">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="number">12</div>
            <div class="label">Low Stock Items</div>
          </div>
        </div>
        
        <div class="col-md-3 mb-3">
          <div class="dashboard-card text-center">
            <div class="icon text-info">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="number">$8,456</div>
            <div class="label">Today's Revenue</div>
          </div>
        </div>
      </div>

      <!-- Charts and Tables Row -->
      <div class="row">
        <!-- Recent Sales -->
        <div class="col-md-8 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>Recent Sales</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>TXN20240826001</td>
                      <td>John Doe</td>
                      <td>$125.00</td>
                      <td><span class="badge bg-success">Completed</span></td>
                      <td>2024-08-26</td>
                    </tr>
                    <tr>
                      <td>TXN20240826002</td>
                      <td>Jane Smith</td>
                      <td>$89.50</td>
                      <td><span class="badge bg-success">Completed</span></td>
                      <td>2024-08-26</td>
                    </tr>
                    <tr>
                      <td>TXN20240826003</td>
                      <td>Bob Johnson</td>
                      <td>$234.75</td>
                      <td><span class="badge bg-warning">Pending</span></td>
                      <td>2024-08-26</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-md-4 mb-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-bolt me-2"></i>Quick Actions</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-primary" routerLink="/sales">
                  <i class="fas fa-plus me-2"></i>New Sale
                </button>
                <button class="btn btn-outline-primary" routerLink="/products">
                  <i class="fas fa-box me-2"></i>Add Product
                </button>
                <button class="btn btn-outline-primary" routerLink="/inventory">
                  <i class="fas fa-warehouse me-2"></i>Check Inventory
                </button>
                <button class="btn btn-outline-primary" routerLink="/reports">
                  <i class="fas fa-chart-bar me-2"></i>View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alerts -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0"><i class="fas fa-exclamation-triangle me-2"></i>Low Stock Alerts</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Current Stock</th>
                      <th>Min Stock</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>iPhone 15 Pro</td>
                      <td>IPH15PRO-128</td>
                      <td><span class="badge bg-danger">5</span></td>
                      <td>10</td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary">Reorder</button>
                      </td>
                    </tr>
                    <tr>
                      <td>Samsung Galaxy S24</td>
                      <td>SAMS24-256</td>
                      <td><span class="badge bg-warning">8</span></td>
                      <td>15</td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary">Reorder</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  ngOnInit() {
    // Initialize dashboard data
    console.log('Dashboard initialized');
  }
}
