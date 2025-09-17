import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Enrollment } from '@/models/Enrollment';
import { verifyTokenEdge } from '@/lib/auth';

// PUT update enrollment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
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
    
    const { id, enrollmentId } = await params;
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { status, paymentStatus, progress, notes } = body;

    // Find enrollment
    const enrollment = await Enrollment.findOne({ 
      _id: enrollmentId, 
      student: id 
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Update fields
    if (status) {
      enrollment.status = status;
      if (status === 'approved') {
        enrollment.approvedBy = currentUser._id;
        enrollment.approvedAt = new Date();
      }
      if (status === 'completed') {
        enrollment.completedAt = new Date();
      }
    }
    
    if (paymentStatus) {
      enrollment.paymentStatus = paymentStatus;
    }
    
    if (progress !== undefined) {
      enrollment.progress = Math.max(0, Math.min(100, progress));
    }

    if (notes) {
      enrollment.notes = notes;
    }

    enrollment.lastAccessed = new Date();
    await enrollment.save();

    // Populate the enrollment
    await enrollment.populate([
      { path: 'course', select: 'title description price duration' },
      { path: 'batch', select: 'name description startDate endDate status' },
      { path: 'approvedBy', select: 'name email' }
    ]);

    return NextResponse.json({
      message: 'Enrollment updated successfully',
      enrollment
    });
  } catch (error) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; enrollmentId: string }> }
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
    
    const { id, enrollmentId } = await params;
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Find and delete enrollment
    const enrollment = await Enrollment.findOneAndDelete({ 
      _id: enrollmentId, 
      student: id 
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
