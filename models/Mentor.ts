import mongoose, { Document, Schema } from 'mongoose';

export interface IMentor extends Document {
  // Basic Information
  name: string;
  email: string;
  phone?: string;
  avatar?: string; // Cloudinary URL
  bio?: string;
  designation?: string; // e.g., "Senior Developer", "UI/UX Expert"
  
  // Professional Information
  experience: number; // years of experience
  expertise: string[]; // areas of expertise
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  
  // Social Links
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
  
  // Professional Details
  skills: string[]; // technical skills
  languages: string[]; // spoken languages
  certifications: {
    name: string;
    issuer: string;
    date: Date;
    credentialId?: string;
  }[];
  
  // Availability & Preferences
  availability: {
    timezone: string;
    workingHours: string;
    availableDays: string[]; // ['monday', 'tuesday', etc.]
  };
  
  // Teaching Information
  teachingExperience: number; // years of teaching
  teachingStyle: string;
  
  // Status & Management
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  isVerified: boolean;
  rating: number; // average rating from students
  totalStudents: number; // total students taught
  totalCourses: number; // total courses taught
  
  // System Information
  userId: mongoose.Schema.Types.ObjectId; // Reference to User model
  createdBy: mongoose.Schema.Types.ObjectId; // Admin who created this mentor
  createdAt: Date;
  updatedAt: Date;
}

const MentorSchema = new Schema<IMentor>({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  designation: {
    type: String,
    trim: true
  },
  
  // Professional Information
  experience: {
    type: Number,
    required: true,
    min: 0,
    max: 50
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
      min: 1950,
      max: new Date().getFullYear() + 5
    }
  }],
  
  // Social Links
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
  
  // Professional Details
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
      type: Date,
      required: true
    },
    credentialId: {
      type: String,
      trim: true
    }
  }],
  
  // Availability & Preferences
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
  
  // Teaching Information
  teachingExperience: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  teachingStyle: {
    type: String,
    trim: true
  },
  
  // Status & Management
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'suspended'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  totalCourses: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // System Information
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
MentorSchema.index({ name: 1 });
MentorSchema.index({ email: 1 });
MentorSchema.index({ status: 1 });
MentorSchema.index({ isVerified: 1 });
MentorSchema.index({ expertise: 1 });
MentorSchema.index({ skills: 1 });
MentorSchema.index({ rating: -1 });
MentorSchema.index({ userId: 1 });

// Virtual for full name
MentorSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for profile completeness
MentorSchema.virtual('profileCompleteness').get(function() {
  let score = 0;
  const fields = [
    'name', 'email', 'bio', 'designation', 'experience', 'expertise',
    'education', 'skills', 'languages', 'avatar', 'socialLinks'
  ];
  
  fields.forEach(field => {
    if (field === 'socialLinks') {
      const hasSocialLinks = Object.values(this.socialLinks).some(link => link && link.trim());
      if (hasSocialLinks) score += 1;
    } else if (field === 'expertise' || field === 'education' || field === 'skills' || field === 'languages') {
      const fieldValue = (this as any)[field];
      if (fieldValue && fieldValue.length > 0) score += 1;
    } else {
      const fieldValue = (this as any)[field];
      if (fieldValue && fieldValue.toString().trim()) {
        score += 1;
      }
    }
  });
  
  return Math.round((score / fields.length) * 100);
});

const Mentor = mongoose.models.Mentor || mongoose.model<IMentor>('Mentor', MentorSchema);

export default Mentor;
