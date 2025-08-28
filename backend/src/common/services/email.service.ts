import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { InvoiceDocument } from '../../modules/invoices/schemas/invoice.schema';

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

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private isInitialized = false;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      // Check if email configuration is available
      const emailHost = this.configService.get('EMAIL_HOST');
      const emailUser = this.configService.get('EMAIL_USER');
      const emailPass = this.configService.get('EMAIL_PASS');

      if (!emailHost || !emailUser || !emailPass) {
        this.logger.warn('⚠️ Email configuration incomplete - email service will be disabled');
        this.isInitialized = false;
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(this.configService.get('EMAIL_PORT') || '587', 10),
        secure: this.configService.get('EMAIL_SECURE') === 'true',
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        // Add connection timeout and retry options
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,   // 10 seconds
        socketTimeout: 10000,     // 10 seconds
        // Retry configuration
        maxConnections: 5,
        maxMessages: 100,
        rateLimit: 14, // 14 messages per second
      });

      // Test the connection
      await this.transporter.verify();
      this.isInitialized = true;
      this.logger.log('✅ Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize email transporter:', error.message);
      this.isInitialized = false;
      
      // Log more details for debugging
      if (error.code === 'ECONNREFUSED') {
        this.logger.warn('⚠️ SMTP connection refused - check if SMTP server is running');
        this.logger.warn('⚠️ You can use services like Gmail, SendGrid, or Mailgun');
      } else if (error.code === 'EAUTH') {
        this.logger.warn('⚠️ SMTP authentication failed - check credentials');
      } else if (error.code === 'ETIMEDOUT') {
        this.logger.warn('⚠️ SMTP connection timeout - check network/firewall');
      }
      
      this.logger.warn('📧 Email service is disabled - emails will not be sent');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.isInitialized || !this.transporter) {
      this.logger.warn('📧 Email service not initialized - skipping email send');
      return false;
    }

    try {
      const mailOptions = {
        from: this.configService.get('EMAIL_FROM') || 'noreply@shopinventory.com',
        replyTo: this.configService.get('EMAIL_REPLY_TO') || 'support@shopinventory.com',
        ...options,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email sent successfully to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error('❌ Failed to send email:', error.message);
      
      // Try to reinitialize transporter on connection errors
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        this.logger.log('🔄 Attempting to reinitialize email transporter...');
        await this.initializeTransporter();
      }
      
      return false;
    }
  }

  async sendInvoiceEmail(data: InvoiceEmailData): Promise<boolean> {
    const html = this.generateInvoiceEmailTemplate(data);
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Invoice #${data.invoiceNumber} - ${this.configService.get('COMPANY_NAME') || 'TechStore Pro'}`,
      html,
    });
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const html = this.generateWelcomeEmailTemplate(data);
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Welcome to ${this.configService.get('COMPANY_NAME') || 'TechStore Pro'}!`,
      html,
    });
  }

  async sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
    const html = this.generatePasswordResetTemplate(data);
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Password Reset Request - ${this.configService.get('COMPANY_NAME') || 'TechStore Pro'}`,
      html,
    });
  }

  async sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<boolean> {
    const html = this.generateOrderConfirmationTemplate(data);
    return this.sendEmail({
      to: data.customerEmail,
      subject: `Order Confirmation #${data.orderNumber} - ${this.configService.get('COMPANY_NAME') || 'TechStore Pro'}`,
      html,
    });
  }

  async testConnection(): Promise<boolean> {
    if (!this.isInitialized || !this.transporter) {
      this.logger.warn('📧 Email service not initialized');
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('✅ Email connection test successful');
      return true;
    } catch (error) {
      this.logger.error('❌ Email connection test failed:', error.message);
      return false;
    }
  }

  getServiceStatus(): { initialized: boolean; host?: string; port?: number } {
    return {
      initialized: this.isInitialized,
      host: this.configService.get('EMAIL_HOST'),
      port: parseInt(this.configService.get('EMAIL_PORT') || '587', 10),
    };
  }

  private generateInvoiceEmailTemplate(data: InvoiceEmailData): string {
    const companyName = this.configService.get('COMPANY_NAME') || 'TechStore Pro';
    const companyAddress = this.configService.get('COMPANY_ADDRESS') || '123 Tech Street, San Francisco, CA 94105';
    const companyPhone = this.configService.get('COMPANY_PHONE') || '+1-555-TECH';
    const companyWebsite = this.configService.get('COMPANY_WEBSITE') || 'www.techstorepro.com';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${data.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .company-info { text-align: center; }
          .invoice-details { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .items-table th { background: #f8f9fa; font-weight: bold; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-info">
              <h1>${companyName}</h1>
              <p>${companyAddress}</p>
              <p>Phone: ${companyPhone} | Website: ${companyWebsite}</p>
            </div>
          </div>

          <div class="invoice-details">
            <h2>Invoice #${data.invoiceNumber}</h2>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
            <p><strong>Due Date:</strong> ${data.dueDate}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <h3>Total Amount: $${data.totalAmount.toFixed(2)}</h3>
          </div>

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>If you have any questions, please contact us at ${companyPhone}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeEmailTemplate(data: WelcomeEmailData): string {
    const companyName = this.configService.get('COMPANY_NAME') || 'TechStore Pro';
    const companyWebsite = this.configService.get('COMPANY_WEBSITE') || 'www.techstorepro.com';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${companyName}!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .content { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 30px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ${companyName}!</h1>
            <p>We're excited to have you as part of our community</p>
          </div>

          <div class="content">
            <h2>Hello ${data.customerName}!</h2>
            <p>Welcome to ${companyName}! We're thrilled to have you join our community of satisfied customers.</p>
            
            <p>Here's what you can expect from us:</p>
            <ul>
              <li>🚀 High-quality products and services</li>
              <li>💎 Exclusive deals and promotions</li>
              <li>📱 Easy online shopping experience</li>
              <li>🛡️ Secure and reliable service</li>
            </ul>

            <p>${data.welcomeMessage || 'We look forward to serving you and providing an exceptional shopping experience!'}</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://${companyWebsite}" class="button">Start Shopping Now</a>
            </div>

            <p>If you have any questions or need assistance, don't hesitate to reach out to our customer support team.</p>
          </div>

          <div class="footer">
            <p>Thank you for choosing ${companyName}!</p>
            <p>Visit us at <a href="https://${companyWebsite}">${companyWebsite}</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetTemplate(data: PasswordResetData): string {
    const companyName = this.configService.get('COMPANY_NAME') || 'TechStore Pro';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request - ${companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .content { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 30px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 15px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
            <p>${companyName} - Account Security</p>
          </div>

          <div class="content">
            <h2>Hello ${data.customerName},</h2>
            <p>We received a request to reset your password for your ${companyName} account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" class="button">Reset My Password</a>
            </div>

            <div class="warning">
              <p><strong>⚠️ Important:</strong></p>
              <ul>
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this password reset, please ignore this email</li>
                <li>Your password will remain unchanged until you complete the reset process</li>
              </ul>
            </div>

            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${data.resetUrl}</p>

            <p>If you have any questions or need assistance, please contact our support team.</p>
          </div>

          <div class="footer">
            <p>This is an automated message from ${companyName}</p>
            <p>Please do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderConfirmationTemplate(data: OrderConfirmationData): string {
    const companyName = this.configService.get('COMPANY_NAME') || 'TechStore Pro';
    const companyPhone = this.configService.get('COMPANY_PHONE') || '+1-555-TECH';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${data.orderNumber} - ${companyName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px; }
          .order-details { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .items-table th { background: #f8f9fa; font-weight: bold; }
          .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Thank you for your order, ${data.customerName}!</p>
          </div>

          <div class="order-details">
            <h2>Order #${data.orderNumber}</h2>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Customer:</strong> ${data.customerName}</p>
            <p><strong>Email:</strong> ${data.customerEmail}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.unitPrice.toFixed(2)}</td>
                  <td>$${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            <h3>Total Amount: $${data.totalAmount.toFixed(2)}</h3>
          </div>

          <div class="footer">
            <p>🎉 Your order has been successfully placed!</p>
            <p>We'll send you updates on your order status via email.</p>
            <p>If you have any questions, please contact us at ${companyPhone}</p>
            <p>Thank you for choosing ${companyName}!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
