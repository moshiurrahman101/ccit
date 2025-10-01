import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoice extends Document {
  invoiceNumber: string;
  studentId: string;
  batchId: string;
  batchName: string;
  courseType: 'batch' | 'course';
  
  // Financial Information
  amount: number;
  discountAmount: number;
  finalAmount: number;
  currency: string;
  
  // Promo Code
  promoCode?: string;
  promoDiscount?: number;
  
  // Payment Information
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAmount: number;
  remainingAmount: number;
  
  // Payment History
  payments: {
    amount: number;
    method: 'bkash' | 'nagad' | 'bank_transfer' | 'cash';
    senderNumber: string;
    transactionId?: string;
    status: 'pending' | 'verified' | 'rejected';
    submittedAt: Date;
    verifiedAt?: Date;
    adminNotes?: string;
  }[];
  
  // Additional Information
  notes?: string;
  createdBy: string; // Admin who created the invoice
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true,
    ref: 'User'
  },
  batchId: {
    type: String,
    required: true,
    ref: 'Batch'
  },
  batchName: {
    type: String,
    required: true
  },
  courseType: {
    type: String,
    enum: ['batch', 'course'],
    required: true
  },
  
  // Financial Information
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  
  // Promo Code
  promoCode: {
    type: String,
    trim: true
  },
  promoDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Payment Information
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  remainingAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment History
  payments: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    method: {
      type: String,
      required: true,
      enum: ['bkash', 'nagad', 'bank_transfer', 'cash']
    },
    senderNumber: {
      type: String,
      required: true
    },
    transactionId: {
      type: String,
      required: false
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: Date,
    adminNotes: String
  }],
  
  // Additional Information
  notes: String,
  createdBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
// Note: invoiceNumber already has unique index, no need to add another
InvoiceSchema.index({ studentId: 1 });
InvoiceSchema.index({ batchId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ createdAt: -1 });

const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
