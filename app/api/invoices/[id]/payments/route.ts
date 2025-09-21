import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be greater than 0'),
  method: z.enum(['bkash', 'nagad', 'bank_transfer', 'cash']),
  senderNumber: z.string().min(1, 'Sender number is required'),
  transactionId: z.string().optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    await connectDB();

    const { id } = await params;
    
    // Find the invoice
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if the invoice belongs to the student
    if (invoice.studentId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if payment amount is valid
    if (validatedData.amount > invoice.remainingAmount) {
      return NextResponse.json({ 
        error: 'Payment amount cannot exceed remaining amount' 
      }, { status: 400 });
    }

    // Add payment to the invoice
    const newPayment = {
      amount: validatedData.amount,
      method: validatedData.method,
      senderNumber: validatedData.senderNumber,
      transactionId: validatedData.transactionId,
      status: 'pending' as const,
      submittedAt: new Date()
    };

    invoice.payments.push(newPayment);
    
    // Update paid and remaining amounts
    invoice.paidAmount += validatedData.amount;
    invoice.remainingAmount -= validatedData.amount;

    // Update status based on remaining amount
    if (invoice.remainingAmount === 0) {
      invoice.status = 'paid';
    } else if (invoice.paidAmount > 0) {
      invoice.status = 'partial';
    }

    await invoice.save();

    return NextResponse.json({ 
      message: 'Payment submitted successfully',
      invoice 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error',
        details: error.issues 
      }, { status: 400 });
    }
    
    console.error('Error submitting payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}