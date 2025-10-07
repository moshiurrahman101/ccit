import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const verificationSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  action: z.enum(['verify', 'reject']),
  verificationNotes: z.string().optional(),
  rejectionReason: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const User = (await import('@/models/User')).default;
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !['admin', 'marketing'].includes(currentUser.role)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const verificationStatus = searchParams.get('verificationStatus');
    const search = searchParams.get('search');

    // Build query
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { 'studentId.name': { $regex: search, $options: 'i' } },
        { 'studentId.email': { $regex: search, $options: 'i' } },
        { 'transactionId': { $regex: search, $options: 'i' } },
        { 'senderNumber': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const payments = await Payment.find(query)
      .populate('studentId', 'name email phone avatar')
      .populate('batchId', 'name courseType')
      .populate('invoiceId', 'invoiceNumber finalAmount paidAmount status')
      .populate('verifiedBy', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Payment.countDocuments(query);

    return NextResponse.json({
      success: true,
      payments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { message: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const User = (await import('@/models/User')).default;
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !['admin', 'marketing'].includes(currentUser.role)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentId, action, verificationNotes, rejectionReason } = verificationSchema.parse(body);

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    if (payment.verificationStatus !== 'pending') {
      return NextResponse.json({ message: 'Payment has already been processed' }, { status: 400 });
    }

    // Update payment status
    const updateData: any = {
      verificationStatus: action === 'verify' ? 'verified' : 'rejected',
      status: action === 'verify' ? 'verified' : 'rejected',
      verifiedBy: currentUser._id,
      verifiedAt: new Date()
    };

    if (action === 'verify') {
      updateData.verificationNotes = verificationNotes;
    } else {
      updateData.rejectionReason = rejectionReason;
    }

    await Payment.findByIdAndUpdate(paymentId, updateData);

    // If payment is verified, update invoice and enrollment
    if (action === 'verify') {
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        const newPaidAmount = (invoice.paidAmount || 0) + payment.amount;
        const newRemainingAmount = invoice.finalAmount - newPaidAmount;
        
        // Update invoice embedded payments array if exists
        const updatedPayments = invoice.payments.map((p: any) => {
          if (p._id && p._id.toString() === payment._id.toString()) {
            return {
              ...p,
              status: 'verified',
              verifiedAt: new Date(),
              adminNotes: verificationNotes
            };
          }
          return p;
        });
        
        // Check if payment exists in embedded array, if not add it
        const paymentExistsInArray = invoice.payments.some((p: any) => 
          p._id && p._id.toString() === payment._id.toString()
        );
        
        if (!paymentExistsInArray) {
          updatedPayments.push({
            _id: payment._id,
            amount: payment.amount,
            method: payment.paymentMethod,
            senderNumber: payment.senderNumber,
            transactionId: payment.transactionId,
            status: 'verified',
            submittedAt: payment.submittedAt,
            verifiedAt: new Date(),
            adminNotes: verificationNotes
          });
        }
        
        await Invoice.findByIdAndUpdate(payment.invoiceId, {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newRemainingAmount <= 0 ? 'paid' : 'partial',
          payments: updatedPayments
        });

        // Update enrollment status to approved when payment is verified
        console.log('=== PAYMENT VERIFICATION ENROLLMENT UPDATE ===');
        console.log('Payment ID:', paymentId);
        console.log('Student ID:', payment.studentId);
        console.log('Batch ID:', payment.batchId);
        
        const enrollmentUpdate = await Enrollment.updateMany(
          { 
            student: payment.studentId,
            batch: payment.batchId
          },
          { 
            status: 'approved',
            paymentStatus: 'paid',
            approvedBy: currentUser._id,
            approvedAt: new Date()
          }
        );
        
        console.log('Enrollment update result:', enrollmentUpdate);
        console.log('Modified enrollments count:', enrollmentUpdate.modifiedCount);
        
        // Also update User approval status if not already approved
        const User = (await import('@/models/User')).default;
        const userUpdate = await User.findByIdAndUpdate(
          payment.studentId,
          { 
            approvalStatus: 'approved',
            approvedBy: currentUser._id,
            approvalDate: new Date()
          },
          { new: true }
        );
        
        console.log('User approval status updated:', userUpdate?.approvalStatus);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Payment ${action === 'verify' ? 'verified' : 'rejected'} successfully`
    });

  } catch (error: unknown) {
    console.error('Error processing payment verification:', error);
    
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: (error as any).issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to process payment verification' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const User = (await import('@/models/User')).default;
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !['admin', 'marketing'].includes(currentUser.role)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');
    const otp = searchParams.get('otp');
    
    if (!paymentId) {
      return NextResponse.json({ message: 'Payment ID is required' }, { status: 400 });
    }

    // Enforce OTP verification for deletion
    if (!otp) {
      return NextResponse.json({ message: 'OTP verification required' }, { status: 401 });
    }

    const PasswordReset = (await import('@/models/PasswordReset')).default;
    const usedToken = await (PasswordReset as any).verifyAndUseToken(otp);
    if (!usedToken || usedToken.email.toString() !== currentUser.email.toLowerCase()) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Find the payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
    }

    // If payment was verified, we need to update the invoice
    if (payment.status === 'verified') {
      const invoice = await Invoice.findById(payment.invoiceId);
      if (invoice) {
        const newPaidAmount = Math.max(0, (invoice.paidAmount || 0) - payment.amount);
        const newRemainingAmount = invoice.finalAmount - newPaidAmount;
        
        await Invoice.findByIdAndUpdate(payment.invoiceId, {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newRemainingAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'unpaid')
        });
      }
    }

    // Delete the payment
    await Payment.findByIdAndDelete(paymentId);

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (error: unknown) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { message: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
