import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BatchSimple from '@/models/BatchSimple';
import User from '@/models/User';
import { verifyTokenEdge } from '@/lib/auth';

// GET all batches
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyTokenEdge(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Build filter query
    const filter: Record<string, unknown> = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const batches = await BatchSimple.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BatchSimple.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      batches,
      pagination: {
        currentPage: page,
        totalPages,
        totalBatches: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new batch
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyTokenEdge(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      name, 
      description, 
      courseType = 'online',
      duration = 3,
      durationUnit = 'months',
      coverPhoto,
      regularPrice,
      discountPrice,
      currency = 'BDT',
      discountPercentage,
      startDate, 
      endDate, 
      maxStudents = 30,
      prerequisites = [],
      modules = [],
      status = 'upcoming',
      isActive = true,
      isMandatory = true,
      instructor = { name: '', email: '', phone: '', bio: '', avatar: '' },
      tags = [],
      level = 'beginner',
      features = [],
      requirements = [],
      whatYouWillLearn = [],
      slug,
      metaDescription
    } = body;

    // Validate required fields
    if (!name || !startDate || !endDate || !regularPrice) {
      return NextResponse.json({ 
        error: 'Name, start date, end date, and regular price are required' 
      }, { status: 400 });
    }

    // Check if batch name already exists
    const existingBatch = await BatchSimple.findOne({ name });
    if (existingBatch) {
      return NextResponse.json({ 
        error: 'Batch name already exists' 
      }, { status: 400 });
    }

    // Check if slug already exists
    if (slug) {
      const existingSlug = await BatchSimple.findOne({ slug });
      if (existingSlug) {
        return NextResponse.json({ 
          error: 'URL slug already exists' 
        }, { status: 400 });
      }
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json({ 
        error: 'End date must be after start date' 
      }, { status: 400 });
    }

    // Calculate discount percentage if not provided
    let calculatedDiscountPercentage = discountPercentage;
    if (discountPrice && discountPrice > 0 && !discountPercentage) {
      calculatedDiscountPercentage = Math.round(((regularPrice - discountPrice) / regularPrice) * 100);
    }

    // Create new batch
    const batch = new BatchSimple({
      name,
      description,
      courseType,
      duration,
      durationUnit,
      coverPhoto,
      regularPrice,
      discountPrice: discountPrice || 0,
      currency,
      discountPercentage: calculatedDiscountPercentage || 0,
      startDate: start,
      endDate: end,
      maxStudents,
      currentStudents: 0,
      prerequisites,
      modules,
      status,
      isActive,
      isMandatory,
      instructor,
      tags,
      level,
      features,
      requirements,
      whatYouWillLearn,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      metaDescription,
      createdBy: payload.userId
    });

    await batch.save();

    return NextResponse.json({
      message: 'Batch created successfully',
      batch
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}