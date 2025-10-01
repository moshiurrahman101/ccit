import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import Batch from '@/models/Batch';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get test data
    const testStudent = await User.findOne({ role: 'student' });
    const testBatch = await Batch.findOne();
    const testInvoice = await Invoice.findOne({ studentId: testStudent?._id });
    const testPayments = await Payment.find({ studentId: testStudent?._id })
      .populate('studentId', 'name email')
      .populate('batchId', 'name')
      .populate('invoiceId', 'invoiceNumber finalAmount paidAmount')
      .sort({ submittedAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      message: 'Payment flow test data',
      data: {
        testStudent: testStudent ? {
          id: testStudent._id,
          name: testStudent.name,
          email: testStudent.email,
          role: testStudent.role
        } : null,
        testBatch: testBatch ? {
          id: testBatch._id,
          name: testBatch.name,
          courseType: testBatch.courseType
        } : null,
        testInvoice: testInvoice ? {
          id: testInvoice._id,
          invoiceNumber: testInvoice.invoiceNumber,
          finalAmount: testInvoice.finalAmount,
          paidAmount: testInvoice.paidAmount,
          remainingAmount: testInvoice.remainingAmount,
          status: testInvoice.status
        } : null,
        recentPayments: testPayments.map(payment => ({
          id: payment._id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          verificationStatus: payment.verificationStatus,
          submittedAt: payment.submittedAt
        }))
      }
    });

  } catch (error: unknown) {
    console.error('Error testing payment flow:', error);
    return NextResponse.json(
      { message: 'Failed to test payment flow', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
