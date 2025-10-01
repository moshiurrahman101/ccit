import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';
// Ensure Batch schema is registered before populate
import '@/models/Batch';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is student
    if (payload.role !== 'student') {
      return NextResponse.json({ message: 'Student access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build query
    const query: any = {
      studentId: payload.userId
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const invoices = await Invoice.find(query)
      .populate('batchId', 'name courseType')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      invoices
    });

  } catch (error: unknown) {
    console.error('Error fetching student invoices:', error);
    return NextResponse.json(
      { message: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}
