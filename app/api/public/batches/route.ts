import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import Course from '@/models/Course';

// GET /api/public/batches - Get all published batches (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Ensure models are registered
    if (!mongoose.models.Batch) {
      mongoose.model('Batch', Batch.schema);
    }
    if (!mongoose.models.Course) {
      mongoose.model('Course', Course.schema);
    }
    if (!mongoose.models.Mentor) {
      mongoose.model('Mentor', Mentor.schema);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const courseType = searchParams.get('courseType') || '';
    const mentorId = searchParams.get('mentorId') || '';
    const courseId = searchParams.get('courseId') || '';

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
    
    if (courseId) {
      query.courseId = courseId;
    }

    // Get batches with course and mentor information
    const batches = await Batch.find(query)
      .populate('courseId', 'title description shortDescription coverPhoto courseCode courseShortcut category level language duration durationUnit whatYouWillLearn requirements features marketing')
      .populate('mentorId', 'name email avatar designation experience expertise')
      .populate('additionalMentors', 'name email avatar designation experience expertise')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count
    const totalBatches = await Batch.countDocuments(query);
    const totalPages = Math.ceil(totalBatches / limit);

    return NextResponse.json({
      batches,
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
