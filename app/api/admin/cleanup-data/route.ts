import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Batch from '@/models/Batch';
import { Enrollment } from '@/models/Enrollment';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    console.log('🧹 Starting cleanup process...');

    // Get all invoices
    const invoices = await Invoice.find({});
    console.log(`📊 Found ${invoices.length} invoices to clean up`);

    // Get all batches to reset student counts
    const batches = await Batch.find({});
    console.log(`📊 Found ${batches.length} batches to reset`);

    // Find orphaned enrollments (enrollments with null student or student that doesn't exist)
    const orphanedEnrollments = await Enrollment.find({
      $or: [
        { student: null },
        { student: { $exists: false } }
      ]
    });
    console.log(`📊 Found ${orphanedEnrollments.length} orphaned enrollments to clean up`);

    // Also check for enrollments with invalid student references
    const allEnrollments = await Enrollment.find({});
    let invalidEnrollments = 0;
    for (const enrollment of allEnrollments) {
      if (enrollment.student) {
        const studentExists = await User.findById(enrollment.student);
        if (!studentExists) {
          invalidEnrollments++;
          orphanedEnrollments.push(enrollment as any);
        }
      }
    }

    // Find orphaned invoices (invoices with null studentId or studentId that doesn't exist)
    const orphanedInvoices = await Invoice.find({
      $or: [
        { studentId: null },
        { studentId: { $exists: false } }
      ]
    });
    console.log(`📊 Found ${orphanedInvoices.length} orphaned invoices to clean up`);

    // Also check for invoices with invalid student references
    const allInvoices = await Invoice.find({});
    let invalidInvoices = 0;
    for (const invoice of allInvoices) {
      if (invoice.studentId) {
        const studentExists = await User.findById(invoice.studentId);
        if (!studentExists) {
          invalidInvoices++;
          orphanedInvoices.push(invoice as any);
        }
      }
    }

    // Delete orphaned enrollments
    const deletedEnrollments = await Enrollment.deleteMany({
      $or: [
        { student: null },
        { student: { $exists: false } }
      ]
    });
    console.log(`✅ Deleted ${deletedEnrollments.deletedCount} orphaned enrollments`);

    // Delete orphaned invoices
    const deletedOrphanedInvoices = await Invoice.deleteMany({
      $or: [
        { studentId: null },
        { studentId: { $exists: false } }
      ]
    });
    console.log(`✅ Deleted ${deletedOrphanedInvoices.deletedCount} orphaned invoices`);

    // Delete all invoices (if needed - comment out if you only want to delete orphaned ones)
    // const deletedInvoices = await Invoice.deleteMany({});
    // console.log(`✅ Deleted ${deletedInvoices.deletedCount} invoices`);

    // Reset currentStudents count for all batches
    const resetBatches = await Batch.updateMany(
      {},
      { $set: { currentStudents: 0 } }
    );
    console.log(`✅ Reset student count for ${resetBatches.modifiedCount} batches`);

    console.log('🎉 Cleanup completed successfully!');

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      deletedOrphanedInvoices: deletedOrphanedInvoices.deletedCount,
      deletedEnrollments: deletedEnrollments.deletedCount,
      resetBatches: resetBatches.modifiedCount,
      totalInvoices: invoices.length,
      totalBatches: batches.length,
      orphanedInvoices: orphanedInvoices.length,
      orphanedEnrollments: orphanedEnrollments.length,
      invalidInvoices,
      invalidEnrollments
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
