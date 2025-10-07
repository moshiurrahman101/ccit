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

    // Allow students and admins to access invoices
    if (!['student', 'admin'].includes(payload.role)) {
      console.log('Not a student or admin role:', payload.role);
      return NextResponse.json({ error: 'Unauthorized - Student or Admin role required' }, { status: 403 });
    }

    await connectDB();
    console.log('Connected to database');

    // Get invoices for the student
    const invoices = await Invoice.find({ studentId: payload.userId })
      .sort({ createdAt: -1 });
    
    console.log('Found invoices for student:', invoices.length);
    console.log('Student ID:', payload.userId);

    // Also get Payment collection data for this student
    const Payment = (await import('@/models/Payment')).default;
    const payments = await Payment.find({ studentId: payload.userId })
      .sort({ submittedAt: -1 })
      .lean();
    
    console.log('Found separate payments for student:', payments.length);

    // Manually add batch data to invoices and merge with Payment collection
    const invoicesWithBatchData = await Promise.all(
      invoices.map(async (invoice) => {
        const batch = await Batch.findById(invoice.batchId).select('name regularPrice discountPrice');
        console.log('Batch found for invoice:', batch ? batch.name : 'Not found');
        
        // Get related payments from Payment collection
        const relatedPayments = payments.filter((p: any) => 
          p.invoiceId && p.invoiceId.toString() === invoice._id.toString()
        );
        
        // Merge embedded payments with Payment collection payments, avoiding duplicates
        const embeddedPaymentIds = new Set(
          invoice.payments?.map((p: any) => p._id?.toString()).filter(Boolean) || []
        );
        
        const paymentsFromCollection = relatedPayments
          .filter((p: any) => !embeddedPaymentIds.has(p._id.toString()))
          .map((p: any) => ({
            _id: p._id,
            amount: p.amount,
            method: p.paymentMethod,
            senderNumber: p.senderNumber,
            transactionId: p.transactionId,
            status: p.verificationStatus || p.status, // Use verificationStatus as primary
            createdAt: p.submittedAt,
            verifiedAt: p.verifiedAt
          }));
        
        // Update embedded payments status from Payment collection (more up-to-date)
        const updatedEmbeddedPayments = (invoice.payments || []).map((embeddedPayment: any) => {
          const paymentFromCollection = relatedPayments.find((p: any) => 
            p._id.toString() === embeddedPayment._id?.toString()
          );
          
          if (paymentFromCollection) {
            return {
              ...embeddedPayment,
              status: paymentFromCollection.verificationStatus || paymentFromCollection.status,
              verifiedAt: paymentFromCollection.verifiedAt
            };
          }
          return embeddedPayment;
        });
        
        const allPayments = [
          ...updatedEmbeddedPayments,
          ...paymentsFromCollection
        ];
        
        return {
          ...invoice.toObject(),
          batchId: {
            _id: invoice.batchId,
            name: batch?.name || invoice.batchName,
            regularPrice: batch?.regularPrice || invoice.amount,
            discountPrice: batch?.discountPrice
          },
          payments: allPayments
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
