import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';

// GET /api/batches/slug/[slug] - Get batch by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    const batch = await Batch.findOne({ 
      'marketing.slug': slug,
      isActive: true,
      status: { $in: ['published', 'upcoming', 'ongoing'] }
    }).populate('mentorId', 'name email avatar designation experience expertise bio skills socialLinks rating studentsCount coursesCount');

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ batch });

  } catch (error) {
    console.error('Error fetching batch by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch' },
      { status: 500 }
    );
  }
}
