import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { batchId, title, description, date, startTime, endTime, meetingLink, isOnline } = body;

    if (!batchId || !title || !date || !startTime || !endTime) {
      return NextResponse.json({ 
        message: 'Batch ID, title, date, startTime, and endTime are required' 
      }, { status: 400 });
    }

    // Create test schedule
    const testSchedule = new Schedule({
      batchId: batchId,
      title: title || 'Test Class - React Fundamentals',
      description: description || 'Introduction to React components, state, and props',
      date: date || '2025-01-30',
      startTime: startTime || '10:00',
      endTime: endTime || '12:00',
      meetingLink: meetingLink || 'https://zoom.us/j/123456789',
      location: !isOnline ? 'CCIT Office, Dhaka' : undefined,
      isOnline: isOnline !== false, // Default to true
      status: 'scheduled',
      createdBy: payload.userId
    });

    const savedSchedule = await testSchedule.save();
    await savedSchedule.populate('createdBy', 'name email');

    return NextResponse.json({
      success: true,
      message: 'Test schedule created successfully',
      schedule: savedSchedule
    });

  } catch (error: unknown) {
    console.error('Error creating test schedule:', error);
    return NextResponse.json(
      { message: 'Failed to create test schedule' },
      { status: 500 }
    );
  }
}
