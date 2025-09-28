import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/models/Mentor';

// GET /api/mentors/search - Search mentors with live search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build search query
    const searchQuery: Record<string, any> = {
      isActive: true
    };

    if (query && query.length > 0) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { designation: { $regex: query, $options: 'i' } },
        { expertise: { $in: [new RegExp(query, 'i')] } },
        { skills: { $in: [new RegExp(query, 'i')] } }
      ];
    }

    // Get mentors
    const mentors = await Mentor.find(searchQuery)
      .select('name email avatar designation experience expertise skills rating studentsCount coursesCount')
      .sort({ rating: -1, studentsCount: -1 })
      .limit(limit);

    return NextResponse.json({ mentors });

  } catch (error) {
    console.error('Error searching mentors:', error);
    return NextResponse.json(
      { error: 'Failed to search mentors' },
      { status: 500 }
    );
  }
}
