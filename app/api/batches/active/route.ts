import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BatchSimple from '@/models/BatchSimple';

// GET active batches (for student form dropdown)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get only active batches for student enrollment
    const batches = await BatchSimple.find({ 
      isActive: true,
      status: { $in: ['upcoming', 'ongoing'] }
    })
    .select('name description startDate endDate maxStudents currentStudents')
    .sort({ startDate: 1 });

    return NextResponse.json({ batches });
  } catch (error) {
    console.error('Error fetching active batches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
