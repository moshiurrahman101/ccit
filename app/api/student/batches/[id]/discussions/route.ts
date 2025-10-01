import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';

// GET /api/student/batches/[id]/discussions - Get discussions for a batch
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

    console.log('=== STUDENT DISCUSSIONS ACCESS CHECK ===');
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

    // For now, return mock data - replace with actual discussion system
    const mockDiscussions = [
      {
        _id: '1',
        title: 'Project Ideas Discussion',
        content: 'Let\'s discuss some interesting project ideas for our final assignment. I was thinking about building an e-commerce website with React and Node.js.',
        author: {
          name: 'John Doe',
          avatar: null
        },
        isPinned: true,
        replies: 5,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        _id: '2',
        title: 'JavaScript Best Practices',
        content: 'Can someone share some JavaScript best practices for writing clean and maintainable code?',
        author: {
          name: 'Jane Smith',
          avatar: null
        },
        isPinned: false,
        replies: 3,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({
      discussions: mockDiscussions,
      total: mockDiscussions.length
    });

  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}
