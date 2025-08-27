import { Injectable, Logger } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { Invoice, InvoiceDocument } from '../schemas/invoice.schema';

@Injectable()
export class PdfGeneratorService {
  private readonly logger = new Logger(PdfGeneratorService.className);
  static readonly className = 'PdfGeneratorService';

  async generateInvoicePDF(invoice: InvoiceDocument, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        // Create a new PDF document
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          autoFirstPage: true,
        });

        // Create write stream
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        // Add company header
        this.addCompanyHeader(doc, invoice.company);

        // Add invoice details
        this.addInvoiceDetails(doc, invoice);

        // Add customer information
        if (invoice.customer) {
          this.addCustomerInfo(doc, invoice.customer);
        }

        // Add items table
        this.addItemsTable(doc, invoice.items);

        // Add totals
        this.addTotals(doc, invoice.totals);

        // Add payment information
        this.addPaymentInfo(doc, invoice.payment);

        // Add terms and notes
        this.addTermsAndNotes(doc, invoice.terms, invoice.notes);

        // Add footer
        this.addFooter(doc, invoice.company);

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          this.logger.log(`✅ Invoice PDF generated successfully: ${outputPath}`);
          resolve(outputPath);
        });

        stream.on('error', (error) => {
          this.logger.error(`❌ Error generating PDF: ${error.message}`);
          reject(error);
        });
      } catch (error) {
        this.logger.error(`❌ Error in PDF generation: ${error.message}`);
        reject(error);
      }
    });
  }

  private addCompanyHeader(doc: PDFKit.PDFDocument, company: any): void {
    // Company logo (if exists)
    if (company.logo && fs.existsSync(company.logo)) {
      try {
        doc.image(company.logo, 50, 50, { width: 80, height: 60 });
        doc.moveDown(0.5);
      } catch (error) {
        this.logger.warn(`⚠️ Could not load company logo: ${error.message}`);
      }
    }

    // Company name
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(company.companyName, { align: 'right' });

    // Company address
    doc.fontSize(10)
       .font('Helvetica')
       .text(company.address.street, { align: 'right' })
       .text(`${company.address.city}, ${company.address.state} ${company.address.zipCode}`, { align: 'right' })
       .text(company.address.country, { align: 'right' });

    // Company contact
    doc.moveDown(0.5)
       .text(`Phone: ${company.phone}`, { align: 'right' })
       .text(`Email: ${company.email}`, { align: 'right' });

    if (company.website) {
      doc.text(`Website: ${company.website}`, { align: 'right' });
    }

    doc.moveDown(2);
  }

  private addInvoiceDetails(doc: PDFKit.PDFDocument, invoice: InvoiceDocument): void {
    // Invoice title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('INVOICE', { align: 'center' });

    doc.moveDown(1);

    // Invoice information
    const startY = doc.y;
    doc.fontSize(12)
       .font('Helvetica-Bold');

    // Left column
    doc.text('Invoice Number:', 50, startY)
       .text('Issue Date:', 50, startY + 20)
       .text('Due Date:', 50, startY + 40)
       .text('Status:', 50, startY + 60);

    // Right column
    doc.font('Helvetica')
       .text(invoice.invoiceNumber, 200, startY)
       .text(new Date(invoice.dates.issueDate).toLocaleDateString(), 200, startY + 20)
       .text(new Date(invoice.dates.dueDate).toLocaleDateString(), 200, startY + 40)
       .text(invoice.status.toUpperCase(), 200, startY + 60);

    doc.moveDown(3);
  }

  private addCustomerInfo(doc: PDFKit.PDFDocument, customer: any): void {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Bill To:', 50);

    doc.fontSize(10)
       .font('Helvetica')
       .text(`${customer.firstName} ${customer.lastName}`, 50)
       .text(customer.email, 50)
       .text(customer.phone, 50);

    if (customer.address) {
      doc.text(customer.address.street, 50)
         .text(`${customer.address.city}, ${customer.address.state} ${customer.address.zipCode}`, 50)
         .text(customer.address.country, 50);
    }

    doc.moveDown(2);
  }

  private addItemsTable(doc: PDFKit.PDFDocument, items: any[]): void {
    // Table header
    const startY = doc.y;
    const colWidths = [50, 200, 80, 80, 80, 80];
    const headers = ['#', 'Item', 'Qty', 'Price', 'Discount', 'Total'];

    doc.fontSize(10)
       .font('Helvetica-Bold');

    let currentY = startY;
    headers.forEach((header, index) => {
      doc.text(header, 50 + colWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY);
    });

    doc.moveDown(0.5);

    // Table rows
    doc.font('Helvetica');
    items.forEach((item, index) => {
      currentY = doc.y;
      
      // Row number
      doc.text((index + 1).toString(), 50, currentY);
      
      // Item name
      doc.text(item.description || 'Product', 100, currentY);
      
      // Quantity
      doc.text(item.quantity.toString(), 300, currentY);
      
      // Unit price
      doc.text(`$${item.unitPrice.toFixed(2)}`, 380, currentY);
      
      // Discount
      doc.text(`$${item.discount.toFixed(2)}`, 460, currentY);
      
      // Total
      doc.text(`$${item.total.toFixed(2)}`, 540, currentY);

      doc.moveDown(0.3);
    });

    doc.moveDown(1);
  }

  private addTotals(doc: PDFKit.PDFDocument, totals: any): void {
    const startY = doc.y;
    const rightAlign = 500;

    doc.fontSize(10)
       .font('Helvetica');

    // Subtotal
    doc.text('Subtotal:', rightAlign, startY)
       .text(`$${totals.subtotal.toFixed(2)}`, rightAlign + 100, startY);

    // Tax
    doc.text('Tax:', rightAlign, startY + 20)
       .text(`$${totals.tax.toFixed(2)}`, rightAlign + 100, startY + 20);

    // Discount
    if (totals.discount > 0) {
      doc.text('Discount:', rightAlign, startY + 40)
         .text(`-$${totals.discount.toFixed(2)}`, rightAlign + 100, startY + 40);
    }

    // Total
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Total:', rightAlign, startY + 60)
       .text(`$${totals.total.toFixed(2)}`, rightAlign + 100, startY + 60);

    doc.moveDown(2);
  }

  private addPaymentInfo(doc: PDFKit.PDFDocument, payment: any): void {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('Payment Information:', 50);

    doc.fontSize(10)
       .font('Helvetica')
       .text(`Method: ${payment.method.toUpperCase()}`, 50)
       .text(`Status: ${payment.status.toUpperCase()}`, 50);

    if (payment.reference) {
      doc.text(`Reference: ${payment.reference}`, 50);
    }

    if (payment.paidAmount > 0) {
      doc.text(`Paid Amount: $${payment.paidAmount.toFixed(2)}`, 50);
      doc.text(`Paid Date: ${new Date(payment.paidDate).toLocaleDateString()}`, 50);
    }

    doc.moveDown(2);
  }

  private addTermsAndNotes(doc: PDFKit.PDFDocument, terms: string, notes: string): void {
    if (terms) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Terms:', 50);

      doc.fontSize(10)
         .font('Helvetica')
         .text(terms, 50);

      doc.moveDown(1);
    }

    if (notes) {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Notes:', 50);

      doc.fontSize(10)
         .font('Helvetica')
         .text(notes, 50);

      doc.moveDown(1);
    }
  }

  private addFooter(doc: PDFKit.PDFDocument, company: any): void {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;

    doc.fontSize(8)
       .font('Helvetica')
       .text('Thank you for your business!', { align: 'center' })
       .moveDown(0.5)
       .text(`${company.companyName} - ${company.address.city}, ${company.address.state}`, { align: 'center' })
       .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
  }

  async generateInvoiceNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    
    return `INV-${year}${month}-${Date.now().toString().slice(-6)}`;
  }
}
