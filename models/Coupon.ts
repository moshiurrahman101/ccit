import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number; // Percentage (0-100) or fixed amount
  minAmount?: number; // Minimum order amount to use this coupon
  maxDiscount?: number; // Maximum discount amount (for percentage coupons)
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number; // Maximum number of times this coupon can be used
  usedCount: number; // Number of times this coupon has been used
  isActive: boolean;
  applicableBatches?: mongoose.Types.ObjectId[]; // Specific batches this coupon applies to
  applicableCourses?: mongoose.Types.ObjectId[]; // Specific courses this coupon applies to
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Coupon type is required']
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Coupon value cannot be negative']
  },
  minAmount: {
    type: Number,
    min: [0, 'Minimum amount cannot be negative']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative']
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required'],
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1']
  },
  usedCount: {
    type: Number,
    default: 0,
    min: [0, 'Used count cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableBatches: [{
    type: Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  applicableCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdBy: {
    type: String,
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

// Pre-save middleware to validate coupon
CouponSchema.pre('save', function(next) {
  // Validate percentage coupons
  if (this.type === 'percentage' && this.value > 100) {
    return next(new Error('Percentage coupon value cannot exceed 100'));
  }

  // Validate dates
  if (this.validUntil <= this.validFrom) {
    return next(new Error('Valid until date must be after valid from date'));
  }

  // Validate usage limit
  if (this.usageLimit && this.usedCount > this.usageLimit) {
    return next(new Error('Used count cannot exceed usage limit'));
  }

  next();
});

// Indexes for efficient queries
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1 });
CouponSchema.index({ validFrom: 1, validUntil: 1 });
CouponSchema.index({ applicableBatches: 1 });
CouponSchema.index({ applicableCourses: 1 });

export const Coupon = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);
export default Coupon;
