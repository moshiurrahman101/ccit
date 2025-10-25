import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview {
  studentId: Types.ObjectId; // Reference to User collection
  batchId?: Types.ObjectId; // Reference to Batch (optional)
  name: string; // Student name
  email: string; // Student email
  avatar?: string; // Student avatar URL
  role: string; // Student's current role/position
  company?: string; // Company name (optional)
  rating: number; // 1-5 stars
  review: string; // Review text/content
  earning?: string; // Monthly earning or achievement
  isSuccessStory: boolean; // Whether this is a success story
  isApproved: boolean; // Admin approval status
  isFeatured: boolean; // Featured on homepage
  tags?: string[]; // Tags for categorization
  
  // Additional success story info
  beforeAfter?: {
    before: string;
    after: string;
  };
  
  // Metadata
  createdBy: Types.ObjectId; // User who created this (student or admin)
  approvedBy?: Types.ObjectId; // Admin who approved
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewDocument extends IReview, Document {
  _id: Types.ObjectId;
}

const reviewSchema = new Schema<ReviewDocument>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  batchId: {
    type: Schema.Types.ObjectId,
    ref: 'Batch',
    index: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    maxlength: 200
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    required: true,
    maxlength: 100
  },
  company: {
    type: String,
    maxlength: 100
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    default: 5
  },
  review: {
    type: String,
    required: true,
    maxlength: 1000
  },
  earning: {
    type: String,
    maxlength: 50
  },
  isSuccessStory: {
    type: Boolean,
    default: false,
    index: true
  },
  isApproved: {
    type: Boolean,
    default: false,
    index: true
  },
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  beforeAfter: {
    before: {
      type: String,
      maxlength: 500
    },
    after: {
      type: String,
      maxlength: 500
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
reviewSchema.index({ isApproved: 1, isFeatured: 1 });
reviewSchema.index({ isSuccessStory: 1, isApproved: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ studentId: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model<ReviewDocument>('Review', reviewSchema);
