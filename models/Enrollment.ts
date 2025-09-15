import mongoose, { Document, Schema } from 'mongoose';
import { Enrollment as IEnrollment, PaymentMethod, EnrollmentStatus } from '@/types';

export interface EnrollmentDocument extends Omit<IEnrollment, '_id'>, Document {}

const enrollmentSchema = new Schema<EnrollmentDocument>({
  studentId: {
    type: String,
    required: [true, 'শিক্ষার্থী প্রয়োজন']
  },
  courseId: {
    type: String,
    required: [true, 'কোর্স প্রয়োজন']
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['bkash', 'nagad'],
      message: 'ভুল পেমেন্ট পদ্ধতি'
    },
    required: [true, 'পেমেন্ট পদ্ধতি প্রয়োজন']
  },
  senderNumber: {
    type: String,
    required: [true, 'প্রেরকের নম্বর প্রয়োজন'],
    trim: true
  },
  transactionId: {
    type: String,
    required: [true, 'লেনদেনের আইডি প্রয়োজন'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'ভুল নিবন্ধন অবস্থা'
    },
    default: 'pending'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: String
  }
}, {
  timestamps: true
});

// Note: IDs are now strings, not ObjectIds, so no populate needed

// Prevent duplicate enrollments
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model<EnrollmentDocument>('Enrollment', enrollmentSchema);
