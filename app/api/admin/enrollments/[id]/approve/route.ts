import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Batch from '@/models/Batch';
import { verifyToken } from '@/lib/auth';

export async function POST(
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

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const enrollmentId = id;

    // Find the enrollment
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student', 'name email')
      .populate('batch', 'name currentStudents maxStudents');

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Check if already approved
    if (enrollment.status === 'approved') {
      return NextResponse.json({ error: 'Enrollment already approved' }, { status: 400 });
    }

    // Check batch capacity
    if (enrollment.batch.currentStudents >= enrollment.batch.maxStudents) {
      return NextResponse.json({ 
        error: 'Batch is full. Cannot approve more enrollments.' 
      }, { status: 400 });
    }

    // Update enrollment status
    enrollment.status = 'approved';
    enrollment.approvedBy = payload.userId;
    enrollment.approvedAt = new Date();
    await enrollment.save();

    // Update batch current students count
    await Batch.findByIdAndUpdate(enrollment.batch._id, {
      $inc: { currentStudents: 1 }
    });

    return NextResponse.json({
      message: 'Enrollment approved successfully',
      enrollment: {
        _id: enrollment._id,
        status: enrollment.status,
        approvedBy: enrollment.approvedBy,
        approvedAt: enrollment.approvedAt
      }
    });

  } catch (error) {
    console.error('Error approving enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to approve enrollment' },
      { status: 500 }
    );
  }
}
