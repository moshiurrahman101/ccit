import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import User from '@/models/User';
import { Enrollment } from '@/models/Enrollment';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId') || '68ceda1b24d6e204a4d297b9';

    console.log('=== BATCH MENTOR INFO DEBUG ===');
    console.log('Batch ID:', batchId);

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    console.log('Batch found:', batch ? 'Yes' : 'No');
    console.log('Batch mentorId:', batch?.mentorId);

    // Check if mentor exists
    let mentor = null;
    if (batch?.mentorId) {
      mentor = await User.findById(batch.mentorId);
      console.log('Mentor found:', mentor ? 'Yes' : 'No');
      console.log('Mentor ID being searched:', batch.mentorId);
      console.log('Mentor details:', mentor ? {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        designation: mentor.designation,
        role: mentor.role
      } : 'No mentor found with this ID');
    }

    // Also check if there are any users with mentor role
    const allMentors = await User.find({ role: 'mentor' }).select('_id name email designation role').lean();
    console.log('All mentors in database:', allMentors.length);
    console.log('All mentor IDs:', allMentors.map((m: any) => m._id.toString()));

    // Check enrollment for this batch
    const enrollment = await Enrollment.findOne({ batch: batchId });
    console.log('Enrollment found:', enrollment ? 'Yes' : 'No');
    console.log('Enrollment student:', enrollment?.student);

    // Test population
    const batchWithMentor = await Batch.findById(batchId)
      .populate('mentorId', 'name email designation avatar role')
      .lean();
    
    console.log('Batch with populated mentor:', (batchWithMentor as any)?.mentorId);

    return NextResponse.json({
      success: true,
      debug: {
        batchId,
        batch: batch ? {
          id: batch._id,
          name: batch.name,
          mentorId: batch.mentorId
        } : null,
        mentor: mentor ? {
          id: mentor._id,
          name: mentor.name,
          email: mentor.email,
          designation: mentor.designation,
          role: mentor.role
        } : null,
        populatedMentor: (batchWithMentor as any)?.mentorId,
        allMentors: allMentors,
        enrollment: enrollment ? {
          id: enrollment._id,
          student: enrollment.student,
          batch: enrollment.batch
        } : null
      }
    });

  } catch (error: unknown) {
    console.error('Error in batch mentor info debug:', error);
    return NextResponse.json(
      { message: 'Failed to debug batch mentor info' },
      { status: 500 }
    );
  }
}
