import mongoose, { Document, Schema } from 'mongoose';

export interface IBatch extends Document {
  name: string;
  description?: string;
  course: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  schedule: {
    day: string;
    time: string;
    duration: number; // in minutes
  }[];
  maxStudents: number;
  currentStudents: number;
  isOnline: boolean;
  meetingLink?: string; // for online batches
  venue?: string; // for offline batches
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  schedule: [{
    day: {
      type: String,
      enum: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      required: true
    },
    time: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 120 // 2 hours default
    }
  }],
  maxStudents: {
    type: Number,
    default: 30
  },
  currentStudents: {
    type: Number,
    default: 0
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  meetingLink: {
    type: String,
    trim: true
  },
  venue: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

// Index for efficient queries
BatchSchema.index({ course: 1, status: 1 });
BatchSchema.index({ mentor: 1, status: 1 });
BatchSchema.index({ startDate: 1, endDate: 1 });

export const Batch = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);
