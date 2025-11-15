import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  batchId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  instructions?: string;
  dueDate: Date;
  maxPoints: number;
  attachments?: string[];
  status: 'draft' | 'published' | 'archived';
  createdBy: mongoose.Types.ObjectId;
  submissions?: Array<{
    student: mongoose.Types.ObjectId;
    content: string;
    attachments?: string[];
    submittedAt: Date;
    grade?: number;
    feedback?: string;
    gradedBy?: mongoose.Types.ObjectId;
    gradedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  batchId: {
    type: Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 1,
    default: 100
  },
  attachments: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissions: {
    type: [{
      student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      attachments: {
        type: [String],
        default: []
      },
      submittedAt: {
        type: Date,
        required: true,
        default: Date.now
      },
      grade: {
        type: Number,
        min: 0
      },
      feedback: {
        type: String,
        trim: true
      },
      gradedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      gradedAt: {
        type: Date
      }
    }],
    default: []
  }
}, {
  timestamps: true
});

// Index for efficient queries
AssignmentSchema.index({ batchId: 1, createdAt: -1 });
AssignmentSchema.index({ createdBy: 1 });
AssignmentSchema.index({ status: 1 });

export default mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

