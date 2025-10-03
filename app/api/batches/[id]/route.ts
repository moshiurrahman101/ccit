import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const updateBatchSchema = z.object({
  name: z.string().min(1, 'Batch name is required').max(100, 'Batch name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  courseType: z.enum(['online', 'offline']).optional(),
  regularPrice: z.number().min(0, 'Price cannot be negative').optional(),
  discountPrice: z.number().min(0, 'Discount price cannot be negative').optional(),
  mentorId: z.string().min(1, 'Mentor is required').optional(),
  additionalMentors: z.array(z.string()).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1').optional(),
  currentStudents: z.number().min(0, 'Current students cannot be negative').optional(),
  status: z.enum(['draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
  isActive: z.boolean().optional()
});

// GET /api/batches/[id] - Get single batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Handle special cases for status filtering
    if (id === 'active' || id === 'published' || id === 'ongoing') {
      // Return all batches with the specified status
      const batches = await Batch.find({ 
        status: id === 'active' ? 'published' : id 
      })
        .populate('mentorId', 'name email avatar designation experience expertise bio skills socialLinks')
        .sort({ createdAt: -1 });

      return NextResponse.json({ 
        batches,
        status: id,
        message: `Fetched ${batches.length} ${id} batches`
      });
    }

    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid batch ID format' },
        { status: 400 }
      );
    }

    const batch = await Batch.findById(id)
      .populate('courseId', 'title description shortDescription coverPhoto courseCode courseShortcut category level language duration durationUnit regularPrice discountPrice discountPercentage mentors whatYouWillLearn requirements features marketing')
      .populate('mentorId', 'name email avatar designation experience expertise bio skills socialLinks')
      .populate('additionalMentors', 'name email avatar designation experience expertise bio skills socialLinks');

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ batch });

  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch' },
      { status: 500 }
    );
  }
}

// PUT /api/batches/[id] - Update batch
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

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
    const validatedData = updateBatchSchema.parse(body);

    // Check if batch exists
    const existingBatch = await Batch.findById(id);
    if (!existingBatch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor exists (if mentorId is being updated)
    if (validatedData.mentorId) {
      const mentor = await Mentor.findById(validatedData.mentorId);
      if (!mentor) {
        return NextResponse.json(
          { error: 'Mentor not found' },
          { status: 404 }
        );
      }
    }

    // Check if batch name already exists (if name is being updated)
    if (validatedData.name && validatedData.name !== existingBatch.name) {
      const nameExists = await Batch.findOne({ 
        name: validatedData.name,
        _id: { $ne: id }
      });
      if (nameExists) {
        return NextResponse.json(
          { error: 'Batch with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Check if additional mentors exist (if additionalMentors is being updated)
    if (validatedData.additionalMentors && validatedData.additionalMentors.length > 0) {
      const additionalMentors = await Mentor.find({ 
        _id: { $in: validatedData.additionalMentors } 
      });
      if (additionalMentors.length !== validatedData.additionalMentors.length) {
        return NextResponse.json(
          { error: 'One or more additional mentors not found' },
          { status: 404 }
        );
      }
    }

    // Calculate discount percentage if both prices are provided
    let discountPercentage;
    if (validatedData.regularPrice && validatedData.discountPrice) {
      discountPercentage = Math.round(
        ((validatedData.regularPrice - validatedData.discountPrice) / validatedData.regularPrice) * 100
      );
    }

    // Update batch
    const updateData = {
      ...validatedData,
      ...(discountPercentage !== undefined && { discountPercentage })
    };
    
    const updatedBatch = await Batch.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('courseId', 'title description shortDescription coverPhoto courseCode courseShortcut category level language duration durationUnit regularPrice discountPrice discountPercentage mentors whatYouWillLearn requirements features marketing')
    .populate('mentorId', 'name email avatar designation experience expertise bio skills socialLinks')
    .populate('additionalMentors', 'name email avatar designation experience expertise bio skills socialLinks');

    return NextResponse.json({
      message: 'Batch updated successfully',
      batch: updatedBatch
    });

  } catch (error) {
    console.error('Error updating batch:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update batch' },
      { status: 500 }
    );
  }
}

// DELETE /api/batches/[id] - Delete batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if batch exists
    const batch = await Batch.findById(id);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if batch has enrolled students
    if (batch.currentStudents > 0) {
      return NextResponse.json(
        { error: 'Cannot delete batch with enrolled students' },
        { status: 400 }
      );
    }

    await Batch.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Batch deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json(
      { error: 'Failed to delete batch' },
      { status: 500 }
    );
  }
}
