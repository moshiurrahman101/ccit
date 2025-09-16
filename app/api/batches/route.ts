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
    const { name, description, startDate, endDate, maxStudents = 30 } = body;

    // Validate required fields
    if (!name || !startDate || !endDate) {
      return NextResponse.json({ 
        error: 'Name, start date, and end date are required' 
      }, { status: 400 });
    }

    // Check if batch name already exists
    const existingBatch = await BatchSimple.findOne({ name });
    if (existingBatch) {
      return NextResponse.json({ 
        error: 'Batch name already exists' 
      }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return NextResponse.json({ 
        error: 'End date must be after start date' 
      }, { status: 400 });
    }

    // Create new batch
    const batch = new BatchSimple({
      name,
      description,
      startDate: start,
      endDate: end,
      maxStudents,
      currentStudents: 0,
      status: 'upcoming',
      isActive: true
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