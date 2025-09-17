import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BatchSimple from '@/models/BatchSimple';
import { verifyTokenEdge } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const authResult = verifyTokenEdge(token);
    
    if (!authResult) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    if (authResult.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const { batchIds } = await request.json();

    if (!batchIds || !Array.isArray(batchIds) || batchIds.length === 0) {
      return NextResponse.json({ error: 'No batch IDs provided' }, { status: 400 });
    }

    // Check if any batches have students enrolled
    const batchesWithStudents = await BatchSimple.find({
      _id: { $in: batchIds },
      currentStudents: { $gt: 0 }
    });

    if (batchesWithStudents.length > 0) {
      const batchNames = batchesWithStudents.map(batch => batch.name).join(', ');
      return NextResponse.json({ 
        error: `Cannot delete batches with enrolled students: ${batchNames}` 
      }, { status: 400 });
    }

    // Delete the batches
    const result = await BatchSimple.deleteMany({
      _id: { $in: batchIds }
    });

    return NextResponse.json({
      message: `${result.deletedCount} batches deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting batches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
