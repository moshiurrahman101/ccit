import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
  email: string;
  name?: string;
  subscribedAt: Date;
  isActive: boolean;
  source: string; // Where they subscribed from (homepage, footer, etc.)
  ipAddress?: string;
  userAgent?: string;
}

const NewsletterSchema = new Schema<INewsletter>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  source: {
    type: String,
    default: 'homepage',
    enum: ['homepage', 'footer', 'course', 'blog', 'other']
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ subscribedAt: -1 });
NewsletterSchema.index({ isActive: 1 });

export default mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);
