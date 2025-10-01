import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas (same as admin)
const createBatchSchema = z.object({
  name: z.string().min(1, 'Batch name is required').max(100, 'Batch name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  coverPhoto: z.string().optional(),
  courseType: z.enum(['online', 'offline']),
  regularPrice: z.number().min(0, 'Price cannot be negative'),
  discountPrice: z.number().min(0, 'Discount price cannot be negative').optional(),
  mentorId: z.string().min(1, 'Mentor is required'),
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
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  maxStudents: z.number().min(1, 'Max students must be at least 1').default(30),
  currentStudents: z.number().min(0, 'Current students cannot be negative').default(0),
  marketing: z.object({
    slug: z.string().min(1, 'Slug is required'),
    metaDescription: z.string().max(160, 'Meta description too long').optional(),
    tags: z.array(z.string())
  }),
  status: z.enum(['draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled']).default('draft')
});

const updateBatchSchema = createBatchSchema.partial();

// GET /api/mentor/batches - Get mentor's batches only
export async function GET(request: NextRequest) {
  try {
    console.log('=== MENTOR BATCHES API CALLED ===');
    console.log('Request URL:', request.url);
    
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token extracted:', token.substring(0, 20) + '...');
    
    const payload = verifyToken(token);
    console.log('Token payload:', payload);
    
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      console.log('Insufficient permissions. Role:', payload?.role);
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get mentor information
    console.log('Looking for mentor with userId:', payload.userId);
    const mentor = await Mentor.findOne({ userId: payload.userId });
    console.log('Found mentor:', mentor ? 'Yes' : 'No');
    
    if (!mentor && payload.role !== 'admin') {
      console.log('Mentor profile not found for user:', payload.userId);
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const courseType = searchParams.get('courseType') || '';

    // Build query - mentors can only see their own batches or batches where they are assigned
    const query: Record<string, any> = {};
    
    // If user is mentor (not admin), restrict to their batches only
    if (payload.role === 'mentor' && mentor) {
      query.$or = [
        { createdBy: payload.userId }, // Batches created by this mentor
        { mentorId: mentor._id }        // Batches where this mentor is assigned
      ];
    }
    
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { 'marketing.tags': { $in: [new RegExp(search, 'i')] } }
          ]
        }
      ];
      delete query.$or; // Remove the original $or since we're using $and
    }
    
    if (status) {
      query.status = status;
    }
    
    if (courseType) {
      query.courseType = courseType;
    }

    // Get batches with mentor population
    const batches = await Batch.find(query)
      .populate({
        path: 'mentorId',
        select: 'name email avatar designation experience expertise',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Handle missing mentors by setting mentorId to null
    const processedBatches = batches.map(batch => {
      if (!batch.mentorId || !batch.mentorId._id) {
        return {
          ...batch.toObject(),
          mentorId: null
        };
      }
      return batch;
    });

    // Get total count
    const totalBatches = await Batch.countDocuments(query);
    const totalPages = Math.ceil(totalBatches / limit);

    return NextResponse.json({
      batches: processedBatches,
      pagination: {
        currentPage: page,
        totalPages,
        totalBatches,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching mentor batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// POST /api/mentor/batches - Create new batch (mentor can only assign to themselves)
export async function POST(request: NextRequest) {
  try {
    console.log('=== MENTOR BATCHES POST API CALLED ===');
    
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token extracted:', token.substring(0, 20) + '...');
    
    const payload = verifyToken(token);
    console.log('Token payload:', payload);
    
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      console.log('Insufficient permissions. Role:', payload?.role);
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get mentor information
    console.log('Looking for mentor with userId:', payload.userId);
    const mentor = await Mentor.findOne({ userId: payload.userId });
    console.log('Found mentor:', mentor ? 'Yes' : 'No');
    
    if (!mentor && payload.role !== 'admin') {
      console.log('Mentor profile not found for user:', payload.userId);
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = createBatchSchema.parse(body);

    // For mentors, force mentorId to be their own mentor ID
    if (payload.role === 'mentor' && mentor) {
      validatedData.mentorId = mentor._id.toString();
    }

    // Check if mentor exists
    const assignedMentor = await Mentor.findById(validatedData.mentorId);
    if (!assignedMentor) {
      return NextResponse.json(
        { error: 'Mentor not found' },
        { status: 404 }
      );
    }

    // Check if batch name already exists
    const existingBatch = await Batch.findOne({ name: validatedData.name });
    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch with this name already exists' },
        { status: 409 }
      );
    }

    // Check if slug already exists
    const existingSlug = await Batch.findOne({ 'marketing.slug': validatedData.marketing.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Batch with this slug already exists' },
        { status: 409 }
      );
    }

    // Create batch
    const batch = new Batch({
      ...validatedData,
      createdBy: payload.userId
    });

    await batch.save();
    await batch.populate('mentorId', 'name email avatar designation experience expertise');

    return NextResponse.json({
      message: 'Batch created successfully',
      batch
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating batch:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create batch' },
      { status: 500 }
    );
  }
}
