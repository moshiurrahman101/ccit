import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId') || '68da85325d8c3b1cb6170a8d';
    const batchId = searchParams.get('batchId') || '68ceda1b24d6e204a4d297b9';

    // Get current status of all related records
    const user = await User.findById(studentId).select('name email approvalStatus');
    const enrollment = await Enrollment.findOne({ student: studentId, batch: batchId });
    const payments = await Payment.find({ studentId, batchId });

    return NextResponse.json({
      success: true,
      debug: {
        studentId,
        batchId,
        user: {
          name: user?.name,
          email: user?.email,
          approvalStatus: user?.approvalStatus
        },
        enrollment: {
          status: enrollment?.status,
          paymentStatus: enrollment?.paymentStatus,
          amount: enrollment?.amount,
          enrollmentDate: enrollment?.enrollmentDate
        },
        payments: payments.map(p => ({
          id: p._id,
          amount: p.amount,
          method: p.paymentMethod,
          status: p.status,
          verificationStatus: p.verificationStatus,
          submittedAt: p.submittedAt
        }))
      }
    });

  } catch (error: unknown) {
    console.error('Error in test payment approval:', error);
    return NextResponse.json(
      { message: 'Failed to test payment approval' },
      { status: 500 }
    );
  }
}

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
    const { studentId, batchId, action } = body;

    if (!studentId || !batchId || !action) {
      return NextResponse.json({ 
        message: 'Student ID, Batch ID, and action are required' 
      }, { status: 400 });
    }

    let result: any = {};

    if (action === 'approve_student') {
      // Approve student
      const userUpdate = await User.findByIdAndUpdate(
        studentId,
        { 
          approvalStatus: 'approved',
          approvedBy: payload.userId,
          approvalDate: new Date()
        },
        { new: true }
      );

      const enrollmentUpdate = await Enrollment.updateMany(
        { student: studentId, status: 'pending' },
        { 
          status: 'approved',
          approvedBy: payload.userId,
          approvedAt: new Date()
        }
      );

      result = {
        userApproved: userUpdate?.approvalStatus,
        enrollmentsUpdated: enrollmentUpdate.modifiedCount
      };
    }

    if (action === 'verify_payment') {
      // Find and verify payment
      const payment = await Payment.findOne({ studentId, batchId, verificationStatus: 'pending' });
      if (payment) {
        await Payment.findByIdAndUpdate(payment._id, {
          status: 'verified',
          verificationStatus: 'verified',
          verifiedBy: payload.userId,
          verifiedAt: new Date()
        });

        const enrollmentUpdate = await Enrollment.updateMany(
          { student: studentId, batch: batchId },
          { 
            status: 'approved',
            paymentStatus: 'paid',
            approvedBy: payload.userId,
            approvedAt: new Date()
          }
        );

        result = {
          paymentVerified: true,
          paymentId: payment._id,
          enrollmentsUpdated: enrollmentUpdate.modifiedCount
        };
      } else {
        result = { paymentVerified: false, message: 'No pending payment found' };
      }
    }

    if (action === 'reset_all') {
      // Reset to pending status
      await User.findByIdAndUpdate(studentId, { approvalStatus: 'pending' });
      await Enrollment.updateMany(
        { student: studentId, batch: batchId },
        { status: 'pending', paymentStatus: 'pending' }
      );
      await Payment.updateMany(
        { studentId, batchId },
        { status: 'pending', verificationStatus: 'pending' }
      );

      result = { reset: true };
    }

    return NextResponse.json({
      success: true,
      message: `Action ${action} completed`,
      result
    });

  } catch (error: unknown) {
    console.error('Error in test payment approval:', error);
    return NextResponse.json(
      { message: 'Failed to test payment approval' },
      { status: 500 }
    );
  }
}
