import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvoiceDocument = Invoice & Document;

@Schema({ timestamps: true })
export class InvoiceItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop({ default: 0, min: 0 })
  discount: number;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop()
  description: string;
}

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true })
  invoiceNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Sale', required: true })
  sale: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customer: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  issuedBy: Types.ObjectId;

  @Prop([InvoiceItem])
  items: InvoiceItem[];

  @Prop({
    type: {
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      discount: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
      taxRate: { type: Number, default: 0.1 }
    },
    required: true
  })
  totals: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    taxRate: number;
  };

  @Prop({
    type: {
      method: { type: String, required: true, enum: ['cash', 'card', 'digital', 'bank_transfer'] },
      status: { type: String, required: true, enum: ['pending', 'paid', 'overdue', 'cancelled'] },
      paidAmount: { type: Number, default: 0 },
      paidDate: Date,
      reference: String
    },
    required: true
  })
  payment: {
    method: string;
    status: string;
    paidAmount: number;
    paidDate?: Date;
    reference?: string;
  };

  @Prop({
    type: {
      dueDate: { type: Date, required: true },
      issueDate: { type: Date, default: Date.now },
      terms: { type: String, default: 'Net 30' }
    },
    required: true
  })
  dates: {
    dueDate: Date;
    issueDate: Date;
    terms: string;
  };

  @Prop({
    type: {
      companyName: { type: String, required: true },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      phone: String,
      email: String,
      website: String,
      logo: String
    },
    required: true
  })
  company: {
    companyName: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    phone: string;
    email: string;
    website: string;
    logo: string;
  };

  @Prop({
    type: {
      billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      },
      shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    }
  })
  addresses: {
    billingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };

  @Prop()
  notes: string;

  @Prop()
  terms: string;

  @Prop({ default: 'draft' })
  status: string;

  @Prop()
  pdfPath: string;

  @Prop({ default: false })
  isEmailSent: boolean;

  @Prop()
  emailSentAt: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

// Indexes for better query performance
InvoiceSchema.index({ invoiceNumber: 1 });
InvoiceSchema.index({ sale: 1 });
InvoiceSchema.index({ customer: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ 'payment.status': 1 });
InvoiceSchema.index({ 'dates.dueDate': 1 });
InvoiceSchema.index({ createdAt: -1 });

// Virtual for invoice status
InvoiceSchema.virtual('isOverdue').get(function() {
  if (this.payment.status === 'paid') return false;
  return new Date() > this.dates.dueDate;
});

// Ensure virtual fields are serialized
InvoiceSchema.set('toJSON', { virtuals: true });
InvoiceSchema.set('toObject', { virtuals: true });
