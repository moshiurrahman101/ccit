import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Batch from '@/models/Batch';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== SINGLE STUDENT INVOICE API CALLED ===');
    
    // Await params before using
    const { id } = await params;
    console.log('Invoice ID:', id);
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('Token extracted:', token.substring(0, 20) + '...');
    
    const payload = verifyToken(token);
    console.log('Token payload:', payload);

    if (!payload) {
      console.log('Invalid token');
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (payload.role !== 'student') {
      console.log('Not a student role:', payload.role);
      return NextResponse.json({ error: 'Unauthorized - Student role required' }, { status: 401 });
    }

    await connectDB();
    console.log('Connected to database');

    // Get the specific invoice for the student
    const invoice = await Invoice.findOne({
      _id: id,
      studentId: payload.userId
    });

    if (!invoice) {
      console.log('Invoice not found for student');
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    console.log('Invoice found:', invoice.invoiceNumber);

    // Get batch details
    const batch = await Batch.findById(invoice.batchId).select('name regularPrice discountPrice');
    console.log('Batch found:', batch ? batch.name : 'Not found');

    // Combine invoice with batch data
    const invoiceWithBatchData = {
      ...invoice.toObject(),
      batchId: {
        _id: invoice.batchId,
        name: batch?.name || invoice.batchName,
        regularPrice: batch?.regularPrice || invoice.amount,
        discountPrice: batch?.discountPrice
      }
    };

    console.log('Returning invoice with batch data');
    return NextResponse.json({ invoice: invoiceWithBatchData });

  } catch (error) {
    console.error('Error fetching single student invoice:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
