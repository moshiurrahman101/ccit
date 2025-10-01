import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, batchId, status, paymentStatus } = body;

    if (!studentId || !batchId || !status) {
      return NextResponse.json({ 
        message: 'Student ID, Batch ID, and status are required' 
      }, { status: 400 });
    }

    // Find and update the enrollment
    const enrollment = await Enrollment.findOneAndUpdate(
      { 
        student: studentId, 
        batch: batchId 
      },
      { 
        status: status,
        paymentStatus: paymentStatus || status === 'approved' ? 'paid' : 'pending',
        approvedBy: payload.userId,
        approvedAt: new Date()
      },
      { new: true }
    ).populate('student', 'name email').populate('batch', 'name');

    if (!enrollment) {
      return NextResponse.json({ 
        message: 'Enrollment not found' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Enrollment status updated to ${status}`,
      enrollment: {
        _id: enrollment._id,
        student: enrollment.student,
        batch: enrollment.batch,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        approvedAt: enrollment.approvedAt
      }
    });

  } catch (error: unknown) {
    console.error('Error updating enrollment status:', error);
    return NextResponse.json(
      { message: 'Failed to update enrollment status' },
      { status: 500 }
    );
  }
}
