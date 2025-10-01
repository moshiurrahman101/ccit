import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Batch from '@/models/Batch';
import User from '@/models/User';
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

    // Find the batch
    const batch = await Batch.findById(validatedData.batchId);
    if (!batch) {
      console.log('Batch not found:', validatedData.batchId);
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }
    
    console.log('Batch found:', batch.name);
    console.log('Batch status:', batch.status);
    console.log('Current students:', batch.currentStudents);
    console.log('Max students:', batch.maxStudents);

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

    // Check if student is already enrolled
    const existingInvoice = await Invoice.findOne({
      studentId: payload.userId,
      batchId: validatedData.batchId
    });

    console.log('Existing invoice check:', existingInvoice ? 'Found existing enrollment' : 'No existing enrollment');

    if (existingInvoice) {
      console.log('Student already enrolled');
      return NextResponse.json({ 
        error: 'You are already enrolled in this batch' 
      }, { status: 400 });
    }

    // Calculate amount (use discount price if available)
    const amount = batch.discountPrice || batch.regularPrice;
    const discountAmount = batch.discountPrice ? batch.regularPrice - batch.discountPrice : 0;
    const finalAmount = amount;

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber: generateInvoiceNumber(),
      studentId: payload.userId,
      batchId: validatedData.batchId,
      batchName: batch.name,
      courseType: 'batch',
      amount: batch.regularPrice,
      discountAmount: discountAmount,
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

    // Create enrollment record
    const enrollment = new Enrollment({
      student: payload.userId,
      course: batch.course || batch._id, // Use batch as course if no course field
      batch: validatedData.batchId,
      amount: finalAmount,
      status: 'pending', // Will be approved when payment is confirmed
      paymentStatus: 'pending',
      progress: 0
    });

    await enrollment.save();
    console.log('Enrollment record created successfully');

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