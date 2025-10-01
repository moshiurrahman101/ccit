import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IStudent {
  userId: Types.ObjectId; // Reference to User collection
  studentId: string; // Generated student ID
  batchId: Types.ObjectId; // Reference to Batch
  
  // Basic Info (stored in User, referenced here)
  name: string;
  email: string;
  phone: string;
  
  // Student-specific data
  enrollmentDate: Date;
  status: 'enrolled' | 'active' | 'completed' | 'dropped' | 'suspended';
  
  // Academic Info (minimal)
  previousEducation?: string;
  institution?: string;
  graduationYear?: number;
  
  // Payment Info (essential only)
  paymentStatus: 'paid' | 'partial' | 'due' | 'overdue';
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  
  // Emergency Contact (essential only)
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  
  // Documents (references only, not full URLs)
  documents?: {
    nid?: string; // Just filename, not full URL
    photo?: string;
  };
  
  // Metadata
  isOfflineStudent: boolean;
  isVerified: boolean;
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentDocument extends IStudent, Document {
  _id: Types.ObjectId;
}

const studentSchema = new Schema<StudentDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  batchId: {
    type: Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
    index: true
  },
  
  // Basic Info (denormalized for performance)
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    maxlength: 100
  },
  phone: {
    type: String,
    maxlength: 15
  },
  
  enrollmentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  status: {
    type: String,
    enum: ['enrolled', 'active', 'completed', 'dropped', 'suspended'],
    default: 'enrolled',
    index: true
  },
  
  // Academic Info (minimal)
  previousEducation: {
    type: String,
    maxlength: 100
  },
  institution: {
    type: String,
    maxlength: 100
  },
  graduationYear: {
    type: Number,
    min: 1950,
    max: new Date().getFullYear() + 5
  },
  
  // Payment Info (essential)
  paymentStatus: {
    type: String,
    enum: ['paid', 'partial', 'due', 'overdue'],
    default: 'due',
    index: true
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Emergency Contact (essential only)
  emergencyContact: {
    name: {
      type: String,
      maxlength: 50
    },
    phone: {
      type: String,
      maxlength: 15
    },
    relation: {
      type: String,
      maxlength: 20
    }
  },
  
  // Documents (filename only)
  documents: {
    nid: {
      type: String,
      maxlength: 50
    },
    photo: {
      type: String,
      maxlength: 50
    }
  },
  
  // Metadata
  isOfflineStudent: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true,
  // Optimize for storage
  versionKey: false
});

// Indexes for performance
studentSchema.index({ studentId: 1 });
studentSchema.index({ batchId: 1, status: 1 });
studentSchema.index({ paymentStatus: 1 });
studentSchema.index({ enrollmentDate: -1 });
studentSchema.index({ name: 'text', email: 'text' });

// Compound indexes for common queries
studentSchema.index({ batchId: 1, paymentStatus: 1 });
studentSchema.index({ status: 1, isVerified: 1 });

export default mongoose.models.Student || mongoose.model<StudentDocument>('Student', studentSchema);
