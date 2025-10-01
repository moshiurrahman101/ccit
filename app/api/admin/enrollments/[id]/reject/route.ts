import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const rejectEnrollmentSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required')
});

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

    const body = await request.json();
    const validatedData = rejectEnrollmentSchema.parse(body);

    await connectDB();

    const { id } = await params;
    const enrollmentId = id;

    // Find the enrollment
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student', 'name email')
      .populate('batch', 'name');

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Check if already processed
    if (enrollment.status === 'approved') {
      return NextResponse.json({ error: 'Cannot reject an approved enrollment' }, { status: 400 });
    }

    if (enrollment.status === 'rejected') {
      return NextResponse.json({ error: 'Enrollment already rejected' }, { status: 400 });
    }

    // Update enrollment status
    enrollment.status = 'rejected';
    enrollment.rejectionReason = validatedData.reason;
    enrollment.approvedBy = payload.userId;
    enrollment.approvedAt = new Date();
    await enrollment.save();

    return NextResponse.json({
      message: 'Enrollment rejected successfully',
      enrollment: {
        _id: enrollment._id,
        status: enrollment.status,
        rejectionReason: enrollment.rejectionReason,
        approvedBy: enrollment.approvedBy,
        approvedAt: enrollment.approvedAt
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues
      }, { status: 400 });
    }

    console.error('Error rejecting enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to reject enrollment' },
      { status: 500 }
    );
  }
}
