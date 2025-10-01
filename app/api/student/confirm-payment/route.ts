import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';

// POST /api/student/confirm-payment - Confirm payment and approve enrollment
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || payload.role !== 'student') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { invoiceId, paymentMethod, transactionId, senderNumber } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invoice ID is required' },
        { status: 400 }
      );
    }

    // Find the invoice
    const invoice = await Invoice.findOne({
      _id: invoiceId,
      studentId: payload.userId
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Update invoice with payment details
    await Invoice.findByIdAndUpdate(invoiceId, {
      status: 'paid',
      paidAmount: invoice.finalAmount,
      remainingAmount: 0,
      paymentMethod,
      transactionId,
      senderNumber,
      paidAt: new Date(),
      payments: [{
        amount: invoice.finalAmount,
        method: paymentMethod,
        transactionId,
        senderNumber,
        paidAt: new Date()
      }]
    });

    // Update enrollment status
    await Enrollment.findOneAndUpdate(
      {
        student: payload.userId,
        batch: invoice.batchId
      },
      {
        status: 'approved',
        paymentStatus: 'paid',
        paymentMethod,
        transactionId,
        senderNumber,
        approvedAt: new Date()
      }
    );

    return NextResponse.json({
      message: 'Payment confirmed and enrollment approved successfully',
      invoice: {
        _id: invoice._id,
        status: 'paid',
        paidAmount: invoice.finalAmount
      }
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
