import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Batch from '@/models/Batch';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { batchId, studentEmail } = await request.json();

    if (!batchId || !studentEmail) {
      return NextResponse.json(
        { error: 'Batch ID and student email are required' },
        { status: 400 }
      );
    }

    // Find the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Find the student
    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: student._id,
      batch: batchId
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this batch' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: student._id,
      course: batch.course || batch._id, // Use batch._id as course if no course field
      batch: batchId,
      status: 'approved',
      paymentStatus: 'paid',
      amount: batch.discountPrice || batch.regularPrice || 0,
      progress: 0
    });

    await enrollment.save();

    // Update batch student count
    await Batch.findByIdAndUpdate(batchId, {
      $inc: { currentStudents: 1 }
    });

    return NextResponse.json({
      message: 'Test enrollment created successfully',
      enrollment: enrollment,
      student: {
        _id: student._id,
        name: student.name,
        email: student.email
      },
      batch: {
        _id: batch._id,
        name: batch.name
      }
    });

  } catch (error: unknown) {
    console.error('Error creating test enrollment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create test enrollment', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
