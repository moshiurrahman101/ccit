import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Create a default mentor if it doesn't exist
    let defaultMentor = await Mentor.findOne({ email: 'default@ccit.com' });
    
    if (!defaultMentor) {
      defaultMentor = new Mentor({
        name: 'Default Mentor',
        email: 'default@ccit.com',
        designation: 'System Default',
        experience: 5,
        expertise: ['General Programming', 'System Administration'],
        teachingExperience: 3,
        status: 'active',
        isActive: true,
        isVerified: true
      });
      await defaultMentor.save();
      console.log('✅ Default mentor created');
    }

    // Find all batches with missing or invalid mentors
    const batches = await Batch.find({});
    let updatedCount = 0;

    for (const batch of batches) {
      // Check if mentor exists
      const mentor = await Mentor.findById(batch.mentorId);
      
      if (!mentor) {
        // Assign default mentor
        batch.mentorId = defaultMentor._id;
        await batch.save();
        updatedCount++;
        console.log(`✅ Updated batch "${batch.name}" with default mentor`);
      }
    }

    return NextResponse.json({
      message: `Fixed ${updatedCount} batches with missing mentors`,
      defaultMentor: {
        id: defaultMentor._id,
        name: defaultMentor.name,
        email: defaultMentor.email
      }
    });

  } catch (error) {
    console.error('Error fixing mentors:', error);
    return NextResponse.json(
      { error: 'Failed to fix mentors' },
      { status: 500 }
    );
  }
}
