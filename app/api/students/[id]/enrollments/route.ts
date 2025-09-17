import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Enrollment } from '@/models/Enrollment';
import Course from '@/models/Course';
import { Batch } from '@/models/Batch';
import { verifyTokenEdge } from '@/lib/auth';

// GET student enrollments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    
    const { id } = await params;
    
    // Check if user is admin or the student themselves
    const currentUser = await User.findById(payload.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (currentUser.role !== 'admin' && currentUser._id.toString() !== id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const enrollments = await Enrollment.find({ student: id })
      .populate('course', 'title description price duration')
      .populate('batch', 'name description startDate endDate status')
      .populate('approvedBy', 'name email')
      .sort({ enrollmentDate: -1 });

    return NextResponse.json({ enrollments });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new enrollment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    
    const { id } = await params;
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, batchId, amount, paymentMethod, transactionId, senderNumber } = body;

    // Validate required fields
    if (!courseId || !amount) {
      return NextResponse.json({ 
        error: 'Course ID and amount are required' 
      }, { status: 400 });
    }

    // Check if student exists
    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if batch exists (if provided)
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (!batch) {
        return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
      }
    }

    // Check if enrollment already exists
    const existingEnrollment = await Enrollment.findOne({ 
      student: id, 
      course: courseId 
    });
    if (existingEnrollment) {
      return NextResponse.json({ 
        error: 'Student is already enrolled in this course' 
      }, { status: 400 });
    }

    // Create new enrollment
    const enrollment = new Enrollment({
      student: id,
      course: courseId,
      batch: batchId || undefined,
      amount,
      paymentMethod,
      transactionId,
      senderNumber,
      status: 'pending',
      paymentStatus: paymentMethod ? 'paid' : 'pending'
    });

    await enrollment.save();

    // Populate the enrollment with course and batch details
    await enrollment.populate([
      { path: 'course', select: 'title description price duration' },
      { path: 'batch', select: 'name description startDate endDate status' }
    ]);

    return NextResponse.json({
      message: 'Enrollment created successfully',
      enrollment
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
