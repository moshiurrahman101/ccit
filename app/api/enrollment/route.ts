import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import { User } from '@/models/User';
import Course from '@/models/Course';
import { Batch } from '@/models/Batch';
import { z } from 'zod';

const enrollmentSchema = z.object({
  courseId: z.string().min(1, 'কোর্স আইডি প্রয়োজন'),
  batchId: z.string().optional(),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'cash']),
  transactionId: z.string().optional(),
  senderNumber: z.string().optional(),
  amount: z.number().min(0, 'সঠিক পরিমাণ দিন'),
  isOfflineStudent: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = enrollmentSchema.parse(body);

    // Get user from token (you'll need to implement this)
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'অনুমতি প্রয়োজন' }, { status: 401 });
    }

    // For now, we'll use a placeholder - implement proper JWT verification
    const userId = 'placeholder-user-id'; // Replace with actual user ID from token

    // Check if course exists
    const course = await Course.findById(validatedData.courseId);
    if (!course) {
      return NextResponse.json({ message: 'কোর্স পাওয়া যায়নি' }, { status: 404 });
    }

    // Check if batch exists (for offline students)
    if (validatedData.batchId) {
      const batch = await Batch.findById(validatedData.batchId);
      if (!batch) {
        return NextResponse.json({ message: 'ব্যাচ পাওয়া যায়নি' }, { status: 404 });
      }

      // Check if batch has space
      if (batch.currentStudents >= batch.maxStudents) {
        return NextResponse.json({ message: 'ব্যাচ পূর্ণ' }, { status: 400 });
      }
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: validatedData.courseId
    });

    if (existingEnrollment) {
      return NextResponse.json({ message: 'আপনি ইতিমধ্যে এই কোর্সে নিবন্ধিত' }, { status: 400 });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: userId,
      course: validatedData.courseId,
      batch: validatedData.batchId,
      paymentMethod: validatedData.paymentMethod,
      transactionId: validatedData.transactionId,
      senderNumber: validatedData.senderNumber,
      amount: validatedData.amount,
      status: 'pending'
    });

    await enrollment.save();

    // Update batch student count if applicable
    if (validatedData.batchId) {
      await Batch.findByIdAndUpdate(validatedData.batchId, {
        $inc: { currentStudents: 1 }
      });
    }

    return NextResponse.json({
      message: 'নিবন্ধন সফল',
      enrollment: enrollment
    }, { status: 201 });

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { message: 'ভুল তথ্য', errors: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    console.error('Enrollment error:', error);
    return NextResponse.json(
      { message: 'সার্ভার এরর' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');

    let query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }
    if (studentId) {
      query.student = studentId;
    }
    if (courseId) {
      query.course = courseId;
    }

    const enrollments = await Enrollment.find(query)
      .populate('student', 'name email phone')
      .populate('course', 'title price mentor')
      .populate('batch', 'name startDate endDate')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ enrollments });

  } catch (error) {
    console.error('Get enrollments error:', error);
    return NextResponse.json(
      { message: 'সার্ভার এরর' },
      { status: 500 }
    );
  }
}
