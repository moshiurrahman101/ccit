import mongoose, { Document, Schema } from 'mongoose';

export interface IBatchSimple extends Document {
  name: string;
  description?: string;
  // Course/Batch Information
  courseType: 'online' | 'offline';
  duration: number; // Duration in specified unit
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  // Visual Information
  coverPhoto?: string; // Cloudinary URL
  // Financial Information
  regularPrice: number; // Regular price
  discountPrice?: number; // Discounted price
  currency: string;
  discountPercentage?: number; // Calculated discount percentage
  // Schedule Information
  startDate: Date;
  endDate: Date;
  // Capacity Information
  maxStudents: number;
  currentStudents: number;
  // Prerequisites
  prerequisites: string[];
  // Course Content
  modules: {
    title: string;
    description: string;
    duration: number; // in hours
    order: number;
  }[];
  // Status and Management
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  isMandatory: boolean; // Batches are mandatory, courses are optional
  // Instructor Information
  instructor: {
    name: string;
    email: string;
    phone: string;
    bio: string;
    avatar?: string; // Instructor profile picture
  };
  // Additional Information
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  // Course Features
  features: string[]; // Course features like "Certificate", "Lifetime Access", etc.
  requirements: string[]; // System requirements or prerequisites
  whatYouWillLearn: string[]; // Learning outcomes
  // SEO and Marketing
  slug: string; // URL-friendly name
  metaDescription?: string; // SEO description
  // Additional Information
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

const BatchSimpleSchema = new Schema<IBatchSimple>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  // Course/Batch Information
  courseType: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  durationUnit: {
    type: String,
    enum: ['days', 'weeks', 'months', 'years'],
    default: 'months'
  },
  // Visual Information
  coverPhoto: {
    type: String,
    trim: true
  },
  // Financial Information
  regularPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  discountPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  // Schedule Information
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  // Capacity Information
  maxStudents: {
    type: Number,
    default: 30,
    min: 1
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  // Prerequisites
  prerequisites: [{
    type: String
  }],
  // Course Content
  modules: [{
    title: String,
    description: String,
    duration: Number, // in hours
    order: Number
  }],
  // Status and Management
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isMandatory: {
    type: Boolean,
    default: true // Batches are mandatory, courses are optional
  },
  // Instructor Information
  instructor: {
    name: String,
    email: String,
    phone: String,
    bio: String,
    avatar: String
  },
  // Additional Information
  tags: [String],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  // Course Features
  features: [String], // Course features like "Certificate", "Lifetime Access", etc.
  requirements: [String], // System requirements or prerequisites
  whatYouWillLearn: [String], // Learning outcomes
  // SEO and Marketing
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug
BatchSimpleSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for efficient queries
BatchSimpleSchema.index({ name: 1 });
BatchSimpleSchema.index({ slug: 1 });
BatchSimpleSchema.index({ status: 1 });
BatchSimpleSchema.index({ isActive: 1 });
BatchSimpleSchema.index({ courseType: 1, isActive: 1 });
BatchSimpleSchema.index({ regularPrice: 1 });
BatchSimpleSchema.index({ level: 1 });

const BatchSimple = mongoose.models.BatchSimple || mongoose.model<IBatchSimple>('BatchSimple', BatchSimpleSchema);

export default BatchSimple;
