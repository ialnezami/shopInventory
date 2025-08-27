import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from '../services/email.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  @Roles('admin')
  @ApiOperation({ summary: 'Send a test email' })
  @ApiResponse({ status: 200, description: 'Test email sent successfully' })
  @ApiResponse({ status: 400, description: 'Failed to send test email' })
  async sendTestEmail(@Body() body: { to: string; subject?: string }, @Request() req) {
    const { to, subject = 'Test Email from Shop Inventory System' } = body;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { background: #fff; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Test Email</h1>
            <p>Shop Inventory System</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>This is a test email from your Shop Inventory System.</p>
            <p><strong>Sent by:</strong> ${req.user.username}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
            <p>If you received this email, your email configuration is working correctly! 🎉</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const success = await this.emailService.sendEmail({
      to,
      subject,
      html,
    });

    return {
      success,
      message: success ? 'Test email sent successfully' : 'Failed to send test email',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('invoice')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Send invoice email to customer' })
  @ApiResponse({ status: 200, description: 'Invoice email sent successfully' })
  @ApiResponse({ status: 400, description: 'Failed to send invoice email' })
  async sendInvoiceEmail(@Body() body: { invoiceId: string; customerEmail: string }) {
    // This would typically fetch the invoice data from the database
    // For now, we'll create a mock invoice for demonstration
    const mockInvoice = {
      _id: body.invoiceId,
      invoiceNumber: 'INV-TEST-001',
      totals: { total: 299.99 },
      dates: { dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      company: {
        name: 'TechStore Pro',
        address: '123 Tech Street, San Francisco, CA 94105',
        phone: '+1-555-TECH',
        email: 'info@techstorepro.com',
        website: 'www.techstorepro.com',
      },
    } as any;

    const invoiceData = {
      invoice: mockInvoice,
      customerEmail: body.customerEmail,
      customerName: 'Test Customer',
      companyName: 'TechStore Pro',
      invoiceNumber: 'INV-TEST-001',
      total: 299.99,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      pdfPath: '', // No PDF for test
    };

    const success = await this.emailService.sendInvoiceEmail(invoiceData);

    return {
      success,
      message: success ? 'Invoice email sent successfully' : 'Failed to send invoice email',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('welcome')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Send welcome email to new customer' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully' })
  @ApiResponse({ status: 400, description: 'Failed to send welcome email' })
  async sendWelcomeEmail(@Body() body: { customerEmail: string; customerName: string }) {
    const success = await this.emailService.sendWelcomeEmail(body.customerEmail, body.customerName);

    return {
      success,
      message: success ? 'Welcome email sent successfully' : 'Failed to send welcome email',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('test-connection')
  @Roles('admin')
  @ApiOperation({ summary: 'Test email connection' })
  @ApiResponse({ status: 200, description: 'Connection test completed' })
  async testConnection() {
    const isConnected = await this.emailService.testConnection();

    return {
      connected: isConnected,
      message: isConnected ? 'Email connection successful' : 'Email connection failed',
      timestamp: new Date().toISOString(),
    };
  }
}
