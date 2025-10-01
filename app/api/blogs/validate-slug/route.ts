import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// POST /api/blogs/validate-slug - Check if slug is available
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { slug, excludeId } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
      });
    }

    // Build query
    const query: any = { slug };
    
    // If excludeId is provided (for editing), exclude that blog from the check
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // Check if slug exists
    const existingBlog = await Blog.findOne(query);

    if (existingBlog) {
      return NextResponse.json({
        available: false,
        message: 'This slug is already taken'
      });
    }

    return NextResponse.json({
      available: true,
      message: 'Slug is available'
    });

  } catch (error) {
    console.error('Error validating slug:', error);
    return NextResponse.json(
      { error: 'Failed to validate slug' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/validate-slug?slug=example-slug - Check if slug is available (alternative endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const excludeId = searchParams.get('excludeId');

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        message: 'Slug can only contain lowercase letters, numbers, and hyphens'
      });
    }

    // Build query
    const query: any = { slug };
    
    // If excludeId is provided (for editing), exclude that blog from the check
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // Check if slug exists
    const existingBlog = await Blog.findOne(query);

    if (existingBlog) {
      return NextResponse.json({
        available: false,
        message: 'This slug is already taken'
      });
    }

    return NextResponse.json({
      available: true,
      message: 'Slug is available'
    });

  } catch (error) {
    console.error('Error validating slug:', error);
    return NextResponse.json(
      { error: 'Failed to validate slug' },
      { status: 500 }
    );
  }
}
