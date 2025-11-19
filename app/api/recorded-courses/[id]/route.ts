import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecordedCourse from '@/models/RecordedCourse';
import RecordedCourseEnrollment from '@/models/RecordedCourseEnrollment';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Helper function to extract YouTube video ID
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// GET /api/recorded-courses/[id] - Get single course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Check authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    let isAdmin = false;
    let userId: string | null = null;
    
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        isAdmin = ['admin', 'mentor'].includes(payload.role);
        userId = payload.userId;
      }
    }

    // Try to find by slug first, then by ID - try to populate mentors
    let course;
    try {
      // Try with populate first
      course = await RecordedCourse.findOne({ slug: id }).populate('mentors', 'name avatar designation experience expertise');
      if (!course) {
        course = await RecordedCourse.findById(id).populate('mentors', 'name avatar designation experience expertise');
      }
    } catch (populateError: any) {
      // If populate fails (field not in schema), fetch without populate
      if (populateError.name === 'StrictPopulateError' || populateError.message?.includes('Cannot populate path')) {
        console.log('Mentors populate failed, fetching without populate');
        course = await RecordedCourse.findOne({ slug: id });
        if (!course) {
          course = await RecordedCourse.findById(id);
        }
        // Try to manually populate if course has mentor IDs (ObjectIds as strings)
        if (course && course.mentors && course.mentors.length > 0) {
          const firstMentor = course.mentors[0];
          // Check if it's an ObjectId (string) or already populated object
          if (typeof firstMentor === 'string' || firstMentor.toString) {
            try {
              const User = (await import('@/models/User')).default;
              const mentorIds = course.mentors.map((m: any) => m.toString ? m.toString() : m);
              const mentorDocs = await User.find({ _id: { $in: mentorIds } })
                .select('name avatar designation experience expertise');
              if (mentorDocs.length > 0) {
                course.mentors = mentorDocs;
              }
            } catch (e) {
              console.log('Manual populate failed:', e);
            }
          }
        }
      } else {
        throw populateError;
      }
    }
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user has access (enrolled or admin)
    let hasAccess = isAdmin;
    if (!hasAccess && userId) {
      const enrollment = await RecordedCourseEnrollment.findOne({
        student: userId,
        course: course._id,
        status: 'active',
        paymentStatus: 'paid'
      });
      hasAccess = !!enrollment;
    }

    // For public or non-enrolled users, don't expose YouTube URLs
    const courseData = course.toObject();
    if (!hasAccess) {
      // Only show preview videos
      courseData.videos = courseData.videos
        .filter((v: any) => v.isPreview)
        .map((v: any) => ({
          ...v,
          youtubeUrl: undefined // Don't expose URL
        }));
    }

    // Ensure mentors are included in response (even if empty array)
    if (!courseData.mentors) {
      courseData.mentors = [];
    }

    return NextResponse.json({ course: courseData });

  } catch (error) {
    console.error('Error fetching recorded course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/recorded-courses/[id] - Update course (admin only)
export async function PUT(
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
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { z } = await import('zod');
    
    const updateSchema = z.object({
      title: z.string().min(1).max(100).optional(),
      description: z.string().min(1).optional(),
      shortDescription: z.string().max(500).optional(),
      coverPhoto: z.string().optional(),
      regularPrice: z.number().min(0).optional(),
      discountPrice: z.number().min(0).optional(),
      videos: z.array(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        youtubeUrl: z.string().url(),
        duration: z.number().min(0).optional(),
        order: z.number().min(1),
        isPreview: z.boolean().default(false)
      })).optional(),
      category: z.enum(['web-development', 'data-science', 'mobile-development', 'design', 'marketing', 'other']).optional(),
      level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      language: z.enum(['bengali', 'english']).optional(),
      duration: z.number().min(1).optional(),
      durationUnit: z.enum(['hours', 'days', 'weeks']).optional(),
      whatYouWillLearn: z.array(z.string()).optional(),
      requirements: z.array(z.string()).optional(),
      features: z.array(z.string()).optional(),
      slug: z.string().min(1).optional(),
      metaDescription: z.string().max(160).optional(),
      tags: z.array(z.string()).optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      allowDownload: z.boolean().optional(),
      domainRestriction: z.array(z.string()).optional(),
      mentors: z.array(z.string()).optional()
    });

    const validatedData = updateSchema.parse(body);

    const course = await RecordedCourse.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Process videos if provided
    if (validatedData.videos) {
      validatedData.videos = validatedData.videos.map((video) => {
        const videoId = extractYouTubeVideoId(video.youtubeUrl);
        if (!videoId) {
          throw new Error(`Invalid YouTube URL: ${video.youtubeUrl}`);
        }
        return {
          ...video,
          youtubeVideoId: videoId
        };
      });
    }

    // Check slug uniqueness if changed
    if (validatedData.slug && validatedData.slug !== course.slug) {
      const existingSlug = await RecordedCourse.findOne({ slug: validatedData.slug });
      if (existingSlug) {
        return NextResponse.json(
          { error: 'Course with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update course
    Object.assign(course, validatedData);
    await course.save();

    return NextResponse.json({
      message: 'Course updated successfully',
      course
    });

  } catch (error) {
    console.error('Error updating recorded course:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/recorded-courses/[id] - Delete course (admin only)
export async function DELETE(
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
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const course = await RecordedCourse.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if there are enrollments
    const enrollmentCount = await RecordedCourseEnrollment.countDocuments({ course: id });
    if (enrollmentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with existing enrollments. Archive it instead.' },
        { status: 400 }
      );
    }

    await RecordedCourse.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting recorded course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}

