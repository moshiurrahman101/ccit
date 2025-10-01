import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Batch from '@/models/Batch';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all enrollments without any filters
    const allEnrollments = await Enrollment.find({})
      .populate('student', 'name email phone')
      .populate('course', 'name')
      .populate('batch', 'name courseType')
      .lean();

    // Get all batches to see what's available
    const allBatches = await Batch.find({})
      .select('_id name courseType currentStudents maxStudents')
      .lean();

    // Get all users with role 'student'
    const allStudents = await User.find({ role: 'student' })
      .select('_id name email phone role')
      .lean();

    // Check for any enrollments that might have different field names
    const rawEnrollments = await Enrollment.find({}).lean();

    return NextResponse.json({
      message: 'Complete enrollment debug information',
      totalEnrollments: allEnrollments.length,
      allEnrollments: allEnrollments,
      allBatches: allBatches,
      allStudents: allStudents,
      rawEnrollments: rawEnrollments,
      collectionInfo: {
        enrollmentCount: allEnrollments.length,
        batchCount: allBatches.length,
        studentCount: allStudents.length
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching all enrollment debug info:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch enrollment debug info', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
