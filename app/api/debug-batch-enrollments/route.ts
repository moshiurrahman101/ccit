import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Batch from '@/models/Batch';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json(
        { error: 'Batch ID is required' },
        { status: 400 }
      );
    }

    // Get the specific batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Try different ways to find enrollments for this batch
    const enrollmentsByBatchId = await Enrollment.find({ batch: batchId });
    const enrollmentsByBatchObjectId = await Enrollment.find({ batch: batchId });
    const allEnrollments = await Enrollment.find({});
    
    // Check if there are any enrollments with batch field
    const enrollmentsWithBatch = await Enrollment.find({ batch: { $exists: true } });
    
    // Check if there are enrollments with different batch field names
    const enrollmentsWithBatchId = await Enrollment.find({ batchId: { $exists: true } });

    return NextResponse.json({
      message: 'Batch enrollment debug information',
      batchId: batchId,
      batch: batch,
      enrollmentsByBatchId: enrollmentsByBatchId,
      allEnrollments: allEnrollments,
      enrollmentsWithBatch: enrollmentsWithBatch,
      enrollmentsWithBatchId: enrollmentsWithBatchId,
      searchQueries: {
        'batch: batchId': enrollmentsByBatchId.length,
        'all enrollments': allEnrollments.length,
        'enrollments with batch field': enrollmentsWithBatch.length,
        'enrollments with batchId field': enrollmentsWithBatchId.length
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching batch enrollment debug info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch batch enrollment debug info', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
