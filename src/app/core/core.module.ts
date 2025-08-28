import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';

// Services
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { ProductService } from './services/product.service';
import { CustomerService } from './services/customer.service';
import { SalesService } from './services/sales.service';
import { FormValidationService } from './services/form-validation.service';
import { FormSubmissionService } from './services/form-submission.service';
import { ToastService } from './services/toast.service';
import { LoadingService } from './services/loading.service';
import { ErrorBoundaryService } from './services/error-boundary.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { PermissionGuard } from './guards/permission.guard';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ],
  providers: [
    // Core Services
    ApiService,
    AuthService,
    ProductService,
    CustomerService,
    SalesService,
    FormValidationService,
    FormSubmissionService,
    ToastService,
    LoadingService,
    ErrorBoundaryService,

    // Guards
    AuthGuard,
    RoleGuard,
    PermissionGuard,

    // Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    RouterModule
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
