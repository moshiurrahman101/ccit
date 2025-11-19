import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecordedCourse from '@/models/RecordedCourse';
import RecordedCourseEnrollment from '@/models/RecordedCourseEnrollment';
import { verifyToken } from '@/lib/auth';

// GET /api/recorded-courses/[id]/video-access - Get secure video access token
// This endpoint returns the YouTube video ID only if user has access
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId'); // YouTube video ID

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Get authentication (optional for preview videos)
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    let userId: string | null = null;
    let isAdmin = false;
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        userId = payload.userId;
        isAdmin = ['admin', 'mentor'].includes(payload.role);
      }
    }

    // Get course (try slug first, then ID)
    let course = await RecordedCourse.findOne({ slug: id });
    if (!course) {
      course = await RecordedCourse.findById(id);
    }
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Find the video
    const video = course.videos.find((v: any) => v.youtubeVideoId === videoId);
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found in course' },
        { status: 404 }
      );
    }

    // Check access
    let hasAccess = false;

    // Preview videos are accessible to everyone (no authentication required)
    if (video.isPreview) {
      hasAccess = true;
    }
    // Admins always have access
    else if (isAdmin) {
      hasAccess = true;
    }
    // Check enrollment for paid videos (requires authentication)
    else {
      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required for this video' },
          { status: 401 }
        );
      }
      
      const enrollment = await RecordedCourseEnrollment.findOne({
        student: userId,
        course: course._id,
        status: 'active',
        paymentStatus: 'paid'
      });

      if (enrollment) {
        // Check if access has expired
        if (enrollment.accessExpiresAt && enrollment.accessExpiresAt < new Date()) {
          return NextResponse.json(
            { error: 'Course access has expired' },
            { status: 403 }
          );
        }
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied. Please enroll in this course.' },
        { status: 403 }
      );
    }

    // Return only the video ID (not the full URL) for security
    // The frontend will construct the embed URL
    return NextResponse.json({
      videoId: video.youtubeVideoId,
      title: video.title,
      description: video.description,
      duration: video.duration,
      isPreview: video.isPreview
    });

  } catch (error) {
    console.error('Error getting video access:', error);
    return NextResponse.json(
      { error: 'Failed to get video access' },
      { status: 500 }
    );
  }
}

