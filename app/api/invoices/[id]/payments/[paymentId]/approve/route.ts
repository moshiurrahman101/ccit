import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyTokenEdge } from '@/lib/auth';
import Invoice from '@/models/Invoice';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const authResult = verifyTokenEdge(token);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, paymentId } = await params;
    const body = await request.json();
    const { status, adminNotes } = body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const payment = invoice.payments.id(paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment status
    payment.status = status;
    if (adminNotes) {
      payment.adminNotes = adminNotes;
    }
    if (status === 'approved') {
      payment.approvedAt = new Date();
    }

    // If payment is rejected, adjust invoice amounts
    if (status === 'rejected') {
      invoice.paidAmount -= payment.amount;
      invoice.remainingAmount += payment.amount;
      
      // Update invoice status
      if (invoice.remainingAmount === invoice.finalAmount) {
        invoice.status = 'pending';
      } else if (invoice.paidAmount > 0) {
        invoice.status = 'partial';
      }
    }

    await invoice.save();

    return NextResponse.json({
      message: `Payment ${status} successfully`,
      payment,
      invoice
    });

  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
