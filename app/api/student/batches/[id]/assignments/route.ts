import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';

// GET /api/student/batches/[id]/assignments - Get assignments for a batch
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

    console.log('=== STUDENT ASSIGNMENTS ACCESS CHECK ===');
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

    // TODO: Implement actual assignment system
    // For now, return empty assignments array
    return NextResponse.json({
      assignments: [],
      total: 0,
      message: 'Assignment system will be available soon'
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}
