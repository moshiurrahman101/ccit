import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/models/Mentor';

// GET /api/public/mentors - Get all active mentors (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const expertise = searchParams.get('expertise') || '';

    const skip = (page - 1) * limit;

    // Build filter - only show active mentors
    const filter: Record<string, unknown> = {
      isActive: true
    };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { expertise: { $in: [new RegExp(search, 'i')] } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (expertise) {
      filter.expertise = { $in: [new RegExp(expertise, 'i')] };
    }

    const mentors = await Mentor.find(filter)
      .sort({ rating: -1, studentsCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Mentor.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      mentors,
      pagination: {
        currentPage: page,
        totalPages,
        totalMentors: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching public mentors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
