import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white shadow-sm border-bottom">
      <div class="d-flex justify-content-between align-items-center px-4 py-3">
        <div>
          <h5 class="mb-0 text-gradient">Shop Inventory Management</h5>
        </div>
        
        <div class="d-flex align-items-center">
          <div class="me-3">
            <span class="text-muted">Welcome,</span>
            <span class="fw-bold ms-1">Admin User</span>
          </div>
          
          <div class="dropdown">
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <i class="fas fa-user-circle me-2"></i>
              Admin
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Profile</a></li>
              <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" (click)="logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  constructor(private router: Router) {}

  logout() {
    // Clear local storage and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth/login']);
  }
}
