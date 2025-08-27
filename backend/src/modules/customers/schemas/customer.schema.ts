import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerDocument = Customer & Document;

@Schema({ timestamps: true })
export class Customer {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop()
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Prop({
    type: {
      type: { type: String, enum: ['individual', 'business'], default: 'individual' },
      companyName: String,
      taxId: String,
      website: String
    }
  })
  businessInfo: {
    type: string;
    companyName?: string;
    taxId?: string;
    website?: string;
  };

  @Prop({
    type: {
      totalSpent: { type: Number, default: 0 },
      totalOrders: { type: Number, default: 0 },
      lastPurchaseDate: Date,
      averageOrderValue: { type: Number, default: 0 }
    }
  })
  statistics: {
    totalSpent: number;
    totalOrders: number;
    lastPurchaseDate?: Date;
    averageOrderValue: number;
  };

  @Prop({
    type: {
      loyaltyPoints: { type: Number, default: 0 },
      tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
      memberSince: { type: Date, default: Date.now }
    }
  })
  loyalty: {
    loyaltyPoints: number;
    tier: string;
    memberSince: Date;
  };

  @Prop({
    type: {
      preferences: [String],
      notes: String,
      tags: [String]
    }
  })
  metadata: {
    preferences: string[];
    notes?: string;
    tags: string[];
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

// Indexes for better query performance
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ lastName: 1, firstName: 1 });
CustomerSchema.index({ 'loyalty.tier': 1 });
CustomerSchema.index({ 'statistics.totalSpent': -1 });
CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ isActive: 1 });

// Virtual for full name
CustomerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
CustomerSchema.set('toJSON', { virtuals: true });
CustomerSchema.set('toObject', { virtuals: true });
