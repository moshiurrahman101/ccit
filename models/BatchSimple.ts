import mongoose, { Document, Schema } from 'mongoose';

export interface IBatchSimple extends Document {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  maxStudents: number;
  currentStudents: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BatchSimpleSchema = new Schema<IBatchSimple>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  maxStudents: {
    type: Number,
    default: 30,
    min: 1
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
BatchSimpleSchema.index({ name: 1 });
BatchSimpleSchema.index({ status: 1 });
BatchSimpleSchema.index({ isActive: 1 });

const BatchSimple = mongoose.models.BatchSimple || mongoose.model<IBatchSimple>('BatchSimple', BatchSimpleSchema);

export default BatchSimple;
