import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RecordedCourse from '@/models/RecordedCourse';
import RecordedCourseEnrollment from '@/models/RecordedCourseEnrollment';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const enrollSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required')
});

// POST /api/recorded-courses/enroll - Enroll in a recorded course
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Only students can enroll
    if (payload.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = enrollSchema.parse(body);

    // Get course
    const course = await RecordedCourse.findById(validatedData.courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course is published
    if (course.status !== 'published' || !course.isActive) {
      return NextResponse.json(
        { error: 'Course is not available for enrollment' },
        { status: 400 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await RecordedCourseEnrollment.findOne({
      student: payload.userId,
      course: validatedData.courseId
    });

    if (existingEnrollment) {
      if (existingEnrollment.status === 'active' && existingEnrollment.paymentStatus === 'paid') {
        return NextResponse.json(
          { error: 'You are already enrolled in this course', enrollment: existingEnrollment },
          { status: 409 }
        );
      }
      // If enrollment exists but not paid, update it
      existingEnrollment.status = 'pending';
      existingEnrollment.paymentStatus = 'pending';
      await existingEnrollment.save();
    }

    // Calculate price
    const finalPrice = course.discountPrice || course.regularPrice;
    const discountAmount = course.discountPrice ? course.regularPrice - course.discountPrice : 0;

    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments();
    const invoiceNumber = `INV-${Date.now()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    // Create invoice (using batchId field to store courseId for compatibility)
    const invoice = new Invoice({
      invoiceNumber,
      studentId: payload.userId,
      batchId: validatedData.courseId, // Store courseId in batchId field
      batchName: course.title,
      courseType: 'course',
      amount: course.regularPrice,
      discountAmount,
      finalAmount: finalPrice,
      currency: 'BDT',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      paidAmount: 0,
      remainingAmount: finalPrice,
      createdBy: payload.userId
    });

    await invoice.save();

    // Create or update enrollment
    let enrollment;
    if (existingEnrollment) {
      enrollment = existingEnrollment;
      enrollment.invoiceId = invoice._id;
      enrollment.amount = finalPrice;
      await enrollment.save();
    } else {
      enrollment = new RecordedCourseEnrollment({
        student: payload.userId,
        course: validatedData.courseId,
        invoiceId: invoice._id,
        amount: finalPrice,
        status: 'pending',
        paymentStatus: 'pending'
      });
      await enrollment.save();
    }

    return NextResponse.json({
      message: 'Enrollment created successfully. Please complete payment.',
      enrollment,
      invoice
    }, { status: 201 });

  } catch (error) {
    console.error('Error enrolling in course:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to enroll in course' },
      { status: 500 }
    );
  }
}

