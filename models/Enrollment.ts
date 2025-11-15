import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId; // for offline students
  enrollmentDate: Date;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
  paymentMethod?: 'bkash' | 'nagad' | 'rocket' | 'cash';
  transactionId?: string;
  senderNumber?: string;
  amount: number;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  completedAt?: Date;
  progress: number; // percentage
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  batch: {
    type: Schema.Types.ObjectId,
    ref: 'Batch'
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'dropped'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partial', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'cash']
  },
  transactionId: {
    type: String,
    trim: true
  },
  senderNumber: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  completedAt: Date,
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
EnrollmentSchema.index({ student: 1, batch: 1 }, { unique: true, sparse: true });

// Index for efficient queries
EnrollmentSchema.index({ status: 1, paymentStatus: 1 });
EnrollmentSchema.index({ approvedBy: 1, approvedAt: 1 });

export const Enrollment = mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);