import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Verify admin token
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
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
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Find the payment
    const payment = await Payment.findById(id);
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
    await Payment.findByIdAndDelete(id);

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

