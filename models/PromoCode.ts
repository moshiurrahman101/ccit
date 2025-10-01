import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: number; // Percentage (0-100) or fixed amount
  currency: string;
  
  // Usage Limits
  maxUses: number;
  usedCount: number;
  maxUsesPerUser: number;
  
  // Validity
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  
  // Applicable Items
  applicableBatches: string[]; // Batch IDs
  applicableCourseTypes: ('batch' | 'course')[];
  minAmount: number; // Minimum invoice amount to apply
  
  // Usage Tracking
  usedBy: {
    userId: string;
    invoiceId: string;
    usedAt: Date;
    discountAmount: number;
  }[];
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  
  // Usage Limits
  maxUses: {
    type: Number,
    default: 100,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxUsesPerUser: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Validity
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Applicable Items
  applicableBatches: [{
    type: String,
    ref: 'Batch'
  }],
  applicableCourseTypes: [{
    type: String,
    enum: ['batch', 'course']
  }],
  minAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Usage Tracking
  usedBy: [{
    userId: {
      type: String,
      required: true,
      ref: 'User'
    },
    invoiceId: {
      type: String,
      required: true,
      ref: 'Invoice'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
// Note: code already has unique index, no need to add another
PromoCodeSchema.index({ isActive: 1 });
PromoCodeSchema.index({ validFrom: 1, validUntil: 1 });
PromoCodeSchema.index({ applicableBatches: 1 });
PromoCodeSchema.index({ createdAt: -1 });

const PromoCode = mongoose.models.PromoCode || mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);

export default PromoCode;
