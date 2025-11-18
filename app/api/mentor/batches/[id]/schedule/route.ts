import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import Schedule from '@/models/Schedule';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const createScheduleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  meetingLink: z.string().url().optional(),
  location: z.string().optional(),
  isOnline: z.boolean().default(false)
});

// GET /api/mentor/batches/[id]/schedule - Get class schedule for a batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get mentor information
    const mentor = await Mentor.findOne({ userId: payload.userId });
    if (!mentor && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    // Get batch
    const batch = await Batch.findById(id);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor has access to this batch
    if (payload.role === 'mentor' && mentor) {
      const hasAccess = 
        batch.createdBy.toString() === payload.userId ||
        batch.mentorId?.toString() === mentor._id.toString();
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Fetch schedules from database
    const schedules = await Schedule.find({ batchId: id })
      .populate('createdBy', 'name email')
      .sort({ date: 1, startTime: 1 })
      .lean();

    return NextResponse.json({
      schedules: schedules,
      total: schedules.length,
      batch: {
        _id: batch._id,
        name: batch.name,
        courseType: batch.courseType
      }
    });

  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

// POST /api/mentor/batches/[id]/schedule - Create new class schedule
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get mentor information
    const mentor = await Mentor.findOne({ userId: payload.userId });
    if (!mentor && payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Mentor profile not found' },
        { status: 404 }
      );
    }

    // Get batch
    const batch = await Batch.findById(id);
    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Check if mentor has access to this batch
    if (payload.role === 'mentor' && mentor) {
      const hasAccess = 
        batch.createdBy.toString() === payload.userId ||
        batch.mentorId?.toString() === mentor._id.toString();
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validatedData = createScheduleSchema.parse(body);

    // Validate date and time
    const scheduleDate = new Date(validatedData.date);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);
    
    // Check if the selected date is before today (allow today)
    if (scheduleDate < today) {
      return NextResponse.json(
        { error: 'Date cannot be in the past' },
        { status: 400 }
      );
    }
    
    // If we have both date and time, validate the combined datetime
    // Allow scheduling for today if the time hasn't passed yet
    if (validatedData.startTime) {
      const scheduleDateTime = new Date(`${validatedData.date}T${validatedData.startTime}`);
      // Only check if it's in the past if it's not today
      const isToday = scheduleDate.getTime() === today.getTime();
      if (!isToday && scheduleDateTime < now) {
        return NextResponse.json(
          { error: 'Class time cannot be in the past' },
          { status: 400 }
        );
      }
    }

    // Validate time format and logic
    const startTime = validatedData.startTime;
    const endTime = validatedData.endTime;
    
    if (startTime >= endTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // For online batches, require meeting link
    if (batch.courseType === 'online' && validatedData.isOnline && !validatedData.meetingLink) {
      return NextResponse.json(
        { error: 'Meeting link is required for online classes' },
        { status: 400 }
      );
    }

    // For offline batches, require location
    if (batch.courseType === 'offline' && !validatedData.isOnline && !validatedData.location) {
      return NextResponse.json(
        { error: 'Location is required for offline classes' },
        { status: 400 }
      );
    }

    // Create schedule in database
    const newSchedule = new Schedule({
      batchId: id,
      title: validatedData.title,
      description: validatedData.description,
      date: validatedData.date,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      meetingLink: validatedData.meetingLink,
      location: validatedData.location,
      isOnline: validatedData.isOnline,
      status: 'scheduled',
      createdBy: payload.userId
    });

    const savedSchedule = await newSchedule.save();

    // Populate the createdBy field for response
    await savedSchedule.populate('createdBy', 'name email');

    return NextResponse.json({
      message: 'Class scheduled successfully',
      schedule: savedSchedule
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating schedule:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

// PUT /api/mentor/batches/[id]/schedule - Update a schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { scheduleId, ...updateData } = body;

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Find and update the schedule
    const schedule = await Schedule.findOneAndUpdate(
      { 
        _id: scheduleId, 
        batchId: id,
        createdBy: payload.userId 
      },
      updateData,
      { new: true }
    ).populate('createdBy', 'name email');

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Schedule updated successfully',
      schedule: schedule
    });

  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

// DELETE /api/mentor/batches/[id]/schedule - Delete a schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'Schedule ID is required' },
        { status: 400 }
      );
    }

    // Find and delete the schedule
    const schedule = await Schedule.findOneAndDelete({
      _id: scheduleId,
      batchId: id,
      createdBy: payload.userId
    });

    if (!schedule) {
      return NextResponse.json(
        { error: 'Schedule not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Schedule deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
