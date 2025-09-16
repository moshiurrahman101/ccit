import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BatchSimple from '@/models/BatchSimple';
import User from '@/models/User';
import { verifyTokenEdge } from '@/lib/auth';

// GET single batch
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const batch = await BatchSimple.findById(params.id);

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json({ batch });
  } catch (error) {
    console.error('Error fetching batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update batch
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, description, startDate, endDate, maxStudents, status, isActive } = body;

    // Find batch
    const batch = await BatchSimple.findById(params.id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Check if name already exists (excluding current batch)
    if (name && name !== batch.name) {
      const existingBatch = await BatchSimple.findOne({ name, _id: { $ne: params.id } });
      if (existingBatch) {
        return NextResponse.json({ 
          error: 'Batch name already exists' 
        }, { status: 400 });
      }
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return NextResponse.json({ 
          error: 'End date must be after start date' 
        }, { status: 400 });
      }
    }

    // Update fields
    if (name) batch.name = name;
    if (description !== undefined) batch.description = description;
    if (startDate) batch.startDate = new Date(startDate);
    if (endDate) batch.endDate = new Date(endDate);
    if (maxStudents !== undefined) batch.maxStudents = maxStudents;
    if (status) batch.status = status;
    if (isActive !== undefined) batch.isActive = isActive;

    await batch.save();

    return NextResponse.json({
      message: 'Batch updated successfully',
      batch
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE batch
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const batch = await BatchSimple.findById(params.id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Check if batch has students
    if (batch.currentStudents > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete batch with enrolled students' 
      }, { status: 400 });
    }

    await BatchSimple.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'Batch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting batch:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
