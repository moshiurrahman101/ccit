import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Enrollment } from '@/models/Enrollment';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';

// PUT update student payment status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Try to get token from Authorization header first
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Fallback to cookies
      token = request.cookies.get('auth-token')?.value;
    }

    if (!token || token === 'null' || token === 'undefined') {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Use verifyToken (server-side) since we're not in edge runtime
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin or mentor
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !['admin', 'mentor'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { paymentStatus, paidAmount, dueAmount } = body;

    if (!paymentStatus) {
      return NextResponse.json({ error: 'Payment status is required' }, { status: 400 });
    }

    const validStatuses = ['paid', 'partial', 'due', 'overdue'];
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 });
    }

    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'শিক্ষার্থী পাওয়া যায়নি' }, { status: 404 });
    }

    // Initialize studentInfo if it doesn't exist (for historical students)
    if (!student.studentInfo) {
      student.studentInfo = {
        paymentInfo: {}
      };
    }
    if (!student.studentInfo.paymentInfo) {
      student.studentInfo.paymentInfo = {};
    }

    student.studentInfo.paymentInfo.paymentStatus = paymentStatus;
    if (paidAmount !== undefined) {
      student.studentInfo.paymentInfo.paidAmount = paidAmount;
    }
    if (dueAmount !== undefined) {
      student.studentInfo.paymentInfo.dueAmount = dueAmount;
    }

    await student.save();

    // Also update enrollments if they exist (sync with enrollment system)
    const enrollments = await Enrollment.find({ student: id });
    if (enrollments.length > 0) {
      // Map payment status to enrollment paymentStatus
      let enrollmentPaymentStatus: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded' = 'pending';
      if (paymentStatus === 'paid') {
        enrollmentPaymentStatus = 'paid';
      } else if (paymentStatus === 'partial') {
        enrollmentPaymentStatus = 'partial';
      }

      // Update all active enrollments
      await Enrollment.updateMany(
        { 
          student: id,
          status: { $in: ['approved', 'pending'] }
        },
        { 
          $set: { 
            paymentStatus: enrollmentPaymentStatus 
          } 
        }
      );
    }

    // Update invoices if they exist
    const invoices = await Invoice.find({ studentId: id, status: { $ne: 'cancelled' } });
    if (invoices.length > 0) {
      for (const invoice of invoices) {
        if (paymentStatus === 'paid') {
          invoice.paidAmount = invoice.finalAmount;
          invoice.remainingAmount = 0;
          invoice.status = 'paid';
        } else if (paymentStatus === 'partial' && paidAmount) {
          invoice.paidAmount = paidAmount;
          invoice.remainingAmount = invoice.finalAmount - paidAmount;
          invoice.status = invoice.remainingAmount <= 0 ? 'paid' : 'partial';
        }
        await invoice.save();
      }
    }

    return NextResponse.json({
      message: 'পেমেন্ট স্ট্যাটাস সফলভাবে আপডেট হয়েছে',
      student: {
        _id: student._id,
        studentInfo: {
          paymentInfo: student.studentInfo.paymentInfo
        }
      }
    });

  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'পেমেন্ট স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

