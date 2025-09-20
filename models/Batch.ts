import mongoose, { Document, Schema } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  description: string;
  coverPhoto?: string;
  courseType: 'online' | 'offline';
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  mentorId: mongoose.Types.ObjectId;
  modules: {
    title: string;
    description: string;
    duration: number; // in hours
    order: number;
  }[];
  whatYouWillLearn: string[];
  requirements: string[];
  features: string[];
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  currentStudents: number;
  marketing: {
    slug: string;
    metaDescription?: string;
    tags: string[];
  };
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>({
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Batch name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Batch description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  coverPhoto: {
    type: String,
    trim: true
  },
  courseType: {
    type: String,
    enum: ['online', 'offline'],
    required: [true, 'Course type is required'],
    default: 'online'
  },
  regularPrice: {
    type: Number,
    required: [true, 'Regular price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%']
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor',
    required: [true, 'Mentor is required']
  },
  modules: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      required: true,
      min: [0.5, 'Module duration must be at least 0.5 hours']
    },
    order: {
      type: Number,
      required: true,
      min: [1, 'Order must be at least 1']
    }
  }],
  whatYouWillLearn: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1']
  },
  durationUnit: {
    type: String,
    enum: ['days', 'weeks', 'months', 'years'],
    required: [true, 'Duration unit is required'],
    default: 'months'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  maxStudents: {
    type: Number,
    default: 30,
    min: [1, 'Max students must be at least 1']
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: [0, 'Current students cannot be negative']
  },
  marketing: {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate slug and calculate discount percentage
BatchSchema.pre('save', function(next) {
  // Generate slug from name if not provided
  if (this.isModified('name') && !this.marketing.slug) {
    this.marketing.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Calculate discount percentage if discount price is provided
  if (this.discountPrice && this.regularPrice > 0) {
    this.discountPercentage = Math.round(((this.regularPrice - this.discountPrice) / this.regularPrice) * 100);
  }

  // Validate end date is after start date
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }

  // Validate current students doesn't exceed max students
  if (this.currentStudents > this.maxStudents) {
    return next(new Error('Current students cannot exceed max students'));
  }

  next();
});

// Indexes for efficient queries
// Note: name index is automatically created by unique: true
BatchSchema.index({ 'marketing.slug': 1 }, { unique: true });
BatchSchema.index({ status: 1 });
BatchSchema.index({ isActive: 1 });
BatchSchema.index({ mentorId: 1 });
BatchSchema.index({ regularPrice: 1 });
BatchSchema.index({ courseType: 1, isActive: 1 });
BatchSchema.index({ startDate: 1, endDate: 1 });
BatchSchema.index({ 'marketing.tags': 1 });

export const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);
export default Batch;
