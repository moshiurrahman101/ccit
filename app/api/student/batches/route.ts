import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import User from '@/models/User';
import Batch from '@/models/Batch';
import { verifyToken } from '@/lib/auth';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Build query
    const query: any = {
      student: payload.userId
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // First, get enrollments with batch populated
    const enrollments = await Enrollment.find(query)
      .populate({
        path: 'batch',
        model: Batch,
        select: 'name description coverPhoto courseType regularPrice discountPrice mentorId duration durationUnit startDate endDate maxStudents currentStudents status modules'
      })
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Then manually populate mentor information for each enrollment
    for (let enrollment of enrollments) {
      if (enrollment.batch && enrollment.batch.mentorId) {
        const mentor = await User.findById(enrollment.batch.mentorId)
          .select('name avatar designation')
          .lean();
        
        if (mentor) {
          enrollment.batch.mentorId = mentor;
          console.log('Mentor populated for enrollment:', (mentor as any).name);
        } else {
          console.log('Mentor not found for ID:', enrollment.batch.mentorId);
          // Set a default mentor object if mentor doesn't exist
          enrollment.batch.mentorId = {
            _id: enrollment.batch.mentorId,
            name: 'Mentor Information Unavailable',
            designation: 'Contact Admin'
          };
        }
      }
    }

    const total = await Enrollment.countDocuments(query);

    console.log('=== STUDENT BATCH API DEBUG ===');
    console.log('Query:', query);
    console.log('Found enrollments:', enrollments.length);
    if (enrollments.length > 0) {
      console.log('First enrollment batch:', enrollments[0].batch);
      console.log('First enrollment mentorId:', enrollments[0].batch?.mentorId);
      console.log('First enrollment mentorId type:', typeof enrollments[0].batch?.mentorId);
      console.log('Is mentorId populated?', enrollments[0].batch?.mentorId && typeof enrollments[0].batch?.mentorId === 'object');
    }

    return NextResponse.json({
      success: true,
      batches: enrollments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching student batches:', error);
    return NextResponse.json(
      { message: 'Failed to fetch student batches' },
      { status: 500 }
    );
  }
}