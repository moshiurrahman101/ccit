import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import User from '@/models/User';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: enrollmentId } = await params;
    const { action } = await request.json(); // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ message: 'ভুল অ্যাকশন' }, { status: 400 });
    }

    // Get admin user from token (implement proper JWT verification)
    const adminUserId = 'admin-user-id'; // Replace with actual admin ID from token

    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return NextResponse.json({ message: 'নিবন্ধন পাওয়া যায়নি' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      approvedBy: adminUserId,
      approvedAt: new Date()
    };

    if (action === 'approve') {
      updateData.status = 'approved';
      updateData.paymentStatus = 'paid';
    } else {
      updateData.status = 'rejected';
    }

    const updatedEnrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      updateData,
      { new: true }
    ).populate('student', 'name email phone')
     .populate('course', 'title price')
     .populate('batch', 'name');

    return NextResponse.json({
      message: action === 'approve' ? 'নিবন্ধন অনুমোদিত' : 'নিবন্ধন প্রত্যাখ্যাত',
      enrollment: updatedEnrollment
    });

  } catch (error) {
    console.error('Enrollment approval error:', error);
    return NextResponse.json(
      { message: 'সার্ভার এরর' },
      { status: 500 }
    );
  }
}
