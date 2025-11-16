import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Batch from '@/models/Batch';
import { Enrollment } from '@/models/Enrollment';
import User from '@/models/User';
import Payment from '@/models/Payment';
import { Attendance } from '@/models/Attendance';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const cleanupSchema = z.object({
  email: z.string().email('Valid email is required')
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const validatedData = cleanupSchema.parse(body);
    const email = validatedData.email.toLowerCase();

    console.log(`🧹 Starting cleanup for student: ${email}`);

    // Find the user by email
    const user = await User.findOne({ email });
    
    let userId: string | null = null;
    if (user) {
      userId = user._id.toString();
      console.log(`✅ Found user: ${user.name} (${user._id})`);
    } else {
      console.log(`⚠️  User not found with email: ${email}`);
      // Still proceed to clean up orphaned records with null values
    }

    // Find all enrollments for this user
    // First, try to find by userId if user exists
    let enrollmentQuery: any = {};
    if (userId) {
      // Primary: find enrollments by user ID
      enrollmentQuery = { student: userId };
    } else {
      // If user doesn't exist, check for orphaned records with null values
      enrollmentQuery = {
        $or: [
          { student: null },
          { student: { $exists: false } }
        ]
      };
    }

    const enrollments = await Enrollment.find(enrollmentQuery);
    console.log(`📊 Found ${enrollments.length} enrollments to delete`);

    // Get batch IDs from enrollments to update counts later
    const batchIds = new Set<string>();
    for (const enrollment of enrollments) {
      if (enrollment.batch) {
        batchIds.add(enrollment.batch.toString());
      }
      if (userId && enrollment.student?.toString() === userId) {
        if (enrollment.batch) {
          batchIds.add(enrollment.batch.toString());
        }
      }
    }

    // Find all invoices for this user
    let invoiceQuery: any = {};
    if (userId) {
      // Primary: find invoices by user ID
      invoiceQuery = { studentId: userId };
    } else {
      // If user doesn't exist, check for orphaned records with null values
      invoiceQuery = {
        $or: [
          { studentId: null },
          { studentId: { $exists: false } }
        ]
      };
    }

    const invoices = await Invoice.find(invoiceQuery);
    console.log(`📊 Found ${invoices.length} invoices to delete`);

    // Get batch IDs from invoices
    for (const invoice of invoices) {
      if (invoice.batchId) {
        batchIds.add(invoice.batchId.toString());
      }
    }

    // Find all payments related to these invoices
    const invoiceIds = invoices.map(inv => inv._id);
    const payments = invoiceIds.length > 0 
      ? await Payment.find({ invoiceId: { $in: invoiceIds } })
      : [];
    console.log(`📊 Found ${payments.length} payments to delete`);

    // Find all attendance records for this user
    let attendanceQuery: any = {};
    if (userId) {
      // Primary: find attendance by user ID
      attendanceQuery = { student: userId };
    } else {
      // If user doesn't exist, check for orphaned records with null values
      attendanceQuery = {
        $or: [
          { student: null },
          { student: { $exists: false } }
        ]
      };
    }

    const attendanceRecords = await Attendance.find(attendanceQuery);
    console.log(`📊 Found ${attendanceRecords.length} attendance records to delete`);

    // Delete all enrollments
    const deletedEnrollments = await Enrollment.deleteMany(enrollmentQuery);
    console.log(`✅ Deleted ${deletedEnrollments.deletedCount} enrollments`);

    // Delete all payments first (they reference invoices)
    const deletedPayments = payments.length > 0
      ? await Payment.deleteMany({ invoiceId: { $in: invoiceIds } })
      : { deletedCount: 0 };
    console.log(`✅ Deleted ${deletedPayments.deletedCount} payments`);

    // Delete all invoices
    const deletedInvoices = await Invoice.deleteMany(invoiceQuery);
    console.log(`✅ Deleted ${deletedInvoices.deletedCount} invoices`);

    // Delete all attendance records
    const deletedAttendance = await Attendance.deleteMany(attendanceQuery);
    console.log(`✅ Deleted ${deletedAttendance.deletedCount} attendance records`);

    // Update batch student counts
    let updatedBatches = 0;
    if (batchIds.size > 0) {
      for (const batchId of batchIds) {
        // Count actual enrollments for this batch
        const actualEnrollmentCount = await Enrollment.countDocuments({
          batch: batchId,
          student: { $exists: true, $ne: null }
        });

        // Also count invoices (as fallback for enrollments without records)
        const invoiceCount = await Invoice.countDocuments({
          batchId: batchId,
          studentId: { $exists: true, $ne: null }
        });

        // Use the maximum count to be safe
        const totalCount = Math.max(actualEnrollmentCount, invoiceCount);

        await Batch.findByIdAndUpdate(batchId, {
          $set: { currentStudents: totalCount }
        });
        updatedBatches++;
        console.log(`✅ Updated batch ${batchId} student count to ${totalCount}`);
      }
    }

    console.log(`🎉 Cleanup completed successfully!`);

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up enrollment data for ${email}`,
      student: user ? {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null,
      deleted: {
        enrollments: deletedEnrollments.deletedCount,
        invoices: deletedInvoices.deletedCount,
        payments: deletedPayments.deletedCount || 0,
        attendance: deletedAttendance.deletedCount,
        batchesUpdated: updatedBatches
      },
      summary: {
        enrollmentsFound: enrollments.length,
        invoicesFound: invoices.length,
        paymentsFound: payments.length,
        attendanceFound: attendanceRecords.length,
        batchIdsAffected: Array.from(batchIds)
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.issues
      }, { status: 400 });
    }

    console.error('❌ Error during student data cleanup:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

