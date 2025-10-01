import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment {
  studentId: Types.ObjectId; // Reference to User
  batchId: Types.ObjectId; // Reference to Batch
  enrollmentId?: Types.ObjectId; // Reference to Enrollment
  invoiceId: Types.ObjectId; // Reference to Invoice (REQUIRED)
  
  // Payment Details
  amount: number;
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'cash';
  senderNumber: string;
  transactionId?: string;
  referenceNumber?: string;
  
  // Payment Status
  status: 'pending' | 'verified' | 'rejected' | 'refunded';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  
  // Payment Type
  paymentType: 'full' | 'partial' | 'installment';
  
  // Admin Verification
  verifiedBy?: string; // Reference to User (admin)
  verifiedAt?: Date;
  verificationNotes?: string;
  rejectionReason?: string;
  
  // Payment Evidence
  paymentScreenshot?: string; // URL to payment screenshot
  bankReceipt?: string; // URL to bank receipt
  otherDocuments?: string[]; // URLs to other supporting documents
  
  // Metadata
  submittedAt: Date;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentDocument extends IPayment, Document {
  _id: Types.ObjectId;
}

const paymentSchema = new Schema<PaymentDocument>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  batchId: {
    type: Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
    index: true
  },
  enrollmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Enrollment',
    index: true
  },
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true,
    index: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['bkash', 'nagad', 'rocket', 'bank', 'cash'],
    required: true
  },
  senderNumber: {
    type: String,
    required: true,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'refunded'],
    default: 'pending',
    index: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
    index: true
  },
  
  // Payment Type
  paymentType: {
    type: String,
    enum: ['full', 'partial', 'installment'],
    required: true,
    index: true
  },
  
  // Admin Verification
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  verificationNotes: {
    type: String,
    maxlength: 500
  },
  rejectionReason: {
    type: String,
    maxlength: 500
  },
  
  // Payment Evidence
  paymentScreenshot: {
    type: String,
    trim: true
  },
  bankReceipt: {
    type: String,
    trim: true
  },
  otherDocuments: [{
    type: String,
    trim: true
  }],
  
  // Metadata
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: Date
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ studentId: 1, status: 1 });
paymentSchema.index({ batchId: 1, status: 1 });
paymentSchema.index({ verificationStatus: 1, submittedAt: -1 });
paymentSchema.index({ verifiedBy: 1, verifiedAt: -1 });
paymentSchema.index({ paymentMethod: 1, status: 1 });

// Compound indexes for common queries
paymentSchema.index({ status: 1, verificationStatus: 1 });
paymentSchema.index({ studentId: 1, batchId: 1, status: 1 });

export default mongoose.models.Payment || mongoose.model<PaymentDocument>('Payment', paymentSchema);
