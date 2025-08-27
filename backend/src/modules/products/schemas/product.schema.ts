import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  sku: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  subcategory: string;

  @Prop({
    type: {
      cost: { type: Number, required: true },
      selling: { type: Number, required: true },
      currency: { type: String, default: 'USD' }
    },
    required: true
  })
  price: {
    cost: number;
    selling: number;
    currency: string;
  };

  @Prop({
    type: {
      quantity: { type: Number, default: 0 },
      minStock: { type: Number, default: 10 },
      location: { type: String, default: 'Main Store' }
    },
    required: true
  })
  inventory: {
    quantity: number;
    minStock: number;
    location: string;
  };

  @Prop({ type: Types.ObjectId, ref: 'Supplier' })
  supplier: Types.ObjectId;

  @Prop([{
    name: String,
    value: String,
    priceModifier: Number
  }])
  variants: Array<{
    name: string;
    value: string;
    priceModifier: number;
  }>;

  @Prop([String])
  images: string[];

  @Prop()
  weight: number;

  @Prop({
    type: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    }
  })
  dimensions: {
    length: number;
    width: number;
    height: number;
  };

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ 'inventory.quantity': 1 });
ProductSchema.index({ supplier: 1 });
