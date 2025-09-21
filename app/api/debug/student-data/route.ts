import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Batch from '@/models/Batch';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('Token extracted:', token.substring(0, 20) + '...');
    
    const payload = verifyToken(token);
    console.log('Token payload:', payload);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();

    // Get all invoices for this student
    const invoices = await Invoice.find({ studentId: payload.userId });
    console.log('Found invoices:', invoices.length);

    // Get batch details for each invoice
    const invoicesWithBatchData = await Promise.all(
      invoices.map(async (invoice) => {
        const batch = await Batch.findById(invoice.batchId);
        return {
          invoiceId: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          batchId: invoice.batchId,
          batchName: invoice.batchName,
          batchDetails: batch ? {
            _id: batch._id,
            name: batch.name,
            status: batch.status,
            currentStudents: batch.currentStudents,
            maxStudents: batch.maxStudents
          } : null,
          amount: invoice.amount,
          status: invoice.status,
          createdAt: invoice.createdAt
        };
      })
    );

    return NextResponse.json({
      success: true,
      studentId: payload.userId,
      studentRole: payload.role,
      invoiceCount: invoices.length,
      invoices: invoicesWithBatchData
    });

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
