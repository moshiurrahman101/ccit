import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Mentor from '@/models/Mentor';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const createCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().max(500, 'Short description too long').optional(),
  coverPhoto: z.string().optional(),
  courseType: z.enum(['online', 'offline', 'both']),
  regularPrice: z.number().min(0, 'Price cannot be negative'),
  discountPrice: z.number().min(0, 'Discount price cannot be negative').optional(),
  mentors: z.array(z.string().min(1, 'Mentor ID is required')),
  modules: z.array(z.object({
    title: z.string().min(1, 'Module title is required'),
    description: z.string().min(1, 'Module description is required'),
    duration: z.number().min(0.5, 'Module duration must be at least 0.5 hours'),
    order: z.number().min(1, 'Order must be at least 1')
  })),
  whatYouWillLearn: z.array(z.string()),
  requirements: z.array(z.string()),
  features: z.array(z.string()),
  duration: z.number().min(1, 'Duration must be at least 1'),
  durationUnit: z.enum(['days', 'weeks', 'months', 'years']),
  maxStudents: z.number().min(1, 'Max students must be at least 1').default(30),
  marketing: z.object({
    slug: z.string().min(1, 'Slug is required'),
    metaDescription: z.string().max(160, 'Meta description too long').optional(),
    tags: z.array(z.string())
  }),
  category: z.enum(['web-development', 'data-science', 'mobile-development', 'design', 'marketing', 'other']),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.enum(['bengali', 'english']).default('bengali'),
  courseCode: z.string().min(1, 'Course code is required').max(10, 'Course code too long'),
  courseShortcut: z.string().min(1, 'Course shortcut is required').max(50, 'Course shortcut too long'),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
});

const updateCourseSchema = createCourseSchema.partial();

// GET /api/courses - Get all courses with pagination and filters (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';

    // Build query
    const query: Record<string, any> = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { 'marketing.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (level) {
      query.level = level;
    }

    // Get courses with mentor population
    const courses = await Course.find(query)
      .populate({
        path: 'mentors',
        select: 'name email avatar designation experience expertise',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count
    const totalCourses = await Course.countDocuments(query);
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
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
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
    const validatedData = createCourseSchema.parse(body);

    // Check if mentors exist
    const mentors = await Mentor.find({ _id: { $in: validatedData.mentors } });
    if (mentors.length !== validatedData.mentors.length) {
      return NextResponse.json(
        { error: 'One or more mentors not found' },
        { status: 404 }
      );
    }

    // Check if course title already exists
    const existingCourse = await Course.findOne({ title: validatedData.title });
    if (existingCourse) {
      return NextResponse.json(
        { error: 'Course with this title already exists' },
        { status: 409 }
      );
    }

    // Check if course code already exists
    const existingCode = await Course.findOne({ courseCode: validatedData.courseCode });
    if (existingCode) {
      return NextResponse.json(
        { error: 'Course with this code already exists' },
        { status: 409 }
      );
    }

    // Check if slug already exists
    const existingSlug = await Course.findOne({ 'marketing.slug': validatedData.marketing.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Course with this slug already exists' },
        { status: 409 }
      );
    }

    // Create course
    const course = new Course({
      ...validatedData,
      createdBy: payload.userId
    });

    await course.save();
    await course.populate('mentors', 'name email avatar designation experience expertise');

    return NextResponse.json({
      message: 'Course created successfully',
      course
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating course:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create course' },
      { status: 500 }
    );
  }
}
