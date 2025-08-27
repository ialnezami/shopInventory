import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { InvoiceDocument } from '../../modules/invoices/schemas/invoice.schema';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

export interface InvoiceEmailData {
  invoice: InvoiceDocument;
  customerEmail: string;
  customerName: string;
  companyName: string;
  invoiceNumber: string;
  total: number;
  dueDate: Date;
  pdfPath: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: this.configService.get('email.host'),
        port: this.configService.get('email.port'),
        secure: this.configService.get('email.secure'),
        auth: {
          user: this.configService.get('email.auth.user'),
          pass: this.configService.get('email.auth.pass'),
        },
      });

      // Verify connection configuration
      await this.transporter.verify();
      this.logger.log('✅ Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize email transporter:', error.message);
      // Don't throw error - allow app to continue without email functionality
    }
  }

  async sendEmail(emailOptions: EmailOptions): Promise<boolean> {
    try {
      if (!this.transporter) {
        this.logger.warn('⚠️ Email transporter not initialized, skipping email send');
        return false;
      }

      const mailOptions = {
        from: this.configService.get('email.from'),
        replyTo: this.configService.get('email.replyTo'),
        ...emailOptions,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email sent successfully to ${emailOptions.to}: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${emailOptions.to}:`, error.message);
      return false;
    }
  }

  async sendInvoiceEmail(invoiceData: InvoiceEmailData): Promise<boolean> {
    try {
      const { invoice, customerEmail, customerName, companyName, invoiceNumber, total, dueDate, pdfPath } = invoiceData;

      const subject = `Invoice #${invoiceNumber} from ${companyName}`;
      const html = this.generateInvoiceEmailTemplate(invoiceData);

      const attachments = [];
      if (pdfPath && fs.existsSync(pdfPath)) {
        attachments.push({
          filename: `invoice-${invoiceNumber}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        });
      }

      const emailOptions: EmailOptions = {
        to: customerEmail,
        subject,
        html,
        attachments,
      };

      const success = await this.sendEmail(emailOptions);
      
      if (success) {
        // Update invoice to mark email as sent
        await this.updateInvoiceEmailStatus(invoice._id, true);
      }

      return success;
    } catch (error) {
      this.logger.error(`❌ Failed to send invoice email:`, error.message);
      return false;
    }
  }

  async sendWelcomeEmail(customerEmail: string, customerName: string): Promise<boolean> {
    const subject = `Welcome to ${this.configService.get('email.company.name')}!`;
    const html = this.generateWelcomeEmailTemplate(customerName);

    const emailOptions: EmailOptions = {
      to: customerEmail,
      subject,
      html,
    };

    return this.sendEmail(emailOptions);
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const subject = 'Password Reset Request';
    const resetUrl = `${this.configService.get('app.frontendUrl')}/reset-password?token=${resetToken}`;
    const html = this.generatePasswordResetTemplate(resetUrl);

    const emailOptions: EmailOptions = {
      to: userEmail,
      subject,
      html,
    };

    return this.sendEmail(emailOptions);
  }

  async sendOrderConfirmationEmail(customerEmail: string, orderData: any): Promise<boolean> {
    const subject = `Order Confirmation #${orderData.orderNumber}`;
    const html = this.generateOrderConfirmationTemplate(orderData);

    const emailOptions: EmailOptions = {
      to: customerEmail,
      subject,
      html,
    };

    return this.sendEmail(emailOptions);
  }

  private generateInvoiceEmailTemplate(data: InvoiceEmailData): string {
    const { customerName, companyName, invoiceNumber, total, dueDate, company } = data;
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(total);
    
    const formattedDueDate = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dueDate);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; }
          .invoice-details { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px; }
          .amount { font-size: 20px; font-weight: bold; color: #e74c3c; }
          .due-date { color: #e74c3c; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-name">${companyName}</div>
            <div>${company.address}</div>
            <div>Phone: ${company.phone} | Email: ${company.email}</div>
            <div>Website: ${company.website}</div>
          </div>

          <div class="invoice-details">
            <h2>Invoice #${invoiceNumber}</h2>
            <p>Dear ${customerName},</p>
            <p>Thank you for your business! Please find attached your invoice for the recent purchase.</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 6px;">
              <strong>Invoice Amount:</strong> <span class="amount">${formattedTotal}</span><br>
              <strong>Due Date:</strong> <span class="due-date">${formattedDueDate}</span>
            </div>

            <p>Please review the attached invoice for complete details. If you have any questions or need to make payment arrangements, please don't hesitate to contact us.</p>
          </div>

          <div class="footer">
            <p>Thank you for choosing ${companyName}!</p>
            <p>For support, contact us at ${company.email} or call ${company.phone}</p>
            <p style="font-size: 12px; color: #6c757d;">
              This is an automated email. Please do not reply directly to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWelcomeEmailTemplate(customerName: string): string {
    const companyName = this.configService.get('email.company.name');
    const companyWebsite = this.configService.get('email.company.website');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${companyName}!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .welcome-text { font-size: 24px; margin-bottom: 10px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="welcome-text">🎉 Welcome to ${companyName}!</div>
            <p>We're excited to have you as part of our community</p>
          </div>

          <div class="content">
            <h2>Hello ${customerName}!</h2>
            <p>Welcome to ${companyName}! We're thrilled to have you join our community of satisfied customers.</p>
            
            <p>As a new customer, you'll enjoy:</p>
            <ul>
              <li>Exclusive access to our latest products</li>
              <li>Special discounts and promotions</li>
              <li>Priority customer support</li>
              <li>Loyalty rewards program</li>
            </ul>

            <p>Ready to start shopping? Visit our website to explore our products!</p>
            
            <a href="${companyWebsite}" class="button">Start Shopping</a>
          </div>

          <div class="footer">
            <p>Thank you for choosing ${companyName}!</p>
            <p>If you have any questions, our support team is here to help.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePasswordResetTemplate(resetUrl: string): string {
    const companyName = this.configService.get('email.company.name');

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px; }
          .button { display: inline-block; padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔐 Password Reset Request</h2>
            <p>${companyName}</p>
          </div>

          <div class="content">
            <h3>Hello!</h3>
            <p>We received a request to reset your password for your ${companyName} account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetUrl}" class="button">Reset Password</a>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>For security, never share this link with anyone</li>
              </ul>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          </div>

          <div class="footer">
            <p>If you have any questions, contact our support team.</p>
            <p style="font-size: 12px; color: #6c757d;">
              This is an automated email. Please do not reply directly to this message.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateOrderConfirmationTemplate(orderData: any): string {
    const companyName = this.configService.get('email.company.name');
    const formattedTotal = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(orderData.total);

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${orderData.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
          .order-details { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px; }
          .amount { font-size: 20px; font-weight: bold; color: #28a745; }
          .footer { text-align: center; margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Order Confirmed!</h2>
            <p>Order #${orderData.orderNumber}</p>
          </div>

          <div class="order-details">
            <h3>Thank you for your order!</h3>
            <p>We're excited to confirm your order and get it ready for you.</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 6px;">
              <strong>Order Total:</strong> <span class="amount">${formattedTotal}</span><br>
              <strong>Order Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Estimated Delivery:</strong> 3-5 business days
            </div>

            <p>We'll send you updates on your order status and tracking information once it ships.</p>
          </div>

          <div class="footer">
            <p>Thank you for choosing ${companyName}!</p>
            <p>If you have any questions about your order, please contact our support team.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async updateInvoiceEmailStatus(invoiceId: string, isEmailSent: boolean): Promise<void> {
    try {
      // This would typically update the invoice in the database
      // For now, we'll just log it
      this.logger.log(`📧 Invoice ${invoiceId} email status updated: ${isEmailSent}`);
    } catch (error) {
      this.logger.error(`❌ Failed to update invoice email status:`, error.message);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      if (!this.transporter) {
        return false;
      }
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error('❌ Email connection test failed:', error.message);
      return false;
    }
  }
}
