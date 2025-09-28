import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
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

    await connectDB();

    const { batchId } = await params;
    
    // Check if student is enrolled in this batch
    const existingInvoice = await Invoice.findOne({
      studentId: payload.userId,
      batchId: batchId
    });

    return NextResponse.json({ 
      isEnrolled: !!existingInvoice,
      invoice: existingInvoice
    });
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
