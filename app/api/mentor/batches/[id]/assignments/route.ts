import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import Assignment from '@/models/Assignment';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  maxPoints: z.number().min(1, 'Max points must be at least 1').default(100),
  attachments: z.array(z.string()).default([]),
  instructions: z.string().optional()
});

// GET /api/mentor/batches/[id]/assignments - Get assignments for a batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
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
    const batch = await Batch.findById(id);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor has access to this batch
    if (payload.role === 'mentor' && mentor) {
      const hasAccess = 
        batch.createdBy.toString() === payload.userId ||
        batch.mentorId?.toString() === mentor._id.toString();
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Fetch assignments from database
    const assignments = await Assignment.find({ batchId: id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    // Format assignments for response
    const formattedAssignments = assignments.map((assignment: any) => ({
      _id: assignment._id?.toString() || assignment._id,
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || '',
      dueDate: assignment.dueDate?.toISOString() || new Date(assignment.dueDate).toISOString(),
      maxPoints: assignment.maxPoints,
      attachments: assignment.attachments || [],
      status: assignment.status || 'published',
      submissions: assignment.submissions?.length || 0,
      createdAt: assignment.createdAt?.toISOString() || new Date(assignment.createdAt).toISOString(),
      updatedAt: assignment.updatedAt?.toISOString() || new Date(assignment.updatedAt).toISOString()
    }));

    return NextResponse.json({
      assignments: formattedAssignments,
      total: formattedAssignments.length,
      batch: {
        _id: batch._id,
        name: batch.name,
        currentStudents: batch.currentStudents
      }
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/mentor/batches/[id]/assignments - Create new assignment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
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
    const batch = await Batch.findById(id);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor has access to this batch
    if (payload.role === 'mentor' && mentor) {
      const hasAccess = 
        batch.createdBy.toString() === payload.userId ||
        batch.mentorId?.toString() === mentor._id.toString();
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validatedData = createAssignmentSchema.parse(body);

    // Validate due date
    const dueDate = new Date(validatedData.dueDate);
    const now = new Date();
    
    if (dueDate <= now) {
      return NextResponse.json(
        { error: 'Due date must be in the future' },
        { status: 400 }
      );
    }

    // Create assignment in database
    const newAssignment = new Assignment({
      batchId: id,
      title: validatedData.title,
      description: validatedData.description,
      instructions: validatedData.instructions || '',
      dueDate: dueDate,
      maxPoints: validatedData.maxPoints,
      attachments: validatedData.attachments || [],
      status: 'published',
      createdBy: payload.userId
    });

    await newAssignment.save();

    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment: {
        _id: newAssignment._id.toString(),
        title: newAssignment.title,
        description: newAssignment.description,
        instructions: newAssignment.instructions,
        dueDate: newAssignment.dueDate.toISOString(),
        maxPoints: newAssignment.maxPoints,
        attachments: newAssignment.attachments,
        status: newAssignment.status,
        submissions: newAssignment.submissions?.length || 0,
        createdAt: newAssignment.createdAt.toISOString(),
        updatedAt: newAssignment.updatedAt.toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating assignment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

// PUT /api/mentor/batches/[id]/assignments - Update an assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
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
    const batch = await Batch.findById(id);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor has access to this batch
    if (payload.role === 'mentor' && mentor) {
      const hasAccess = 
        batch.createdBy.toString() === payload.userId ||
        batch.mentorId?.toString() === mentor._id.toString();
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { assignmentId, ...updateData } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    // Validate update data if provided
    if (updateData.dueDate) {
      const dueDate = new Date(updateData.dueDate);
      const now = new Date();
      
      if (dueDate <= now) {
        return NextResponse.json(
          { error: 'Due date must be in the future' },
          { status: 400 }
        );
      }
    }

    // Find and update assignment
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      batchId: id,
      createdBy: payload.userId
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or access denied' },
        { status: 404 }
      );
    }

    // Update fields
    if (updateData.title) assignment.title = updateData.title;
    if (updateData.description) assignment.description = updateData.description;
    if (updateData.instructions !== undefined) assignment.instructions = updateData.instructions;
    if (updateData.dueDate) assignment.dueDate = new Date(updateData.dueDate);
    if (updateData.maxPoints) assignment.maxPoints = updateData.maxPoints;
    if (updateData.attachments !== undefined) assignment.attachments = updateData.attachments;
    if (updateData.status) assignment.status = updateData.status;

    await assignment.save();

    return NextResponse.json({
      message: 'Assignment updated successfully',
      assignment: {
        _id: assignment._id.toString(),
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions,
        dueDate: assignment.dueDate.toISOString(),
        maxPoints: assignment.maxPoints,
        attachments: assignment.attachments,
        status: assignment.status,
        submissions: assignment.submissions?.length || 0,
        createdAt: assignment.createdAt.toISOString(),
        updatedAt: assignment.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating assignment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

// DELETE /api/mentor/batches/[id]/assignments - Delete an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
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
    const batch = await Batch.findById(id);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor has access to this batch
    if (payload.role === 'mentor' && mentor) {
      const hasAccess = 
        batch.createdBy.toString() === payload.userId ||
        batch.mentorId?.toString() === mentor._id.toString();
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return NextResponse.json(
        { error: 'Invalid assignment ID format. This assignment may be from old mock data and cannot be deleted.' },
        { status: 400 }
      );
    }

    // Convert batch ID to ObjectId for proper matching
    let batchObjectId;
    try {
      batchObjectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    // Find and delete the assignment
    const assignment = await Assignment.findOneAndDelete({
      _id: new mongoose.Types.ObjectId(assignmentId),
      batchId: batchObjectId,
      createdBy: payload.userId
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Assignment deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    
    // Handle CastError specifically
    if (error.name === 'CastError' || error.message?.includes('Cast to ObjectId')) {
      return NextResponse.json(
        { error: 'Invalid assignment ID format. This assignment may be from old mock data and cannot be deleted. Please create a new assignment.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete assignment' },
      { status: 500 }
    );
  }
}