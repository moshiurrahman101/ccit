import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  shortDescription?: string;
  coverPhoto?: string;
  courseType: 'online' | 'offline' | 'both';
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  mentors: mongoose.Types.ObjectId[]; // Multiple mentors can be assigned
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
  maxStudents: number;
  marketing: {
    slug: string;
    metaDescription?: string;
    tags: string[];
  };
  category: 'web-development' | 'data-science' | 'mobile-development' | 'design' | 'marketing' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'bengali' | 'english';
  courseCode: string; // Short code for batch generation (e.g., "GDI")
  courseShortcut: string; // Short name (e.g., "Graphics Design with Illustrator")
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  coverPhoto: {
    type: String,
    trim: true
  },
  courseType: {
    type: String,
    enum: ['online', 'offline', 'both'],
    required: [true, 'Course type is required'],
    default: 'both'
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
  mentors: [{
    type: Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  }],
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
  maxStudents: {
    type: Number,
    default: 30,
    min: [1, 'Max students must be at least 1']
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
  category: {
    type: String,
    required: true,
    enum: ['web-development', 'data-science', 'mobile-development', 'design', 'marketing', 'other']
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  language: {
    type: String,
    default: 'bengali',
    enum: ['bengali', 'english']
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true,
    uppercase: true,
    maxlength: [10, 'Course code cannot exceed 10 characters']
  },
  courseShortcut: {
    type: String,
    required: [true, 'Course shortcut is required'],
    trim: true,
    maxlength: [50, 'Course shortcut cannot exceed 50 characters']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
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
CourseSchema.pre('save', function(next) {
  // Generate slug from title if not provided
  if (this.isModified('title') && !this.marketing.slug) {
    this.marketing.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Calculate discount percentage if discount price is provided
  if (this.discountPrice && this.regularPrice > 0) {
    this.discountPercentage = Math.round(((this.regularPrice - this.discountPrice) / this.regularPrice) * 100);
  }

  next();
});

// Indexes for efficient queries
CourseSchema.index({ title: 1 }, { unique: true });
CourseSchema.index({ 'marketing.slug': 1 }, { unique: true });
CourseSchema.index({ courseCode: 1 }, { unique: true });
CourseSchema.index({ status: 1 });
CourseSchema.index({ isActive: 1 });
CourseSchema.index({ mentors: 1 });
CourseSchema.index({ category: 1, level: 1 });
CourseSchema.index({ 'marketing.tags': 1 });

export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;
