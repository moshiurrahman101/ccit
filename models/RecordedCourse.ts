import mongoose, { Document, Schema } from 'mongoose';

export interface IRecordedCourse extends Document {
  title: string;
  description: string;
  shortDescription?: string;
  coverPhoto?: string;
  regularPrice: number;
  discountPrice?: number;
  discountPercentage?: number;
  
  // Video content - YouTube unlisted links
  videos: {
    title: string;
    description?: string;
    youtubeUrl: string; // Stored as encrypted/hashed reference
    youtubeVideoId: string; // Extracted video ID
    duration?: number; // in minutes
    order: number;
    isPreview: boolean; // Free preview video
  }[];
  
  // Course metadata
  category: 'web-development' | 'data-science' | 'mobile-development' | 'design' | 'marketing' | 'other';
  level: 'beginner' | 'intermediate' | 'advanced';
  language: 'bengali' | 'english';
  duration: number; // Total duration in hours
  durationUnit: 'hours' | 'days' | 'weeks';
  
  // What students will learn
  whatYouWillLearn: string[];
  requirements: string[];
  features: string[];
  
  // Marketing
  slug: string;
  metaDescription?: string;
  tags: string[];
  
  // Status
  status: 'draft' | 'published' | 'archived';
  isActive: boolean;
  
  // Security settings
  allowDownload: boolean;
  domainRestriction?: string[]; // Allowed domains (if using YouTube domain restriction)
  
  // Mentors
  mentors: mongoose.Types.ObjectId[];
  
  // Creator info
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const RecordedCourseSchema = new Schema<IRecordedCourse>({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  coverPhoto: {
    type: String,
    trim: true
  },
  regularPrice: {
    type: Number,
    required: [true, 'Regular price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%']
  },
  videos: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    youtubeUrl: {
      type: String,
      required: true,
      trim: true
    },
    youtubeVideoId: {
      type: String,
      required: true,
      trim: true
    },
    duration: {
      type: Number,
      min: 0
    },
    order: {
      type: Number,
      required: true,
      min: 1
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  }],
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
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1']
  },
  durationUnit: {
    type: String,
    enum: ['hours', 'days', 'weeks'],
    default: 'hours'
  },
  whatYouWillLearn: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  features: [{
    type: String,
    trim: true
  }],
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    trim: true,
    lowercase: true,
    unique: true
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Meta description cannot exceed 160 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  allowDownload: {
    type: Boolean,
    default: false
  },
  domainRestriction: [{
    type: String,
    trim: true
  }],
  mentors: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: String,
    required: [true, 'Created by is required']
  }
}, {
  timestamps: true
});

// Pre-save middleware to calculate discount percentage and extract YouTube video ID
RecordedCourseSchema.pre('save', function(next) {
  // Calculate discount percentage if discount price is provided
  if (this.discountPrice && this.regularPrice > 0) {
    this.discountPercentage = Math.round(((this.regularPrice - this.discountPrice) / this.regularPrice) * 100);
  }

  // Extract YouTube video ID from URL for each video
  if (this.videos && this.videos.length > 0) {
    this.videos.forEach((video) => {
      if (video.youtubeUrl && !video.youtubeVideoId) {
        const videoId = extractYouTubeVideoId(video.youtubeUrl);
        if (videoId) {
          video.youtubeVideoId = videoId;
        }
      }
    });
  }

  next();
});

// Helper function to extract YouTube video ID
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// Indexes for efficient queries
RecordedCourseSchema.index({ title: 1 });
RecordedCourseSchema.index({ slug: 1 }, { unique: true });
RecordedCourseSchema.index({ status: 1 });
RecordedCourseSchema.index({ isActive: 1 });
RecordedCourseSchema.index({ category: 1, level: 1 });
RecordedCourseSchema.index({ tags: 1 });
RecordedCourseSchema.index({ createdBy: 1 });

export const RecordedCourse = mongoose.models.RecordedCourse || mongoose.model<IRecordedCourse>('RecordedCourse', RecordedCourseSchema);
export default RecordedCourse;

