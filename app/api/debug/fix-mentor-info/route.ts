import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId') || '68ceda1b24d6e204a4d297b9';

    console.log('=== FIX MENTOR INFO DEBUG ===');
    console.log('Batch ID:', batchId);

    // Get the batch
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ message: 'Batch not found' }, { status: 404 });
    }

    console.log('Current batch mentorId:', batch.mentorId);

    // Check if mentor exists
    const mentor = await User.findById(batch.mentorId);
    console.log('Mentor found:', mentor ? 'Yes' : 'No');

    if (!mentor) {
      // Find any mentor to assign to this batch
      const anyMentor = await User.findOne({ role: 'mentor' });
      console.log('Found alternative mentor:', anyMentor ? 'Yes' : 'No');

      if (anyMentor) {
        // Update batch with existing mentor
        await Batch.findByIdAndUpdate(batchId, { mentorId: anyMentor._id });
        console.log('Updated batch with mentor:', anyMentor._id);

        return NextResponse.json({
          success: true,
          message: 'Batch updated with existing mentor',
          batch: {
            id: batch._id,
            name: batch.name,
            mentorId: anyMentor._id,
            mentor: {
              id: anyMentor._id,
              name: anyMentor.name,
              email: anyMentor.email,
              designation: anyMentor.designation
            }
          }
        });
      } else {
        // Create a default mentor
        const defaultMentor = new User({
          name: 'Default Mentor',
          email: 'mentor@ccit.com',
          password: 'password123', // This should be hashed in production
          role: 'mentor',
          designation: 'Senior Developer',
          approvalStatus: 'approved'
        });

        const savedMentor = await defaultMentor.save();
        console.log('Created default mentor:', savedMentor._id);

        // Update batch with new mentor
        await Batch.findByIdAndUpdate(batchId, { mentorId: savedMentor._id });
        console.log('Updated batch with new mentor:', savedMentor._id);

        return NextResponse.json({
          success: true,
          message: 'Created default mentor and updated batch',
          batch: {
            id: batch._id,
            name: batch.name,
            mentorId: savedMentor._id,
            mentor: {
              id: savedMentor._id,
              name: savedMentor.name,
              email: savedMentor.email,
              designation: savedMentor.designation
            }
          }
        });
      }
    } else {
      return NextResponse.json({
        success: true,
        message: 'Mentor already exists',
        batch: {
          id: batch._id,
          name: batch.name,
          mentorId: mentor._id,
          mentor: {
            id: mentor._id,
            name: mentor.name,
            email: mentor.email,
            designation: mentor.designation
          }
        }
      });
    }

  } catch (error: unknown) {
    console.error('Error fixing mentor info:', error);
    return NextResponse.json(
      { message: 'Failed to fix mentor info' },
      { status: 500 }
    );
  }
}
