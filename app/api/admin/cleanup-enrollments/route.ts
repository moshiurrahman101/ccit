import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Batch from '@/models/Batch';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (admin only)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    await connectDB();

    // Get all invoices
    const invoices = await Invoice.find({});
    console.log(`Found ${invoices.length} invoices to clean up`);

    // Get all batches to reset student counts
    const batches = await Batch.find({});
    console.log(`Found ${batches.length} batches to reset`);

    // Delete all invoices
    const deletedInvoices = await Invoice.deleteMany({});
    console.log(`Deleted ${deletedInvoices.deletedCount} invoices`);

    // Reset currentStudents count for all batches
    const resetBatches = await Batch.updateMany(
      {},
      { $set: { currentStudents: 0 } }
    );
    console.log(`Reset student count for ${resetBatches.modifiedCount} batches`);

    return NextResponse.json({
      message: 'Cleanup completed successfully',
      deletedInvoices: deletedInvoices.deletedCount,
      resetBatches: resetBatches.modifiedCount,
      totalInvoices: invoices.length,
      totalBatches: batches.length
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
