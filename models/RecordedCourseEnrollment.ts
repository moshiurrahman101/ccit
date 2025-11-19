import mongoose, { Document, Schema } from 'mongoose';

export interface IRecordedCourseEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  status: 'pending' | 'active' | 'completed' | 'expired' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
  amount: number;
  invoiceId?: mongoose.Types.ObjectId;
  progress: {
    videoId: string; // YouTube video ID
    watchedDuration: number; // in seconds
    completed: boolean;
    lastWatchedAt: Date;
  }[];
  overallProgress: number; // percentage (0-100)
  lastAccessed: Date;
  accessExpiresAt?: Date; // Optional expiration date
  createdAt: Date;
  updatedAt: Date;
}

const RecordedCourseEnrollmentSchema = new Schema<IRecordedCourseEnrollment>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'RecordedCourse',
    required: true,
    index: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'expired', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true
  },
  progress: [{
    videoId: {
      type: String,
      required: true
    },
    watchedDuration: {
      type: Number,
      default: 0,
      min: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now
    }
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  accessExpiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
RecordedCourseEnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Index for efficient queries
RecordedCourseEnrollmentSchema.index({ status: 1, paymentStatus: 1 });
RecordedCourseEnrollmentSchema.index({ student: 1, status: 1 });

// Method to update progress
RecordedCourseEnrollmentSchema.methods.updateVideoProgress = function(videoId: string, watchedDuration: number, completed: boolean) {
  const progressIndex = this.progress.findIndex((p: any) => p.videoId === videoId);
  
  if (progressIndex >= 0) {
    this.progress[progressIndex].watchedDuration = watchedDuration;
    this.progress[progressIndex].completed = completed;
    this.progress[progressIndex].lastWatchedAt = new Date();
  } else {
    this.progress.push({
      videoId,
      watchedDuration,
      completed,
      lastWatchedAt: new Date()
    });
  }
  
  // Calculate overall progress
  const totalVideos = this.populated('course')?.videos?.length || 0;
  if (totalVideos > 0) {
    const completedVideos = this.progress.filter((p: any) => p.completed).length;
    this.overallProgress = Math.round((completedVideos / totalVideos) * 100);
  }
  
  this.lastAccessed = new Date();
  return this.save();
};

export const RecordedCourseEnrollment = mongoose.models.RecordedCourseEnrollment || 
  mongoose.model<IRecordedCourseEnrollment>('RecordedCourseEnrollment', RecordedCourseEnrollmentSchema);
export default RecordedCourseEnrollment;

