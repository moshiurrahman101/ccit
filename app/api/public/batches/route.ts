import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';

// GET /api/public/batches - Get all published batches (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const courseType = searchParams.get('courseType') || '';
    const mentorId = searchParams.get('mentorId') || '';

    // Build query - only show published/active batches
    const query: Record<string, any> = {
      isActive: true,
      status: { $in: ['published', 'upcoming', 'ongoing'] }
    };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'marketing.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (courseType) {
      query.courseType = courseType;
    }
    
    if (mentorId) {
      query.mentorId = mentorId;
    }

    // Get batches
    const batches = await Batch.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Manually populate mentor data
    const batchesWithMentors = await Promise.all(
      batches.map(async (batch) => {
        const mentor = await Mentor.findById(batch.mentorId).select('name email avatar designation experience expertise');
        return {
          ...batch.toObject(),
          mentorId: mentor
        };
      })
    );

    // Get total count
    const totalBatches = await Batch.countDocuments(query);
    const totalPages = Math.ceil(totalBatches / limit);

    return NextResponse.json({
      batches: batchesWithMentors,
      pagination: {
        currentPage: page,
        totalPages,
        totalBatches,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching public batches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}
