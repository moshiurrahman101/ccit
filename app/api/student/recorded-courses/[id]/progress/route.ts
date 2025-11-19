import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecordedCourseEnrollment from '@/models/RecordedCourseEnrollment';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const progressSchema = z.object({
  videoId: z.string().min(1, 'Video ID is required'),
  watchedDuration: z.number().min(0, 'Watched duration must be positive'),
  completed: z.boolean()
});

// POST /api/student/recorded-courses/[id]/progress - Update video progress
export async function POST(
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

    // Only students can update progress
    if (payload.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can update progress' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = progressSchema.parse(body);

    // Find enrollment
    const enrollment = await RecordedCourseEnrollment.findOne({
      student: payload.userId,
      course: id,
      status: 'active',
      paymentStatus: 'paid'
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found or not active' },
        { status: 404 }
      );
    }

    // Update video progress
    const progressIndex = enrollment.progress.findIndex(
      (p: any) => p.videoId === validatedData.videoId
    );

    if (progressIndex >= 0) {
      enrollment.progress[progressIndex].watchedDuration = validatedData.watchedDuration;
      enrollment.progress[progressIndex].completed = validatedData.completed;
      enrollment.progress[progressIndex].lastWatchedAt = new Date();
    } else {
      enrollment.progress.push({
        videoId: validatedData.videoId,
        watchedDuration: validatedData.watchedDuration,
        completed: validatedData.completed,
        lastWatchedAt: new Date()
      });
    }

    // Calculate overall progress
    const RecordedCourse = (await import('@/models/RecordedCourse')).default;
    const course = await RecordedCourse.findById(id);
    if (course && course.videos.length > 0) {
      const completedVideos = enrollment.progress.filter((p: any) => p.completed).length;
      enrollment.overallProgress = Math.round((completedVideos / course.videos.length) * 100);
    }

    enrollment.lastAccessed = new Date();
    await enrollment.save();

    return NextResponse.json({
      success: true,
      message: 'Progress updated successfully',
      enrollment: {
        overallProgress: enrollment.overallProgress,
        progress: enrollment.progress
      }
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

