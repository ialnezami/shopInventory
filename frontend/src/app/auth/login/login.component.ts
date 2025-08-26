import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-md-6 col-lg-4">
          <div class="card shadow-custom">
            <div class="card-header text-center">
              <h3 class="mb-0">
                <i class="fas fa-store text-gradient me-2"></i>
                Shop Inventory
              </h3>
              <p class="text-muted mb-0">Sign in to your account</p>
            </div>
            <div class="card-body p-4">
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    formControlName="email"
                    placeholder="Enter your email"
                    [class.is-invalid]="isFieldInvalid('email')"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('email')">
                    Please enter a valid email address.
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    formControlName="password"
                    placeholder="Enter your password"
                    [class.is-invalid]="isFieldInvalid('password')"
                  >
                  <div class="invalid-feedback" *ngIf="isFieldInvalid('password')">
                    Password is required.
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="rememberMe">
                  <label class="form-check-label" for="rememberMe">
                    Remember me
                  </label>
                </div>

                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    [disabled]="loginForm.invalid || isLoading"
                  >
                    <span *ngIf="!isLoading">
                      <i class="fas fa-sign-in-alt me-2"></i>Sign In
                    </span>
                    <span *ngIf="isLoading">
                      <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                      Signing In...
                    </span>
                  </button>
                </div>
              </form>

              <div class="text-center mt-3">
                <small class="text-muted">
                  Demo Credentials: admin@shopinventory.com / admin123
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['admin@shopinventory.com', [Validators.required, Validators.email]],
      password: ['admin123', [Validators.required, Validators.minLength(6)]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      
      // Simulate API call
      setTimeout(() => {
        // For demo purposes, accept any valid form
        const { email, password } = this.loginForm.value;
        
        if (email === 'admin@shopinventory.com' && password === 'admin123') {
          // Store token and user info
          localStorage.setItem('token', 'demo-token-123');
          localStorage.setItem('user', JSON.stringify({
            id: '1',
            name: 'Admin User',
            email: email,
            role: 'admin'
          }));
          
          this.router.navigate(['/dashboard']);
        } else {
          alert('Invalid credentials. Please use the demo credentials.');
        }
        
        this.isLoading = false;
      }, 1000);
    }
  }
}
