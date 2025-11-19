import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecordedCourseEnrollment from '@/models/RecordedCourseEnrollment';
import RecordedCourse from '@/models/RecordedCourse';
import { verifyToken } from '@/lib/auth';

// GET /api/student/recorded-courses/[id] - Get single enrolled course for student
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only students can access this
    if (payload.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access this endpoint' },
        { status: 403 }
      );
    }

    // Check if student is enrolled in this course
    const enrollment = await RecordedCourseEnrollment.findOne({
      student: payload.userId,
      course: id,
      status: 'active',
      paymentStatus: 'paid'
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course or payment is pending' },
        { status: 403 }
      );
    }

    // Get course details
    const course = await RecordedCourse.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Return course with full video access (student is enrolled and paid)
    return NextResponse.json({
      success: true,
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        coverPhoto: course.coverPhoto,
        regularPrice: course.regularPrice,
        discountPrice: course.discountPrice,
        videos: course.videos, // Full access to all videos
        whatYouWillLearn: course.whatYouWillLearn,
        requirements: course.requirements,
        category: course.category,
        level: course.level,
        duration: course.duration,
        durationUnit: course.durationUnit
      },
      enrollment: {
        _id: enrollment._id,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        overallProgress: enrollment.overallProgress,
        progress: enrollment.progress
      }
    });

  } catch (error) {
    console.error('Error fetching student recorded course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

