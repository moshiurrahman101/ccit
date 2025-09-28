import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Batch from '@/models/Batch';

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

    // Delete all invoices
    const deletedInvoices = await Invoice.deleteMany({});
    console.log(`✅ Deleted ${deletedInvoices.deletedCount} invoices`);

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
      deletedInvoices: deletedInvoices.deletedCount,
      resetBatches: resetBatches.modifiedCount,
      totalInvoices: invoices.length,
      totalBatches: batches.length
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
