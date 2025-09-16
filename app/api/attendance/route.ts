import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Attendance } from '@/models/Attendance';
import { Enrollment } from '@/models/Enrollment';
import { z } from 'zod';

const attendanceSchema = z.object({
  studentId: z.string().min(1, 'শিক্ষার্থী আইডি প্রয়োজন'),
  courseId: z.string().min(1, 'কোর্স আইডি প্রয়োজন'),
  batchId: z.string().optional(),
  classDate: z.string().min(1, 'ক্লাসের তারিখ প্রয়োজন'),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  notes: z.string().optional(),
  isOnline: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = attendanceSchema.parse(body);

    // Get mentor/admin from token (implement proper JWT verification)
    const markedBy = 'mentor-user-id'; // Replace with actual user ID from token

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: validatedData.studentId,
      course: validatedData.courseId,
      status: 'approved'
    });

    if (!enrollment) {
      return NextResponse.json({ message: 'শিক্ষার্থী এই কোর্সে নিবন্ধিত নয়' }, { status: 400 });
    }

    // Check if attendance already exists for this date
    const existingAttendance = await Attendance.findOne({
      student: validatedData.studentId,
      course: validatedData.courseId,
      classDate: new Date(validatedData.classDate)
    });

    if (existingAttendance) {
      return NextResponse.json({ message: 'এই তারিখের উপস্থিতি ইতিমধ্যে নেওয়া হয়েছে' }, { status: 400 });
    }

    // Create attendance record
    const attendance = new Attendance({
      student: validatedData.studentId,
      course: validatedData.courseId,
      batch: validatedData.batchId,
      classDate: new Date(validatedData.classDate),
      status: validatedData.status,
      checkInTime: validatedData.checkInTime ? new Date(validatedData.checkInTime) : undefined,
      checkOutTime: validatedData.checkOutTime ? new Date(validatedData.checkOutTime) : undefined,
      notes: validatedData.notes,
      markedBy: markedBy,
      isOnline: validatedData.isOnline
    });

    await attendance.save();

    return NextResponse.json({
      message: 'উপস্থিতি রেকর্ড করা হয়েছে',
      attendance: attendance
    }, { status: 201 });

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { message: 'ভুল তথ্য', errors: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    console.error('Attendance error:', error);
    return NextResponse.json(
      { message: 'সার্ভার এরর' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const batchId = searchParams.get('batchId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query: Record<string, unknown> = {};

    if (studentId) {
      query.student = studentId;
    }
    if (courseId) {
      query.course = courseId;
    }
    if (batchId) {
      query.batch = batchId;
    }
    if (startDate || endDate) {
      query.classDate = {};
      if (startDate) {
        query.classDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.classDate.$lte = new Date(endDate);
      }
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name email phone')
      .populate('course', 'title')
      .populate('batch', 'name')
      .populate('markedBy', 'name')
      .sort({ classDate: -1 });

    // Calculate attendance statistics
    const stats = {
      total: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      excused: attendance.filter(a => a.status === 'excused').length
    };

    return NextResponse.json({ 
      attendance,
      stats 
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { message: 'সার্ভার এরর' },
      { status: 500 }
    );
  }
}
