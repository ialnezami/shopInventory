import { Routes } from '@angular/router';

export const INVOICES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./invoices-list/invoices-list.component').then(m => m.InvoicesListComponent)
  }
];
