import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import * as fs from 'fs';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - sale not found or invalid data' })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Request() req) {
    return this.invoicesService.create(createInvoiceDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Invoices retrieved successfully' })
  @ApiQuery({ name: 'customer', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by invoice status' })
  @ApiQuery({ name: 'paymentStatus', required: false, description: 'Filter by payment status' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Filter by start date' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Filter by end date' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Field to sort by' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)' })
  findAll(@Query() query: any) {
    return this.invoicesService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get invoice statistics' })
  @ApiResponse({ status: 200, description: 'Invoice statistics retrieved successfully' })
  getInvoiceStats() {
    return this.invoicesService.getInvoiceStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an invoice by ID' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(id);
  }

  @Get('number/:invoiceNumber')
  @ApiOperation({ summary: 'Get an invoice by invoice number' })
  @ApiResponse({ status: 200, description: 'Invoice retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findByInvoiceNumber(@Param('invoiceNumber') invoiceNumber: string) {
    return this.invoicesService.findByInvoiceNumber(invoiceNumber);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Generate PDF for an invoice' })
  @ApiResponse({ status: 200, description: 'PDF generated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async generatePDF(@Param('id') id: string) {
    const pdfPath = await this.invoicesService.generatePDF(id);
    return { pdfPath, message: 'PDF generated successfully' };
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download PDF for an invoice' })
  @ApiResponse({ status: 200, description: 'PDF downloaded successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment')
  async downloadPDF(@Param('id') id: string, @Res() res: Response) {
    try {
      const { path: pdfPath, filename } = await this.invoicesService.downloadPDF(id);
      
      if (!fs.existsSync(pdfPath)) {
        return res.status(404).json({ message: 'PDF file not found' });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
      
      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: 'Error downloading PDF', error: error.message });
    }
  }

  @Patch(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  update(@Param('id') id: string, @Body() updateInvoiceDto: UpdateInvoiceDto, @Request() req) {
    return this.invoicesService.update(id, updateInvoiceDto, req.user.id);
  }

  @Patch(':id/payment-status')
  @Roles('admin', 'manager', 'cashier')
  @ApiOperation({ summary: 'Update invoice payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payment status' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() body: { status: string; paidAmount?: number }
  ) {
    return this.invoicesService.updatePaymentStatus(id, body.status, body.paidAmount);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete an invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  remove(@Param('id') id: string) {
    return this.invoicesService.remove(id);
  }
}
