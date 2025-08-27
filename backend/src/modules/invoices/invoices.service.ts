import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PdfGeneratorService } from './services/pdf-generator.service';
import { SalesService } from '../sales/sales.service';
import { CustomersService } from '../customers/customers.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    private pdfGeneratorService: PdfGeneratorService,
    private salesService: SalesService,
    private customersService: CustomersService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    // Validate sale exists
    const sale = await this.salesService.findOne(createInvoiceDto.sale);
    if (!sale) {
      throw new BadRequestException('Sale not found');
    }

    // Generate invoice number
    const invoiceNumber = await this.pdfGeneratorService.generateInvoiceNumber();

    // Calculate totals
    const subtotal = createInvoiceDto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalDiscount = createInvoiceDto.items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const tax = (subtotal - totalDiscount) * 0.1; // 10% tax
    const total = subtotal + tax - totalDiscount;

    // Set due date (default to 30 days from now)
    const dueDate = createInvoiceDto.dueDate ? new Date(createInvoiceDto.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create invoice
    const invoice = new this.invoiceModel({
      ...createInvoiceDto,
      invoiceNumber,
      issuedBy: new Types.ObjectId(userId),
      totals: {
        subtotal,
        tax,
        discount: totalDiscount,
        total,
        taxRate: 0.1,
      },
      payment: {
        method: createInvoiceDto.paymentMethod || 'pending',
        status: 'pending',
        paidAmount: 0,
      },
      dates: {
        dueDate,
        issueDate: new Date(),
        terms: createInvoiceDto.terms || 'Net 30',
      },
      status: 'draft',
    });

    const savedInvoice = await invoice.save();

    // Generate PDF
    await this.generateAndSavePDF(savedInvoice);

    return savedInvoice.populate([
      { path: 'sale', select: 'transactionNumber status' },
      { path: 'customer', select: 'firstName lastName email phone' },
      { path: 'issuedBy', select: 'username firstName lastName' },
    ]);
  }

  async findAll(query: any = {}): Promise<Invoice[]> {
    const {
      customer,
      status,
      paymentStatus,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    let filter: any = {};

    // Customer filter
    if (customer) {
      filter.customer = new Types.ObjectId(customer);
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Payment status filter
    if (paymentStatus) {
      filter['payment.status'] = paymentStatus;
    }

    // Date range filter
    if (startDate || endDate) {
      filter['dates.issueDate'] = {};
      if (startDate) filter['dates.issueDate'].$gte = new Date(startDate);
      if (endDate) filter['dates.issueDate'].$lte = new Date(endDate);
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Sorting
    const sort: any = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.invoiceModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate([
        { path: 'sale', select: 'transactionNumber status' },
        { path: 'customer', select: 'firstName lastName email phone' },
        { path: 'issuedBy', select: 'username firstName lastName' },
      ])
      .exec();
  }

  async findOne(id: string): Promise<Invoice> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid invoice ID');
    }

    const invoice = await this.invoiceModel
      .findById(id)
      .populate([
        { path: 'sale', select: 'transactionNumber status' },
        { path: 'customer', select: 'firstName lastName email phone address' },
        { path: 'issuedBy', select: 'username firstName lastName' },
      ])
      .exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice> {
    const invoice = await this.invoiceModel
      .findOne({ invoiceNumber })
      .populate([
        { path: 'sale', select: 'transactionNumber status' },
        { path: 'customer', select: 'firstName lastName email phone address' },
        { path: 'issuedBy', select: 'username firstName lastName' },
      ])
      .exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto, userId: string): Promise<Invoice> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid invoice ID');
    }

    const updatedInvoice = await this.invoiceModel
      .findByIdAndUpdate(
        id,
        {
          ...updateInvoiceDto,
          updatedBy: new Types.ObjectId(userId),
        },
        { new: true, runValidators: true }
      )
      .populate([
        { path: 'sale', select: 'transactionNumber status' },
        { path: 'customer', select: 'firstName lastName email phone' },
        { path: 'issuedBy', select: 'username firstName lastName' },
      ])
      .exec();

    if (!updatedInvoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Regenerate PDF if invoice was updated
    await this.generateAndSavePDF(updatedInvoice);

    return updatedInvoice;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid invoice ID');
    }

    const invoice = await this.invoiceModel.findById(id).exec();
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Delete PDF file if exists
    if (invoice.pdfPath && fs.existsSync(invoice.pdfPath)) {
      fs.unlinkSync(invoice.pdfPath);
    }

    const result = await this.invoiceModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Invoice not found');
    }
  }

  async generatePDF(id: string): Promise<string> {
    const invoice = await this.findOne(id);
    
    // Generate new PDF
    const pdfPath = await this.generateAndSavePDF(invoice as InvoiceDocument);
    
    return pdfPath;
  }

  async downloadPDF(id: string): Promise<{ path: string; filename: string }> {
    const invoice = await this.findOne(id);
    
    if (!invoice.pdfPath || !fs.existsSync(invoice.pdfPath)) {
      // Generate PDF if it doesn't exist
      await this.generateAndSavePDF(invoice as InvoiceDocument);
    }

    const filename = `invoice-${invoice.invoiceNumber}.pdf`;
    
    return {
      path: invoice.pdfPath,
      filename,
    };
  }

  async updatePaymentStatus(id: string, paymentStatus: string, paidAmount?: number): Promise<Invoice> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid invoice ID');
    }

    const validStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(paymentStatus)) {
      throw new BadRequestException('Invalid payment status');
    }

    const updateData: any = {
      'payment.status': paymentStatus,
    };

    if (paymentStatus === 'paid' && paidAmount) {
      updateData['payment.paidAmount'] = paidAmount;
      updateData['payment.paidDate'] = new Date();
    }

    const invoice = await this.invoiceModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate([
        { path: 'sale', select: 'transactionNumber status' },
        { path: 'customer', select: 'firstName lastName email phone' },
        { path: 'issuedBy', select: 'username firstName lastName' },
      ])
      .exec();

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async getInvoiceStats(): Promise<any> {
    const [total, draft, pending, paid, overdue] = await Promise.all([
      this.invoiceModel.countDocuments(),
      this.invoiceModel.countDocuments({ status: 'draft' }),
      this.invoiceModel.countDocuments({ 'payment.status': 'pending' }),
      this.invoiceModel.countDocuments({ 'payment.status': 'paid' }),
      this.invoiceModel.countDocuments({ 'payment.status': 'overdue' }),
    ]);

    const totalAmount = await this.invoiceModel.aggregate([
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]);

    const paidAmount = await this.invoiceModel.aggregate([
      { $match: { 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$payment.paidAmount' } } }
    ]);

    return {
      total,
      draft,
      pending,
      paid,
      overdue,
      totalAmount: totalAmount[0]?.total || 0,
      paidAmount: paidAmount[0]?.total || 0,
      outstandingAmount: (totalAmount[0]?.total || 0) - (paidAmount[0]?.total || 0),
    };
  }

  private async generateAndSavePDF(invoice: InvoiceDocument): Promise<string> {
    try {
      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(process.cwd(), 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      // Generate PDF filename
      const filename = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
      const pdfPath = path.join(invoicesDir, filename);

      // Generate PDF
      await this.pdfGeneratorService.generateInvoicePDF(invoice, pdfPath);

      // Update invoice with PDF path
      await this.invoiceModel.findByIdAndUpdate(invoice._id, {
        pdfPath,
        status: 'generated',
      });

      return pdfPath;
    } catch (error) {
      throw new BadRequestException(`Failed to generate PDF: ${error.message}`);
    }
  }
}
