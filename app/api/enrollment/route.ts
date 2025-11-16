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

    // Check for existing enrollment - try multiple queries to catch all cases
    // First check with batch
    let existingEnrollment = await Enrollment.findOne({
      student: payload.userId,
      course: course._id,
      batch: validatedData.batchId
    });

    // Also check without batch (in case batch is optional in some records)
    // Since the unique index is on {student: 1, course: 1}, a student can only
    // enroll once per course, even across different batches
    if (!existingEnrollment) {
      existingEnrollment = await Enrollment.findOne({
        student: payload.userId,
        course: course._id
      });
    }

    // Check if there are any orphaned records with null student values
    // This can happen when a user account is deleted but enrollment records remain
    // We need to clean these up before creating new enrollments
    // Also check for old field names (studentId, courseId) from old indexes
    const collection = Enrollment.collection;
    
    const orphanedRecords = await collection.find({
      $or: [
        { student: null },
        { student: { $exists: false } },
        { studentId: null },
        { studentId: { $exists: false } }
      ]
    }).limit(100).toArray(); // Limit to avoid performance issues

    if (orphanedRecords.length > 0) {
      console.log(`Found ${orphanedRecords.length} orphaned enrollment records with null/missing student (including old field names), cleaning up...`);
      
      // Delete all orphaned records using collection.deleteMany
      const deleteResult = await collection.deleteMany({
        $or: [
          { student: null },
          { student: { $exists: false } },
          { studentId: null },
          { studentId: { $exists: false } }
        ]
      });
      
      if (deleteResult.deletedCount > 0) {
        console.log(`Cleaned up ${deleteResult.deletedCount} orphaned enrollment records`);
      }
    }

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
      // Ensure course._id is valid
      if (!course || !course._id) {
        console.error('Course or course._id is missing:', course);
        return NextResponse.json({ 
          error: 'Course information is missing' 
        }, { status: 500 });
      }

      try {
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
        console.log('Enrollment record created successfully:', enrollment._id);
      } catch (enrollmentError: any) {
        // If it's a duplicate key error, try to find the existing enrollment
        if (enrollmentError.code === 11000) {
          console.log('Duplicate enrollment detected, trying to find existing enrollment...');
          console.log('Error details:', {
            code: enrollmentError.code,
            keyPattern: enrollmentError.keyPattern,
            keyValue: enrollmentError.keyValue
          });

          // Try multiple queries to find the existing enrollment
          // Check with batch first
          enrollment = await Enrollment.findOne({
            student: payload.userId,
            course: course._id,
            batch: validatedData.batchId
          });
          
          // If not found, try without batch
          if (!enrollment) {
            enrollment = await Enrollment.findOne({
              student: payload.userId,
              course: course._id
            });
          }

          // If still not found, try to find by matching the keyValue from the error
          if (!enrollment && enrollmentError.keyValue) {
            const query: any = {};
            if (enrollmentError.keyPattern) {
              // Map MongoDB field names to our schema field names
              if (enrollmentError.keyPattern.studentId || enrollmentError.keyPattern.student) {
                query.student = enrollmentError.keyValue.studentId || enrollmentError.keyValue.student || payload.userId;
              }
              if (enrollmentError.keyPattern.courseId || enrollmentError.keyPattern.course) {
                query.course = enrollmentError.keyValue.courseId || enrollmentError.keyValue.course || course._id;
              }
              if (enrollmentError.keyPattern.batchId || enrollmentError.keyPattern.batch) {
                query.batch = enrollmentError.keyValue.batchId || enrollmentError.keyValue.batch || validatedData.batchId;
              }
              
              if (Object.keys(query).length > 0) {
                enrollment = await Enrollment.findOne(query);
              }
            }
          }

          // If still not found, try a broader search
          if (!enrollment) {
            enrollment = await Enrollment.findOne({
              $or: [
                { student: payload.userId, course: course._id },
                { student: payload.userId, batch: validatedData.batchId }
              ]
            });
          }
          
          if (enrollment) {
            console.log('Found existing enrollment:', enrollment._id);
            // Update the batch field if it's missing
            if (!enrollment.batch && validatedData.batchId) {
              enrollment.batch = validatedData.batchId as any;
              await enrollment.save();
              console.log('Updated existing enrollment with batch ID');
            }
          } else {
            console.error('Duplicate key error but enrollment not found:', {
              error: enrollmentError.message,
              keyPattern: enrollmentError.keyPattern,
              keyValue: enrollmentError.keyValue,
              studentId: payload.userId,
              courseId: course._id,
              batchId: validatedData.batchId
            });
            
            // If we still can't find it, there might be corrupt records with null values
            // The error shows keyPattern has old field names (studentId/courseId) from an old index
            // but our schema uses student/course. We need to use MongoDB collection directly
            // to find and delete records that match the old index pattern
            console.log('Attempting to find and clean up all records with null values (including old field names)...');
            
            // Use MongoDB collection directly to find records with null in ANY indexed field
            // This handles both old field names (studentId, courseId) and new ones (student, course)
            const collection = Enrollment.collection;
            
            // Find all records with null in student/studentId OR course/courseId
            const allNullRecords = await collection.find({
              $or: [
                { student: null },
                { course: null },
                { studentId: null },
                { courseId: null },
                { student: { $exists: false } },
                { course: { $exists: false } },
                { studentId: { $exists: false } },
                { courseId: { $exists: false } }
              ]
            }).toArray();

            // Always try to drop the old index if it exists (might be causing the issue even without null records)
            try {
              await collection.dropIndex('studentId_1_courseId_1');
              console.log('✅ Dropped old index: studentId_1_courseId_1');
            } catch (idxError: any) {
              if (idxError.code === 27) { // 27 = IndexNotFound error
                console.log('Old index studentId_1_courseId_1 does not exist');
              } else {
                console.log('Could not drop old index:', idxError.message);
              }
            }
            
            if (allNullRecords.length > 0) {
              console.log(`Found ${allNullRecords.length} records with null values (including old field names), deleting all...`);
              
              // Delete all null records using collection.deleteMany
              const deleteResult = await collection.deleteMany({
                $or: [
                  { student: null },
                  { course: null },
                  { studentId: null },
                  { courseId: null },
                  { student: { $exists: false } },
                  { course: { $exists: false } },
                  { studentId: { $exists: false } },
                  { courseId: { $exists: false } }
                ]
              });
              
              console.log(`✅ Deleted ${deleteResult.deletedCount} records with null values`);
            } else {
              console.log('No null records found, but old index may have been dropped');
            }
            
            // Try creating enrollment again after cleanup (whether or not null records were found)
            try {
              enrollment = new Enrollment({
                student: payload.userId,
                course: course._id,
                batch: validatedData.batchId,
                amount: finalAmount,
                status: 'pending',
                paymentStatus: 'pending',
                progress: 0
              });
              await enrollment.save();
              console.log('Enrollment created successfully after cleaning all null records');
            } catch (retryError: any) {
              console.error('Failed to create enrollment after cleaning null records:', retryError);
              
              // If still failing, try to find any record that might conflict
              if (retryError.code === 11000) {
                console.log('Still getting duplicate key error after cleanup. Attempting direct collection query...');
                
                // Try to find the conflicting record directly
                const conflictingRecord = await collection.findOne({
                  $or: [
                    { student: payload.userId, course: course._id.toString() },
                    { student: payload.userId, course: course._id },
                    { studentId: payload.userId, courseId: course._id.toString() },
                    { studentId: payload.userId, courseId: course._id }
                  ]
                });
                
                if (conflictingRecord) {
                  console.log('Found conflicting record, deleting it:', conflictingRecord._id);
                  await collection.deleteOne({ _id: conflictingRecord._id });
                  
                  // Try one more time
                  try {
                    enrollment = new Enrollment({
                      student: payload.userId,
                      course: course._id,
                      batch: validatedData.batchId,
                      amount: finalAmount,
                      status: 'pending',
                      paymentStatus: 'pending',
                      progress: 0
                    });
                    await enrollment.save();
                    console.log('Enrollment created successfully after deleting conflicting record');
                  } catch (finalError: any) {
                    console.error('Final enrollment creation failed:', finalError);
                    await Invoice.findByIdAndDelete(invoice._id);
                    return NextResponse.json({ 
                      error: 'Failed to create enrollment after cleanup. Please contact support.' 
                    }, { status: 500 });
                  }
                } else {
                  await Invoice.findByIdAndDelete(invoice._id);
                  return NextResponse.json({ 
                    error: 'Failed to create enrollment. Duplicate key constraint issue persists. Please contact support.' 
                  }, { status: 500 });
                }
              } else {
                await Invoice.findByIdAndDelete(invoice._id);
                return NextResponse.json({ 
                  error: 'Failed to create enrollment. Please try again or contact support.' 
                }, { status: 500 });
              }
            }

            // If we still don't have an enrollment, clean up and return error
            if (!enrollment) {
              await Invoice.findByIdAndDelete(invoice._id);
              return NextResponse.json({ 
                error: 'Failed to create enrollment. You may already be enrolled in this course. Please check your enrollments or contact support.' 
              }, { status: 500 });
            }
          } // end of else block for enrollment not found
        } else {
          // Clean up invoice if enrollment creation fails (non-11000 error)
          await Invoice.findByIdAndDelete(invoice._id);
          throw enrollmentError;
        } // end of else block for non-11000 errors
      } // end of catch block
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