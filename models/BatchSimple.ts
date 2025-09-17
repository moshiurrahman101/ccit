import mongoose, { Document, Schema } from 'mongoose';

export interface IBatchSimple extends Document {
  name: string;
  description?: string;
  // Course/Batch Information
  courseType: 'batch' | 'course';
  duration: number; // Duration in specified unit
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  // Financial Information
  fee: number;
  currency: string;
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
  };
  // Additional Information
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
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
    enum: ['batch', 'course'],
    default: 'batch'
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
  // Financial Information
  fee: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'BDT'
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
    bio: String
  },
  // Additional Information
  tags: [String],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
BatchSimpleSchema.index({ name: 1 });
BatchSimpleSchema.index({ status: 1 });
BatchSimpleSchema.index({ isActive: 1 });
BatchSimpleSchema.index({ courseType: 1, isActive: 1 });
BatchSimpleSchema.index({ fee: 1 });
BatchSimpleSchema.index({ level: 1 });

const BatchSimple = mongoose.models.BatchSimple || mongoose.model<IBatchSimple>('BatchSimple', BatchSimpleSchema);

export default BatchSimple;
