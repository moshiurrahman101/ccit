import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';

// GET /api/batches/slug/[slug] - Get batch by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    
    console.log('Fetching batch with slug:', slug);

    const batch = await Batch.findOne({ 
      'marketing.slug': slug,
      isActive: true,
      status: { $in: ['published', 'upcoming', 'ongoing'] }
    });

    console.log('Batch found:', batch ? 'Yes' : 'No');
    if (batch) {
      console.log('Batch name:', batch.name);
      console.log('Batch status:', batch.status);
    }

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Manually populate mentor data
    let mentor = null;
    if (batch.mentorId) {
      mentor = await Mentor.findById(batch.mentorId).select('name email avatar designation experience expertise bio skills socialLinks rating studentsCount coursesCount');
    }

    const batchWithMentor = {
      ...batch.toObject(),
      mentorId: mentor
    };

    return NextResponse.json({ batch: batchWithMentor });

  } catch (error) {
    console.error('Error fetching batch by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch' },
      { status: 500 }
    );
  }
}
