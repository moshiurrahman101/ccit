import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET /api/blogs - Get all blogs (public or admin)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const admin = searchParams.get('admin') === 'true';

    // Build query
    const query: Record<string, any> = {};
    
    // Admin can see all blogs, public can only see published
    if (!admin) {
      query.status = 'published';
    } else if (status !== 'all') {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get total count
    const total = await Blog.countDocuments(query);

    // Get blogs with pagination
    const blogs = await Blog.find(query)
      .select('-content') // Exclude content for list view
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    // Get categories and tags for filtering
    const categories = await Blog.distinct('category', { status: 'published' });
    const tags = await Blog.distinct('tags', { status: 'published' });

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories,
        tags
      }
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create new blog (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      featuredImage,
      author,
      category,
      tags,
      seo,
      status = 'draft'
    } = body;

    // Validation
    if (!title || !excerpt || !content || !author?.name || !author?.email || !category) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }

    // Generate slug from title
    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Ensure unique slug
    let originalSlug = slug;
    let counter = 1;
    while (await Blog.findOne({ slug })) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    // Create blog
    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      author,
      category,
      tags: tags || [],
      seo: seo || {},
      status
    });

    await blog.save();

    return NextResponse.json({
      message: 'Blog created successfully',
      blog
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating blog:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
