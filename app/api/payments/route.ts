import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: z.number().min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'bank', 'cash']),
  senderNumber: z.string().min(1, 'Sender number is required'),
  transactionId: z.string().optional(),
  referenceNumber: z.string().optional(),
  paymentType: z.enum(['full', 'partial', 'installment']),
  paymentScreenshot: z.string().optional(),
  bankReceipt: z.string().optional(),
  otherDocuments: z.array(z.string()).optional()
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    // Get invoice details
    const invoice = await Invoice.findById(validatedData.invoiceId);
    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    // Check if payment amount is valid
    const remainingAmount = invoice.finalAmount - (invoice.paidAmount || 0);
    if (validatedData.amount > remainingAmount) {
      return NextResponse.json({ 
        message: `Payment amount cannot exceed remaining amount of ${remainingAmount}` 
      }, { status: 400 });
    }

    // Create payment record
    const payment = new Payment({
      studentId: invoice.studentId,
      batchId: invoice.batchId,
      invoiceId: validatedData.invoiceId,
      amount: validatedData.amount,
      paymentMethod: validatedData.paymentMethod,
      senderNumber: validatedData.senderNumber,
      transactionId: validatedData.transactionId,
      referenceNumber: validatedData.referenceNumber,
      paymentType: validatedData.paymentType,
      paymentScreenshot: validatedData.paymentScreenshot,
      bankReceipt: validatedData.bankReceipt,
      otherDocuments: validatedData.otherDocuments,
      status: 'pending',
      verificationStatus: 'pending'
    });

    await payment.save();

    return NextResponse.json({
      success: true,
      message: 'Payment submitted successfully. Waiting for admin verification.',
      payment: payment.toJSON()
    });

  } catch (error: unknown) {
    console.error('Error creating payment:', error);
    
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: (error as any).issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to submit payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const verificationStatus = searchParams.get('verificationStatus');
    let studentId = searchParams.get('studentId');

    // Build query
    const query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }

    // Default to the authenticated student if no studentId provided
    if (!studentId) {
      const tokenStudentId = payload.userId;
      if (tokenStudentId) {
        studentId = tokenStudentId;
      }
    }

    if (studentId) query.studentId = studentId;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(query)
      .populate('studentId', 'name email phone')
      .populate('batchId', 'name courseType')
      .populate('invoiceId', 'invoiceNumber finalAmount paidAmount')
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
