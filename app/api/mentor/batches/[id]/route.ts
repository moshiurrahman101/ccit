import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import { Enrollment } from '@/models/Enrollment';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const updateBatchSchema = z.object({
  name: z.string().min(1, 'Batch name is required').max(100, 'Batch name too long').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long').optional(),
  coverPhoto: z.string().optional(),
  courseType: z.enum(['online', 'offline']).optional(),
  regularPrice: z.number().min(0, 'Price cannot be negative').optional(),
  discountPrice: z.number().min(0, 'Discount price cannot be negative').optional(),
  mentorId: z.string().min(1, 'Mentor is required').optional(),
  modules: z.array(z.object({
    title: z.string().min(1, 'Module title is required'),
    description: z.string().min(1, 'Module description is required'),
    duration: z.number().min(0.5, 'Module duration must be at least 0.5 hours'),
    order: z.number().min(1, 'Order must be at least 1')
  })).optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  duration: z.number().min(1, 'Duration must be at least 1').optional(),
  durationUnit: z.enum(['days', 'weeks', 'months', 'years']).optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().transform(str => new Date(str)).optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1').optional(),
  currentStudents: z.number().min(0, 'Current students cannot be negative').optional(),
  marketing: z.object({
    slug: z.string().min(1, 'Slug is required'),
    metaDescription: z.string().max(160, 'Meta description too long').optional(),
    tags: z.array(z.string())
  }).optional(),
  status: z.enum(['draft', 'published', 'upcoming', 'ongoing', 'completed', 'cancelled']).optional()
}).partial();

// GET /api/mentor/batches/[id] - Get single batch (mentor can only access their own)
export async function GET(
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

    // Get mentor information
    const mentor = await Mentor.findOne({ userId: payload.userId });
    if (!mentor && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    // Get batch
    const batch = await Batch.findById(id)
      .populate({
        path: 'mentorId',
        select: 'name email avatar designation experience expertise',
        options: { strictPopulate: false }
      });

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor has access to this batch
    if (payload.role === 'mentor' && mentor) {
      const hasAccess = 
        batch.createdBy.toString() === payload.userId || // Created by this mentor
        batch.mentorId?._id?.toString() === mentor._id.toString(); // Assigned to this mentor
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Handle missing mentor
    if (!batch.mentorId || !batch.mentorId._id) {
      batch.mentorId = null;
    }

    // Calculate actual enrollment count (all enrollments, not just paid)
    let batchObjectId;
    try {
      batchObjectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      console.error('Invalid batch ID format:', id);
    }

    let actualEnrollmentCount = 0;
    if (batchObjectId) {
      // Count all enrollments for this batch (any payment status)
      const enrollmentCount = await Enrollment.countDocuments({
        $or: [
          { batch: batchObjectId },
          { batch: id }
        ]
      });
      actualEnrollmentCount = enrollmentCount;

      // If no enrollments found, check invoices (since invoices store batchId as string)
      if (actualEnrollmentCount === 0) {
        const invoiceCount = await Invoice.countDocuments({
          batchId: id
        });
        actualEnrollmentCount = invoiceCount;
      } else {
        // Also check for invoices that might not have enrollment records yet
        const invoiceCount = await Invoice.countDocuments({
          batchId: id
        });
        // Use the higher count to ensure we show all enrolled students
        actualEnrollmentCount = Math.max(actualEnrollmentCount, invoiceCount);
      }
    }

    // Update batch object with actual count
    const batchWithActualCount = {
      ...batch.toObject(),
      currentStudents: actualEnrollmentCount
    };

    return NextResponse.json({ batch: batchWithActualCount });

  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch' },
      { status: 500 }
    );
  }
}

// PUT /api/mentor/batches/[id] - Update batch (mentor can only update their own)
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

    // Get mentor information
    const mentor = await Mentor.findOne({ userId: payload.userId });
    if (!mentor && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    // Check if batch exists
    const existingBatch = await Batch.findById(id);
    if (!existingBatch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor has access to this batch
    if (payload.role === 'mentor' && mentor) {
      const hasAccess = 
        existingBatch.createdBy.toString() === payload.userId || // Created by this mentor
        existingBatch.mentorId?.toString() === mentor._id.toString(); // Assigned to this mentor
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validatedData = updateBatchSchema.parse(body);

    // For mentors, if they're trying to change mentorId, force it to be their own
    if (payload.role === 'mentor' && mentor && validatedData.mentorId) {
      validatedData.mentorId = mentor._id.toString();
    }

    // Check if mentor exists (if mentorId is being updated)
    if (validatedData.mentorId) {
      const assignedMentor = await Mentor.findById(validatedData.mentorId);
      if (!assignedMentor) {
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

    // Check if slug already exists (if slug is being updated)
    if (validatedData.marketing?.slug && validatedData.marketing.slug !== existingBatch.marketing.slug) {
      const slugExists = await Batch.findOne({ 
        'marketing.slug': validatedData.marketing.slug,
        _id: { $ne: id }
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Batch with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update batch
    const updatedBatch = await Batch.findByIdAndUpdate(
      id,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate({
      path: 'mentorId',
      select: 'name email avatar designation experience expertise',
      options: { strictPopulate: false }
    });

    // Handle missing mentor
    if (!updatedBatch.mentorId || !updatedBatch.mentorId._id) {
      updatedBatch.mentorId = null;
    }

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

// DELETE /api/mentor/batches/[id] - Delete batch (mentor can only delete their own)
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
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get mentor information
    const mentor = await Mentor.findOne({ userId: payload.userId });
    if (!mentor && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    // Check if batch exists
    const existingBatch = await Batch.findById(id);
    if (!existingBatch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor has access to this batch
    if (payload.role === 'mentor' && mentor) {
      const hasAccess = 
        existingBatch.createdBy.toString() === payload.userId || // Created by this mentor
        existingBatch.mentorId?.toString() === mentor._id.toString(); // Assigned to this mentor
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Delete batch
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
