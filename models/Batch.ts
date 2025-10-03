import mongoose, { Document, Schema } from 'mongoose';
import Course from './Course';

export interface IBatch extends Document {
  courseId: mongoose.Types.ObjectId; // Reference to Course
  batchCode: string; // Auto-generated: CourseCode + Year + Serial (e.g., GDI2501)
  name: string; // Auto-generated from course + batch number
  description?: string; // Optional batch-specific description
  courseType: 'online' | 'offline';
  mentorId: mongoose.Types.ObjectId; // Primary mentor for this batch
  additionalMentors?: mongoose.Types.ObjectId[]; // Additional mentors if needed
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  currentStudents: number;
  regularPrice?: number; // Batch-specific regular price (overrides course price)
  discountPrice?: number; // Batch-specific discount price
  discountPercentage?: number; // Calculated discount percentage
  status: 'draft' | 'published' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  marketing: {
    slug: string;
    metaDescription?: string;
    tags: string[];
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  batchCode: {
    type: String,
    required: [true, 'Batch code is required'],
    trim: true,
    uppercase: true,
    unique: true,
    maxlength: [20, 'Batch code cannot exceed 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Batch name is required'],
    trim: true,
    maxlength: [100, 'Batch name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  courseType: {
    type: String,
    enum: ['online', 'offline'],
    required: [true, 'Course type is required'],
    default: 'online'
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor',
    required: [true, 'Primary mentor is required']
  },
  additionalMentors: [{
    type: Schema.Types.ObjectId,
    ref: 'Mentor'
  }],
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
  regularPrice: {
    type: Number,
    min: [0, 'Regular price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
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
  marketing: {
    slug: {
      type: String,
      required: [true, 'Marketing slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    tags: [{
      type: String,
      trim: true
    }]
  },
  createdBy: {
    type: String,
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate batch code and validate data
BatchSchema.pre('save', async function(next) {
  console.log('=== PRE-SAVE MIDDLEWARE TRIGGERED ===');
  try {
    console.log('Pre-save middleware running for batch:', {
      isNew: this.isNew,
      batchCode: this.batchCode,
      courseId: this.courseId
    });
    
    let course = null;
    
    // Generate batch code if not provided
    if (this.isNew && !this.batchCode) {
      console.log('Generating batch code...');
      course = await Course.findById(this.courseId);
      
      if (!course) {
        console.log('Course not found for courseId:', this.courseId);
        return next(new Error('Course not found'));
      }
      
      console.log('Found course:', course.courseCode, course.courseShortcut);

      // Get current year (last 2 digits)
      const currentYear = new Date().getFullYear().toString().slice(-2);
      
      // Find the next batch number for this course in this year
      const existingBatches = await mongoose.connection.db?.collection('batches').find({
        courseId: this.courseId,
        batchCode: { $regex: `^${course.courseCode}${currentYear}` }
      }).sort({ batchCode: -1 }).toArray() || [];

      let nextBatchNumber = 1;
      if (existingBatches.length > 0) {
        const lastBatchCode = existingBatches[0].batchCode;
        const lastBatchNumber = parseInt(lastBatchCode.slice(-2));
        nextBatchNumber = lastBatchNumber + 1;
      }

      // Generate batch code: CourseCode + Year + Serial (e.g., GDI2501)
      this.batchCode = `${course.courseCode}${currentYear}${nextBatchNumber.toString().padStart(2, '0')}`;
    }

    // Generate batch name if not provided
    if (this.isNew && !this.name) {
      console.log('Generating batch name...');
      if (!course) {
        course = await Course.findById(this.courseId);
      }
      
      if (course) {
        const batchNumber = this.batchCode.slice(-2);
        this.name = `${course.courseShortcut} Batch-${batchNumber}`;
        console.log('Generated batch name:', this.name);
      }
    }

    // Set default pricing from course if not provided
    if (this.isNew) {
      if (!course) {
        course = await Course.findById(this.courseId);
      }
      
      if (course) {
        // Set regular price from course if not provided
        if (this.regularPrice === undefined || this.regularPrice === null) {
          this.regularPrice = course.regularPrice;
        }
        
        // Set discount price from course if not provided
        if (this.discountPrice === undefined || this.discountPrice === null) {
          this.discountPrice = course.discountPrice;
        }
      }
    }

    // Calculate discount percentage
    if (this.regularPrice && this.discountPrice && this.discountPrice < this.regularPrice) {
      this.discountPercentage = Math.round(((this.regularPrice - this.discountPrice) / this.regularPrice) * 100);
    } else {
      this.discountPercentage = 0;
    }

    console.log('Pre-save middleware completed. Final batch data:', {
      batchCode: this.batchCode,
      name: this.name,
      regularPrice: this.regularPrice,
      discountPrice: this.discountPrice
    });

    // Validate end date is after start date
    if (this.endDate <= this.startDate) {
      return next(new Error('End date must be after start date'));
    }

    // Validate current students doesn't exceed max students
    if (this.currentStudents > this.maxStudents) {
      return next(new Error('Current students cannot exceed max students'));
    }

    // Generate marketing slug if not provided
    if (this.isNew && (!this.marketing || !this.marketing.slug)) {
      console.log('Generating marketing slug...');
      
      if (!course) {
        course = await Course.findById(this.courseId);
      }
      
      if (course) {
        // Create slug from course title and batch name
        const courseSlug = course.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim();
        
        const batchSlug = this.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .trim();
        
        let baseSlug = `${courseSlug}-${batchSlug}`;
        
        // Ensure slug is unique
        let slug = baseSlug;
        let counter = 1;
        while (await mongoose.connection.db?.collection('batches').findOne({ 'marketing.slug': slug })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        // Initialize marketing object if it doesn't exist
        if (!this.marketing) {
          this.marketing = {
            slug: '',
            tags: []
          };
        }
        
        this.marketing.slug = slug;
        console.log('Generated slug:', slug);
      }
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

// Indexes for efficient queries
BatchSchema.index({ courseId: 1 });
BatchSchema.index({ batchCode: 1 }, { unique: true });
BatchSchema.index({ name: 1 });
BatchSchema.index({ status: 1 });
BatchSchema.index({ isActive: 1 });
BatchSchema.index({ mentorId: 1 });
BatchSchema.index({ courseType: 1, isActive: 1 });
BatchSchema.index({ startDate: 1, endDate: 1 });
BatchSchema.index({ courseId: 1, status: 1 });

export const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);

// Ensure middleware is registered
if (!mongoose.models.Batch) {
  console.log('Registering Batch model with middleware');
}

export default Batch;
