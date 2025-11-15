import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Invoice from '@/models/Invoice';
import { Attendance } from '@/models/Attendance';
import Schedule from '@/models/Schedule';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/student/batches/[id]/attendance - Get student's attendance records for a batch
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
    
    if (!payload || payload.role !== 'student') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Convert batch ID to ObjectId
    let batchObjectId;
    try {
      batchObjectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    // Check if student is enrolled in this batch
    let enrollment = await Enrollment.findOne({
      student: payload.userId,
      batch: batchObjectId
    });

    // If not found, try with string ID
    if (!enrollment) {
      enrollment = await Enrollment.findOne({
        student: payload.userId,
        batch: id
      });
    }

    // If still not found, check invoices
    if (!enrollment) {
      const invoice = await Invoice.findOne({
        studentId: payload.userId,
        batchId: id
      });

      if (invoice && (invoice.status === 'paid' || invoice.status === 'partial')) {
        enrollment = {
          _id: new mongoose.Types.ObjectId(),
          student: payload.userId,
          batch: batchObjectId,
          status: 'approved',
          paymentStatus: invoice.status === 'paid' ? 'paid' : 'partial'
        } as any;
      }
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Access denied - not enrolled in this batch' },
        { status: 403 }
      );
    }

    // Check if payment is verified (full or partial)
    if (enrollment.paymentStatus !== 'paid' && enrollment.paymentStatus !== 'partial') {
      return NextResponse.json(
        { 
          error: 'Access denied - payment verification pending',
          paymentStatus: enrollment.paymentStatus
        },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query
    const query: any = {
      student: payload.userId,
      batch: batchObjectId
    };

    if (startDate || endDate) {
      query.classDate = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.classDate.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.classDate.$lte = end;
      }
    }

    // Fetch attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate('scheduleId', 'title date startTime endTime')
      .sort({ classDate: -1 })
      .lean();

    // Calculate statistics
    const totalClasses = attendanceRecords.length;
    const present = attendanceRecords.filter(a => a.status === 'present').length;
    const absent = attendanceRecords.filter(a => a.status === 'absent').length;
    const late = attendanceRecords.filter(a => a.status === 'late').length;
    const excused = attendanceRecords.filter(a => a.status === 'excused').length;
    const attendancePercentage = totalClasses > 0 
      ? Math.round(((present + late + excused) / totalClasses) * 100) 
      : 0;

    // Format attendance records
    const formattedAttendance = attendanceRecords.map((record: any) => ({
      _id: record._id?.toString() || record._id,
      scheduleId: record.scheduleId ? {
        _id: (record.scheduleId as any)._id.toString(),
        title: (record.scheduleId as any).title,
        date: (record.scheduleId as any).date,
        startTime: (record.scheduleId as any).startTime,
        endTime: (record.scheduleId as any).endTime
      } : null,
      classDate: record.classDate.toISOString(),
      status: record.status,
      checkInTime: record.checkInTime ? record.checkInTime.toISOString() : null,
      notes: record.notes || '',
      markedAt: record.markedAt.toISOString()
    }));

    return NextResponse.json({
      attendance: formattedAttendance,
      statistics: {
        totalClasses,
        present,
        absent,
        late,
        excused,
        attendancePercentage
      }
    });

  } catch (error) {
    console.error('Error fetching student attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

