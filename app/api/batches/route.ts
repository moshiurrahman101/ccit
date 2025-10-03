import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import Course from '@/models/Course';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

// Validation schemas
const createBatchSchema = z.object({
  courseId: z.string().min(1, 'Course is required'),
  name: z.string().min(1, 'Batch name is required').max(100, 'Batch name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  courseType: z.enum(['online', 'offline']),
  mentorId: z.string().optional(),
  additionalMentors: z.array(z.string()).optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().transform(str => new Date(str)),
  maxStudents: z.number().min(1, 'Max students must be at least 1').default(30),
  currentStudents: z.number().min(0, 'Current students cannot be negative').default(0),
  regularPrice: z.number().min(0, 'Regular price cannot be negative').optional(),
  discountPrice: z.number().min(0, 'Discount price cannot be negative').optional(),
  status: z.enum(['draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled']).default('draft')
});

const updateBatchSchema = createBatchSchema.partial();

// GET /api/batches - Get all batches with pagination and filters (admin only)
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
    const courseType = searchParams.get('courseType') || '';
    const mentorId = searchParams.get('mentorId') || '';

    // Build query
    const query: Record<string, any> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'marketing.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (courseType) {
      query.courseType = courseType;
    }
    
    if (mentorId) {
      query.mentorId = mentorId;
    }

    // Get batches with course and mentor population
    const batches = await Batch.find(query)
      .populate({
        path: 'courseId',
        select: 'title courseCode courseShortcut regularPrice discountPrice coverPhoto',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'mentorId',
        select: 'name email avatar designation experience expertise',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'additionalMentors',
        select: 'name email avatar designation experience expertise',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    console.log('Raw batches from DB:', batches.length);
    console.log('Sample batch mentor data:', batches[0]?.mentorId);

    // Process batches to handle missing data
    const processedBatches = batches.map(batch => {
      const batchObj = batch.toObject();
      
      // Handle missing course
      if (!batchObj.courseId || !batchObj.courseId._id) {
        console.log(`Setting courseId to null for batch: ${batchObj.name}`);
        batchObj.courseId = null;
      }
      
      // Handle missing primary mentor
      if (!batchObj.mentorId || !batchObj.mentorId._id) {
        console.log(`Setting mentorId to null for batch: ${batchObj.name}`);
        batchObj.mentorId = null;
      }
      
      // Handle missing additional mentors
      if (!batchObj.additionalMentors) {
        batchObj.additionalMentors = [];
      }
      
      return batchObj;
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
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

// POST /api/batches - Create new batch
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
    console.log('Received batch data:', body);
    console.log('mentorId value:', body.mentorId, 'type:', typeof body.mentorId);
    
    const validatedData = createBatchSchema.parse(body);
    console.log('Validated data:', validatedData);

    // Check if course exists
    const course = await Course.findById(validatedData.courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Set primary mentor - use provided mentorId or first course mentor
    let primaryMentorId = validatedData.mentorId;
    
    if (!primaryMentorId && course.mentors && course.mentors.length > 0) {
      // Use first course mentor as primary mentor
      primaryMentorId = course.mentors[0].toString();
    }
    
    if (!primaryMentorId) {
      return NextResponse.json(
        { error: 'No mentor available. Course must have at least one mentor or provide a primary mentor.' },
        { status: 400 }
      );
    }

    // Check if primary mentor exists
    const mentor = await Mentor.findById(primaryMentorId);
    if (!mentor) {
      return NextResponse.json(
        { error: 'Primary mentor not found' },
        { status: 404 }
      );
    }

    // Check if additional mentors exist
    if (validatedData.additionalMentors && validatedData.additionalMentors.length > 0) {
      const additionalMentors = await Mentor.find({ _id: { $in: validatedData.additionalMentors } });
      if (additionalMentors.length !== validatedData.additionalMentors.length) {
        return NextResponse.json(
          { error: 'One or more additional mentors not found' },
          { status: 404 }
        );
      }
    }

    // Generate batch code and name
    const currentYear = new Date().getFullYear().toString().slice(-2);
    
    // Find the next batch number for this course in this year
    const existingBatches = await Batch.find({
      courseId: validatedData.courseId,
      batchCode: { $regex: `^${course.courseCode}${currentYear}` }
    }).sort({ batchCode: -1 });

    let nextBatchNumber = 1;
    if (existingBatches.length > 0) {
      const lastBatchCode = existingBatches[0].batchCode;
      const lastBatchNumber = parseInt(lastBatchCode.slice(-2));
      nextBatchNumber = lastBatchNumber + 1;
    }

    // Generate batch code: CourseCode + Year + Serial (e.g., GDI2501)
    const batchCode = `${course.courseCode}${currentYear}${nextBatchNumber.toString().padStart(2, '0')}`;
    const batchNumber = batchCode.slice(-2);
    const name = `${course.courseShortcut} Batch-${batchNumber}`;

    console.log('Generated batch code:', batchCode);
    console.log('Generated batch name:', name);

    // Create batch with generated code and name
    const batch = new Batch({
      ...validatedData,
      mentorId: primaryMentorId, // Use the determined primary mentor
      createdBy: payload.userId,
      batchCode,
      name
    });

    console.log('Batch object created, about to save...');
    await batch.save();
    console.log('Batch saved successfully');
    
    // Populate the batch with course and mentor data
    await batch.populate([
      { path: 'courseId', select: 'title courseCode courseShortcut regularPrice discountPrice coverPhoto' },
      { path: 'mentorId', select: 'name email avatar designation experience expertise' },
      { path: 'additionalMentors', select: 'name email avatar designation experience expertise' }
    ]);

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
