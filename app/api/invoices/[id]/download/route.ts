import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { generateInvoicePDF } from '@/lib/pdfGeneratorEnhanced';

export async function GET(
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

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Await params before using
    const { id } = await params;

    // Find the invoice
    const invoice = await Invoice.findById(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if user has access to this invoice
    if (payload.role !== 'admin' && invoice.studentId !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get student information
    const student = await User.findById(invoice.studentId).select('name email phone');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber: invoice.invoiceNumber,
      studentName: student.name,
      studentEmail: student.email,
      studentPhone: student.phone,
      batchName: invoice.batchName,
      amount: invoice.amount,
      discountAmount: invoice.discountAmount,
      finalAmount: invoice.finalAmount,
      dueDate: invoice.dueDate.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      payments: invoice.payments.map((payment: any) => ({
        amount: payment.amount,
        method: payment.method,
        senderNumber: payment.senderNumber,
        transactionId: payment.transactionId,
        status: payment.status,
        submittedAt: payment.submittedAt.toISOString()
      }))
    };

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoiceData);

    // Return PDF as response
    return new NextResponse(pdfBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.png"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
