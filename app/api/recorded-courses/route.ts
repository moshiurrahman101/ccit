import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecordedCourse from '@/models/RecordedCourse';
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

// Validation schema
const createRecordedCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(500, 'Short description too long').optional(),
  coverPhoto: z.string().optional(),
  regularPrice: z.number().min(0, 'Price cannot be negative'),
  discountPrice: z.number().min(0, 'Discount price cannot be negative').optional(),
  videos: z.array(z.object({
    title: z.string().min(1, 'Video title is required'),
    description: z.string().optional(),
    youtubeUrl: z.string().url('Invalid YouTube URL'),
    duration: z.number().min(0).optional(),
    order: z.number().min(1, 'Order must be at least 1'),
    isPreview: z.boolean().default(false)
  })),
  category: z.enum(['web-development', 'data-science', 'mobile-development', 'design', 'marketing', 'other']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.enum(['bengali', 'english']).default('bengali'),
  duration: z.number().min(1, 'Duration must be at least 1'),
  durationUnit: z.enum(['hours', 'days', 'weeks']).default('hours'),
  whatYouWillLearn: z.array(z.string()),
  requirements: z.array(z.string()),
  features: z.array(z.string()),
  slug: z.string().min(1, 'Slug is required'),
  metaDescription: z.string().max(160, 'Meta description too long').optional(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  allowDownload: z.boolean().default(false),
  domainRestriction: z.array(z.string()).optional(),
  mentors: z.array(z.string()).optional()
});

const updateRecordedCourseSchema = createRecordedCourseSchema.partial();

// GET /api/recorded-courses - Get all recorded courses (admin) or published courses (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const isPublic = searchParams.get('public') === 'true';

    // Check authentication for admin access
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    let isAdmin = false;
    if (token) {
      const payload = verifyToken(token);
      isAdmin = !!payload && ['admin', 'mentor'].includes(payload.role);
    }

    // Build query
    const query: Record<string, any> = {};
    
    // Public access only shows published courses
    if (isPublic || !isAdmin) {
      query.status = 'published';
      query.isActive = true;
    } else {
      // Admin can see all courses
      if (status) {
        query.status = status;
      }
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }

    // Get courses - check if mentors path exists before populating
    // Check if mentors path exists in schema before populating
    const schema = RecordedCourse.schema;
    let courses;
    
    if (schema.path('mentors')) {
      try {
        courses = await RecordedCourse.find(query)
          .select(isPublic ? '-videos.youtubeUrl' : '')
          .populate('mentors', 'name avatar designation experience expertise')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      } catch (populateError: any) {
        // If populate fails, fetch without populate
        console.log('Populate failed, fetching without mentors:', populateError.message);
        courses = await RecordedCourse.find(query)
          .select(isPublic ? '-videos.youtubeUrl' : '')
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);
      }
    } else {
      // Mentors field doesn't exist in schema yet, fetch without populate
      courses = await RecordedCourse.find(query)
        .select(isPublic ? '-videos.youtubeUrl' : '')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    }

    // Get total count
    const totalCourses = await RecordedCourse.countDocuments(query);
    const totalPages = Math.ceil(totalCourses / limit);

    return NextResponse.json({
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        totalCourses,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching recorded courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/recorded-courses - Create new recorded course (admin only)
export async function POST(request: NextRequest) {
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
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createRecordedCourseSchema.parse(body);

    // Extract YouTube video IDs and validate URLs
    const processedVideos = validatedData.videos.map((video) => {
      const videoId = extractYouTubeVideoId(video.youtubeUrl);
      if (!videoId) {
        throw new Error(`Invalid YouTube URL: ${video.youtubeUrl}`);
      }
      return {
        ...video,
        youtubeVideoId: videoId
      };
    });

    // Check if slug already exists
    const existingSlug = await RecordedCourse.findOne({ slug: validatedData.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Course with this slug already exists' },
        { status: 409 }
      );
    }

    // Create course
    const course = new RecordedCourse({
      ...validatedData,
      videos: processedVideos,
      createdBy: payload.userId
    });

    await course.save();

    return NextResponse.json({
      message: 'Recorded course created successfully',
      course
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating recorded course:', error);
    
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
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

