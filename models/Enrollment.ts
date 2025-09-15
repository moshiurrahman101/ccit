import mongoose, { Document, Schema } from 'mongoose';
import { Enrollment as IEnrollment, PaymentMethod, EnrollmentStatus } from '@/types';

export interface EnrollmentDocument extends IEnrollment, Document {}

const enrollmentSchema = new Schema<EnrollmentDocument>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'শিক্ষার্থী প্রয়োজন']
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
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
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Populate student, course, and approvedBy fields
enrollmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'studentId',
    select: 'name email phone'
  }).populate({
    path: 'courseId',
    select: 'title price mentorId'
  }).populate({
    path: 'approvedBy',
    select: 'name email'
  });
  next();
});

// Prevent duplicate enrollments
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model<EnrollmentDocument>('Enrollment', enrollmentSchema);
