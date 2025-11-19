import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecordedCourseEnrollment from '@/models/RecordedCourseEnrollment';
import RecordedCourse from '@/models/RecordedCourse';
import { verifyToken } from '@/lib/auth';

// GET /api/student/recorded-courses - Get student's enrolled recorded courses
export async function GET(request: NextRequest) {
  try {
    await connectDB();

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

    // Get all enrollments for this student with active status and paid payment
    const enrollments = await RecordedCourseEnrollment.find({
      student: payload.userId,
      status: 'active',
      paymentStatus: 'paid'
    }).populate({
      path: 'course',
      select: 'title description coverPhoto regularPrice discountPrice videos category level duration durationUnit slug'
    }).sort({ enrollmentDate: -1 });

    // Format the response
    const courses = enrollments.map((enrollment: any) => ({
      enrollment: {
        _id: enrollment._id,
        enrollmentDate: enrollment.enrollmentDate,
        status: enrollment.status,
        paymentStatus: enrollment.paymentStatus,
        overallProgress: enrollment.overallProgress,
        lastAccessed: enrollment.lastAccessed,
        progress: enrollment.progress
      },
      course: enrollment.course ? {
        _id: enrollment.course._id,
        title: enrollment.course.title,
        description: enrollment.course.description,
        coverPhoto: enrollment.course.coverPhoto,
        regularPrice: enrollment.course.regularPrice,
        discountPrice: enrollment.course.discountPrice,
        videos: enrollment.course.videos || [],
        category: enrollment.course.category,
        level: enrollment.course.level,
        duration: enrollment.course.duration,
        durationUnit: enrollment.course.durationUnit,
        slug: enrollment.course.slug
      } : null
    })).filter((item: any) => item.course !== null);

    return NextResponse.json({
      success: true,
      courses
    });

  } catch (error) {
    console.error('Error fetching student recorded courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

