import { Controller, Post, Body, Get, UseGuards, Request, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from '../services/email.service';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { InvoiceEmailData, WelcomeEmailData } from '../interfaces/email.interface';

@ApiTags('email')
@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

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
  @ApiOperation({ summary: 'Send invoice email' })
  @ApiResponse({ status: 200, description: 'Invoice email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid invoice data' })
  async sendInvoiceEmail(@Body() body: any) {
    try {
      // Transform the data to match the new interface
      const invoiceData: InvoiceEmailData = {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        invoiceNumber: body.invoiceNumber,
        totalAmount: body.total,
        dueDate: body.dueDate,
        items: body.items || [],
      };

      const success = await this.emailService.sendInvoiceEmail(invoiceData);
      
      if (success) {
        return {
          success: true,
          message: 'Invoice email sent successfully',
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          success: false,
          message: 'Failed to send invoice email - email service not available',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      this.logger.error('Failed to send invoice email:', error);
      throw new BadRequestException('Failed to send invoice email');
    }
  }

  @Post('welcome')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Send welcome email' })
  @ApiResponse({ status: 200, description: 'Welcome email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer data' })
  async sendWelcomeEmail(@Body() body: any) {
    try {
      const welcomeData: WelcomeEmailData = {
        customerName: body.customerName,
        customerEmail: body.customerEmail,
        welcomeMessage: body.welcomeMessage,
      };

      const success = await this.emailService.sendWelcomeEmail(welcomeData);
      
      if (success) {
        return {
          success: true,
          message: 'Welcome email sent successfully',
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          success: false,
          message: 'Failed to send welcome email - email service not available',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      this.logger.error('Failed to send welcome email:', error);
      throw new BadRequestException('Failed to send welcome email');
    }
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
