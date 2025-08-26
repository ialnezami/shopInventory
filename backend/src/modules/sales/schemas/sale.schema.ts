import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SaleDocument = Sale & Document;

@Schema({ timestamps: true })
export class SaleItem {
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
}

@Schema({ timestamps: true })
export class Sale {
  @Prop({ required: true, unique: true })
  transactionNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customer: Types.ObjectId;

  @Prop([SaleItem])
  items: SaleItem[];

  @Prop({
    type: {
      method: { type: String, required: true, enum: ['cash', 'card', 'digital', 'bank_transfer'] },
      amount: { type: Number, required: true, min: 0 },
      status: { type: String, required: true, enum: ['pending', 'completed', 'failed', 'refunded'] },
      reference: String,
      cardLast4: String,
      cardBrand: String
    },
    required: true
  })
  payment: {
    method: string;
    amount: number;
    status: string;
    reference?: string;
    cardLast4?: string;
    cardBrand?: string;
  };

  @Prop({
    type: {
      subtotal: { type: Number, required: true, min: 0 },
      tax: { type: Number, required: true, min: 0 },
      discount: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 }
    },
    required: true
  })
  totals: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
  };

  @Prop({ required: true, enum: ['pending', 'completed', 'cancelled', 'refunded'] })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  staff: Types.ObjectId;

  @Prop()
  notes: string;

  @Prop()
  invoiceNumber: string;

  @Prop({ default: false })
  isInvoiceGenerated: boolean;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);

// Indexes for better query performance
SaleSchema.index({ transactionNumber: 1 });
SaleSchema.index({ customer: 1 });
SaleSchema.index({ staff: 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ createdAt: -1 });
SaleSchema.index({ 'payment.status': 1 });
SaleSchema.index({ 'totals.total': 1 });
