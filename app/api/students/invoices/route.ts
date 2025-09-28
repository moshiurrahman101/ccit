import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Batch from '@/models/Batch';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('=== STUDENT INVOICES API CALLED ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    
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

    // Get invoices for the student
    const invoices = await Invoice.find({ studentId: payload.userId })
      .sort({ createdAt: -1 });
    
    console.log('Found invoices for student:', invoices.length);
    console.log('Student ID:', payload.userId);

    // Manually add batch data to invoices
    const invoicesWithBatchData = await Promise.all(
      invoices.map(async (invoice) => {
        const batch = await Batch.findById(invoice.batchId).select('name regularPrice discountPrice');
        console.log('Batch found for invoice:', batch ? batch.name : 'Not found');
        return {
          ...invoice.toObject(),
          batchId: {
            _id: invoice.batchId,
            name: batch?.name || invoice.batchName,
            regularPrice: batch?.regularPrice || invoice.amount,
            discountPrice: batch?.discountPrice
          }
        };
      })
    );

    console.log('Returning invoices:', invoicesWithBatchData.length);
    return NextResponse.json({ invoices: invoicesWithBatchData });
  } catch (error) {
    console.error('Error fetching student invoices:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
