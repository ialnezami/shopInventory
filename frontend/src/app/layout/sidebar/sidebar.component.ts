import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="sidebar">
      <div class="p-3">
        <h4 class="text-center mb-4">
          <i class="fas fa-store"></i>
          <span class="ms-2">Shop Inventory</span>
        </h4>
        
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
              <i class="fas fa-tachometer-alt"></i>
              Dashboard
            </a>
          </li>
          
          <li class="nav-item">
            <a class="nav-link" routerLink="/products" routerLinkActive="active">
              <i class="fas fa-box"></i>
              Products
            </a>
          </li>
          
          <li class="nav-item">
            <a class="nav-link" routerLink="/sales" routerLinkActive="active">
              <i class="fas fa-shopping-cart"></i>
              Sales (POS)
            </a>
          </li>
          
          <li class="nav-item">
            <a class="nav-link" routerLink="/inventory" routerLinkActive="active">
              <i class="fas fa-warehouse"></i>
              Inventory
            </a>
          </li>
          
          <li class="nav-item">
            <a class="nav-link" routerLink="/invoices" routerLinkActive="active">
              <i class="fas fa-file-invoice"></i>
              Invoices
            </a>
          </li>
          
          <li class="nav-item">
            <a class="nav-link" routerLink="/reports" routerLinkActive="active">
              <i class="fas fa-chart-bar"></i>
              Reports
            </a>
          </li>
          
          <li class="nav-item">
            <a class="nav-link" routerLink="/demo" routerLinkActive="active">
              <i class="fas fa-flask"></i>
              UI Demo
            </a>
          </li>
        </ul>
        
        <hr class="my-4">
        
        <div class="text-center">
          <small class="text-muted">Version 1.0.0</small>
        </div>
      </div>
    </nav>
  `,
  styles: []
})
export class SidebarComponent {
  constructor(private router: Router) {}
}
