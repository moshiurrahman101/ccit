import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser, UserRole } from '@/types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>({
  name: {
    type: String,
    required: [true, 'নাম প্রয়োজন'],
    trim: true,
    maxlength: [50, 'নাম ৫০ অক্ষরের বেশি হতে পারবে না']
  },
  email: {
    type: String,
    required: [true, 'ইমেইল প্রয়োজন'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'সঠিক ইমেইল ঠিকানা দিন']
  },
  password: {
    type: String,
    required: [true, 'পাসওয়ার্ড প্রয়োজন'],
    minlength: [6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে']
  },
  role: {
    type: String,
    enum: {
      values: ['student', 'mentor', 'admin', 'marketing', 'support'],
      message: 'ভুল ব্যবহারকারীর ভূমিকা'
    },
    default: 'student'
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+88)?01[3-9]\d{8}$/, 'সঠিক ফোন নম্বর দিন']
  },
  avatar: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  studentInfo: {
    studentId: {
      type: String,
      unique: true,
      sparse: true
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    address: {
      street: String,
      city: String,
      district: String,
      postalCode: String
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    },
    education: {
      level: String,
      institution: String,
      graduationYear: Number
    },
    isOfflineStudent: {
      type: Boolean,
      default: false
    }
  },
  mentorInfo: {
    specialization: [String],
    experience: Number, // in years
    bio: String,
    qualifications: [String],
    hourlyRate: Number,
    availability: {
      monday: { start: String, end: String },
      tuesday: { start: String, end: String },
      wednesday: { start: String, end: String },
      thursday: { start: String, end: String },
      friday: { start: String, end: String },
      saturday: { start: String, end: String },
      sunday: { start: String, end: String }
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
