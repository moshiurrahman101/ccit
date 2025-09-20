import mongoose, { Document, Schema } from 'mongoose';

export interface IMentor extends Document {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  designation?: string;
  experience: number; // years of experience
  expertise: string[]; // areas of expertise
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  skills: string[]; // technical skills
  languages: string[];
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId: string;
  }>;
  socialLinks: {
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    portfolio?: string;
  };
  teachingExperience: number; // years of teaching experience
  teachingStyle?: string;
  availability: {
    timezone: string;
    workingHours: string;
    availableDays: string[];
  };
  rating?: number; // average rating
  studentsCount?: number; // total students taught
  coursesCount?: number; // total courses taught
  achievements: string[];
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  isVerified: boolean;
  isActive: boolean;
  userId?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MentorSchema = new Schema<IMentor>({
  name: {
    type: String,
    required: [true, 'Mentor name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+88)?01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  avatar: {
    type: String,
    trim: true
  },
  designation: {
    type: String,
    trim: true,
    maxlength: [100, 'Designation cannot exceed 100 characters']
  },
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: [0, 'Experience cannot be negative']
  },
  expertise: [{
    type: String,
    trim: true
  }],
  education: [{
    degree: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true,
      min: [1900, 'Year must be after 1900'],
      max: [new Date().getFullYear() + 10, 'Year cannot be more than 10 years in the future']
    }
  }],
  skills: [{
    type: String,
    trim: true
  }],
  languages: [{
    type: String,
    trim: true
  }],
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: String,
      required: true,
      trim: true
    },
    credentialId: {
      type: String,
      trim: true
    }
  }],
  socialLinks: {
    website: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    github: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    portfolio: {
      type: String,
      trim: true
    }
  },
  teachingExperience: {
    type: Number,
    required: [true, 'Teaching experience is required'],
    min: [0, 'Teaching experience cannot be negative']
  },
  teachingStyle: {
    type: String,
    trim: true
  },
  availability: {
    timezone: {
      type: String,
      default: 'Asia/Dhaka'
    },
    workingHours: {
      type: String,
      default: '9:00 AM - 6:00 PM'
    },
    availableDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  studentsCount: {
    type: Number,
    default: 0,
    min: [0, 'Students count cannot be negative']
  },
  coursesCount: {
    type: Number,
    default: 0,
    min: [0, 'Courses count cannot be negative']
  },
  achievements: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
MentorSchema.index({ name: 1 });
// Note: email index is automatically created by unique: true
MentorSchema.index({ isActive: 1 });
MentorSchema.index({ expertise: 1 });
MentorSchema.index({ skills: 1 });
MentorSchema.index({ rating: -1 });

export const Mentor = mongoose.models.Mentor || mongoose.model<IMentor>('Mentor', MentorSchema);
export default Mentor;