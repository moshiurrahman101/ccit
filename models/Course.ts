import mongoose, { Document, Schema } from 'mongoose';
import { Course as ICourse } from '@/types';

export interface CourseDocument extends Omit<ICourse, '_id'>, Document {}

const courseSchema = new Schema<CourseDocument>({
  title: {
    type: String,
    required: [true, 'কোর্সের শিরোনাম প্রয়োজন'],
    trim: true,
    maxlength: [100, 'শিরোনাম ১০০ অক্ষরের বেশি হতে পারবে না']
  },
  description: {
    type: String,
    required: [true, 'কোর্সের বিবরণ প্রয়োজন'],
    trim: true
  },
  syllabus: {
    type: String,
    required: [true, 'সিলেবাস প্রয়োজন'],
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  learningOutcomes: [{
    type: String,
    trim: true
  }],
  duration: {
    type: Number,
    required: [true, 'কোর্সের সময়কাল প্রয়োজন'],
    min: [1, 'সময়কাল কমপক্ষে ১ ঘন্টা হতে হবে']
  },
  price: {
    type: Number,
    required: [true, 'কোর্সের মূল্য প্রয়োজন'],
    min: [0, 'মূল্য ঋণাত্মক হতে পারবে না']
  },
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'মেন্টর প্রয়োজন']
  },
  thumbnail: {
    type: String,
    default: ''
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
  maxStudents: {
    type: Number,
    default: 50
  },
  hasOfflineBatch: {
    type: Boolean,
    default: false
  },
  hasOnlineBatch: {
    type: Boolean,
    default: true
  },
  requirements: [String],
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['video', 'document', 'link', 'assignment']
    },
    url: String,
    description: String
  }],
  assignments: [{
    title: String,
    description: String,
    dueDate: Date,
    maxMarks: Number,
    instructions: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Note: mentorId is now a string, not ObjectId, so no populate needed

export default mongoose.models.Course || mongoose.model<CourseDocument>('Course', courseSchema);
