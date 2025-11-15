import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Batch from '@/models/Batch';
import User from '@/models/User';
import Coupon from '@/models/Coupon';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const enrollmentSchema = z.object({
  batchId: z.string().min(1, 'Batch ID is required'),
  promoCode: z.string().optional()
});

// Generate invoice number
function generateInvoiceNumber(): string {
  const prefix = 'INV';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Enrollment request received');
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header');
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'student') {
      console.log('Invalid token or not student role:', payload);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User authenticated:', payload.userId);

    const body = await request.json();
    console.log('Request body:', body);
    
    const validatedData = enrollmentSchema.parse(body);
    console.log('Validated data:', validatedData);

    await connectDB();
    console.log('Connected to database');

    // Find the batch with course information
    const batch = await Batch.findById(validatedData.batchId).populate('courseId');
    if (!batch) {
      console.log('Batch not found:', validatedData.batchId);
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }
    
    console.log('Batch found:', batch.name);
    console.log('Batch status:', batch.status);
    console.log('Current students:', batch.currentStudents);
    console.log('Max students:', batch.maxStudents);
    console.log('Course:', batch.courseId);

    // Check if batch is available for enrollment
    if (batch.status !== 'published' && batch.status !== 'upcoming') {
      console.log('Batch not available for enrollment. Status:', batch.status);
      return NextResponse.json({ 
        error: 'Batch is not available for enrollment' 
      }, { status: 400 });
    }

    // Check if batch has available seats
    if (batch.currentStudents >= batch.maxStudents) {
      console.log('Batch is full. Current:', batch.currentStudents, 'Max:', batch.maxStudents);
      return NextResponse.json({ 
        error: 'Batch is full' 
      }, { status: 400 });
    }

    // Calculate amount from batch (use batch pricing if available, fallback to course pricing)
    const course = batch.courseId;
    if (!course) {
      return NextResponse.json({ error: 'Course not found for this batch' }, { status: 404 });
    }

    // Check if student is already enrolled (check both invoice and enrollment)
    const existingInvoice = await Invoice.findOne({
      studentId: payload.userId,
      batchId: validatedData.batchId
    });

    const existingEnrollment = await Enrollment.findOne({
      student: payload.userId,
      course: course._id,
      batch: validatedData.batchId
    });

    console.log('Existing invoice check:', existingInvoice ? 'Found existing invoice' : 'No existing invoice');
    console.log('Existing enrollment check:', existingEnrollment ? 'Found existing enrollment' : 'No existing enrollment');

    if (existingInvoice || existingEnrollment) {
      console.log('Student already enrolled');
      return NextResponse.json({ 
        error: 'You are already enrolled in this batch' 
      }, { status: 400 });
    }
    
    // Use batch pricing if available, otherwise use course pricing
    const regularPrice = batch.regularPrice || course.regularPrice;
    const discountPrice = batch.discountPrice || course.discountPrice;
    
    let amount = discountPrice || regularPrice;
    let discountAmount = discountPrice ? regularPrice - discountPrice : 0;
    let couponDiscount = 0;
    let couponCode = '';

    // Apply coupon code if provided
    if (validatedData.promoCode) {
      console.log('Validating coupon code:', validatedData.promoCode);
      
      const coupon = await Coupon.findOne({
        code: validatedData.promoCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (!coupon) {
        return NextResponse.json({ 
          error: 'Invalid or expired coupon code' 
        }, { status: 400 });
      }

      // Check if coupon has usage limit
      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ 
          error: 'Coupon code has reached its usage limit' 
        }, { status: 400 });
      }

      // Check if coupon applies to this batch or course
      const appliesToBatch = !coupon.applicableBatches || coupon.applicableBatches.includes(batch._id);
      const appliesToCourse = !coupon.applicableCourses || coupon.applicableCourses.includes(course._id);
      
      if (!appliesToBatch && !appliesToCourse) {
        return NextResponse.json({ 
          error: 'Coupon code is not valid for this batch' 
        }, { status: 400 });
      }

      // Check minimum amount requirement
      if (coupon.minAmount && amount < coupon.minAmount) {
        return NextResponse.json({ 
          error: `Minimum order amount of ৳${coupon.minAmount} required for this coupon` 
        }, { status: 400 });
      }

      // Calculate coupon discount
      if (coupon.type === 'percentage') {
        couponDiscount = (amount * coupon.value) / 100;
        if (coupon.maxDiscount) {
          couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
        }
      } else {
        couponDiscount = Math.min(coupon.value, amount);
      }

      amount = Math.max(0, amount - couponDiscount);
      couponCode = coupon.code;
      
      console.log('Coupon applied:', {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount: couponDiscount,
        finalAmount: amount
      });
    }

    const finalAmount = amount;

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber: generateInvoiceNumber(),
      studentId: payload.userId,
      batchId: validatedData.batchId,
      batchName: batch.name,
      courseType: 'batch',
      amount: regularPrice,
      discountAmount: discountAmount,
      promoCode: couponCode,
      promoDiscount: couponDiscount,
      finalAmount: finalAmount,
      currency: 'BDT',
      status: 'pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      paidAmount: 0,
      remainingAmount: finalAmount,
      payments: [],
      createdBy: payload.userId
    });

    console.log('Creating invoice:', invoice.toObject());
    await invoice.save();
    console.log('Invoice saved successfully');

    // Create enrollment record only if it doesn't exist
    let enrollment = existingEnrollment;
    if (!enrollment) {
      enrollment = new Enrollment({
        student: payload.userId,
        course: course._id,
        batch: validatedData.batchId,
        amount: finalAmount,
        status: 'pending', // Will be approved when payment is confirmed
        paymentStatus: 'pending',
        progress: 0
      });

      await enrollment.save();
      console.log('Enrollment record created successfully');
    } else {
      console.log('Using existing enrollment record');
    }

    // Update batch current students count
    await Batch.findByIdAndUpdate(validatedData.batchId, {
      $inc: { currentStudents: 1 }
    });

    return NextResponse.json({ 
      message: 'Enrollment successful',
      invoice: {
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        batchId: invoice.batchId,
        batchName: invoice.batchName,
        amount: invoice.amount,
        finalAmount: invoice.finalAmount,
        status: invoice.status,
        dueDate: invoice.dueDate,
        createdAt: invoice.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation error',
        details: error.issues
      }, { status: 400 });
    }
    
    console.error('Error processing enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}