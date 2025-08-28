export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

export interface InvoiceEmailData {
  customerName: string;
  customerEmail: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export interface WelcomeEmailData {
  customerName: string;
  customerEmail: string;
  welcomeMessage?: string;
}

export interface PasswordResetData {
  customerName: string;
  customerEmail: string;
  resetToken: string;
  resetUrl: string;
}

export interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}
