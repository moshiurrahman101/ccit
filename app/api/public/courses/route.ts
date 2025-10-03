import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';

// GET /api/public/courses - Get published courses (public access)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const language = searchParams.get('language') || '';
    const slug = searchParams.get('slug') || '';

    // Build query for published courses only
    const query: any = {
      status: 'published',
      isActive: true
    };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { courseShortcut: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add level filter
    if (level) {
      query.level = level;
    }

    // Add language filter
    if (language) {
      query.language = language;
    }

    // Add slug filter (for single course lookup)
    if (slug) {
      query['marketing.slug'] = slug;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch courses with pagination
    const courses = await Course.find(query)
      .populate('mentors', 'name email avatar designation experience expertise')
      .select('title description shortDescription coverPhoto courseType regularPrice discountPrice discountPercentage courseCode courseShortcut category level language duration durationUnit maxStudents marketing modules whatYouWillLearn requirements features')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const totalCourses = await Course.countDocuments(query);

    return NextResponse.json({
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        totalCourses,
        hasNext: page < Math.ceil(totalCourses / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching public courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
