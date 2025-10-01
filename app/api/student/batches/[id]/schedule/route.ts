import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';

// GET /api/student/batches/[id]/schedule - Get class schedule for a batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || payload.role !== 'student') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Check if student is enrolled in this batch
    const enrollment = await Enrollment.findOne({
      student: payload.userId,
      batch: id
    });

    console.log('=== STUDENT SCHEDULE ACCESS CHECK ===');
    console.log('Student ID:', payload.userId);
    console.log('Batch ID:', id);
    console.log('Enrollment found:', !!enrollment);
    if (enrollment) {
      console.log('Enrollment status:', enrollment.status);
      console.log('Enrollment payment status:', enrollment.paymentStatus);
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Access denied - not enrolled in this batch' },
        { status: 403 }
      );
    }

    // Temporarily allow access for all enrollment statuses for debugging
    // if (!['approved', 'completed'].includes(enrollment.status)) {
    //   return NextResponse.json(
    //     { error: `Access denied - enrollment status: ${enrollment.status}` },
    //     { status: 403 }
    //   );
    // }

    // Fetch schedules for this batch
    const schedules = await Schedule.find({ batchId: id })
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .lean();

    return NextResponse.json({
      schedules: schedules,
      total: schedules.length
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}
