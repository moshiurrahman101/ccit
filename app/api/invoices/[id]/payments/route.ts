import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyTokenEdge } from '@/lib/auth';
import Invoice from '@/models/Invoice';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const body = await request.json();
    const { amount, method, transactionId, notes } = body;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if payment amount is valid
    if (amount <= 0 || amount > invoice.remainingAmount) {
      return NextResponse.json({ 
        error: 'Invalid payment amount' 
      }, { status: 400 });
    }

    // Add payment to invoice
    const payment = {
      amount,
      method,
      transactionId,
      status: 'pending',
      submittedAt: new Date(),
      adminNotes: notes || ''
    };

    invoice.payments.push(payment);
    invoice.paidAmount += amount;
    invoice.remainingAmount -= amount;

    // Update invoice status
    if (invoice.remainingAmount === 0) {
      invoice.status = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    return NextResponse.json({
      message: 'Payment submitted successfully',
      payment,
      invoice
    });

  } catch (error) {
    console.error('Error submitting payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({
      payments: invoice.payments
    });

  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
