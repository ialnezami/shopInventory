import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./inventory-dashboard/inventory-dashboard.component').then(m => m.InventoryDashboardComponent)
  }
];
