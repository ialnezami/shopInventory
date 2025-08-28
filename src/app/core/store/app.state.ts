import { AuthState } from './auth/auth.state';
import { ProductState } from './product/product.state';
import { CustomerState } from './customer/customer.state';
import { SalesState } from './sales/sales.state';
import { UIState } from './ui/ui.state';

export interface AppState {
  auth: AuthState;
  products: ProductState;
  customers: CustomerState;
  sales: SalesState;
  ui: UIState;
}
