import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/models/Mentor';

// GET single public mentor (no authentication required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const mentor = await Mentor.findById(id)
      .select('name designation experience expertise skills avatar bio socialLinks teachingExperience rating students courses achievements education certifications languages availability teachingStyle phone email')
      .lean();

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Only show active mentors to public
    if (mentor.status !== 'active') {
      return NextResponse.json({ error: 'Mentor not available' }, { status: 404 });
    }

    return NextResponse.json({ mentor });
  } catch (error) {
    console.error('Error fetching public mentor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
