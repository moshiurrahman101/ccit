import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import Schedule from '@/models/Schedule';
import User from '@/models/User';
import Invoice from '@/models/Invoice';
import { Attendance } from '@/models/Attendance';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const markAttendanceSchema = z.object({
  scheduleId: z.string().optional(),
  classDate: z.string().min(1, 'Class date is required'),
  attendance: z.array(z.object({
    studentId: z.string(),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    notes: z.string().optional()
  }))
});

// GET /api/mentor/batches/[id]/attendance - Get attendance records for a batch
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('scheduleId');
    const classDate = searchParams.get('classDate');

    // Build query
    const query: any = { batch: id };
    if (scheduleId) {
      query.scheduleId = scheduleId;
    }
    if (classDate) {
      const date = new Date(classDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      query.classDate = { $gte: startOfDay, $lte: endOfDay };
    }

    // Fetch attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate('student', 'name email avatar')
      .populate('scheduleId', 'title date startTime endTime')
      .sort({ classDate: -1, createdAt: -1 })
      .lean();

    // Get all schedules for this batch
    const schedules = await Schedule.find({ batchId: id })
      .sort({ date: -1, startTime: -1 })
      .lean();

    // Convert batch ID to ObjectId for proper matching
    let batchObjectId;
    try {
      batchObjectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      console.error('Invalid batch ID format:', id);
      return NextResponse.json(
        { error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    // Get enrolled students - try multiple approaches
    let enrollments: any[] = [];
    
    // First, try with ObjectId
    enrollments = await Enrollment.find({ 
      batch: batchObjectId 
    })
      .populate('student', 'name email avatar')
      .lean();

    // If no enrollments found, try with string ID
    if (enrollments.length === 0) {
      enrollments = await Enrollment.find({ 
        batch: id 
      })
        .populate('student', 'name email avatar')
        .lean();
    }

    // If still no enrollments, check invoices (since invoices have batchId as string)
    // Also check invoices even if enrollments exist, to catch any invoices without enrollment records
    console.log('Checking invoices for this batch...');
    const invoices = await Invoice.find({ 
      batchId: id // Invoice stores batchId as string
      // Include all invoices, not just paid ones, to match the students API
    }).lean();
      
    if (invoices.length > 0) {
      // Get unique student IDs from invoices
      const studentIds = [...new Set(invoices.map(inv => inv.studentId))];
      
      // If we already have enrollments, check if we're missing any students from invoices
      if (enrollments.length > 0) {
        // Get student IDs from existing enrollments
        const enrolledStudentIds = new Set(
          enrollments
            .map(e => {
              if (e.student && typeof e.student === 'object' && '_id' in e.student) {
                return e.student._id.toString();
              } else if (e.student) {
                return typeof e.student === 'string' ? e.student : e.student.toString();
              }
              return null;
            })
            .filter(id => id !== null)
        );
        
        // Find students from invoices that don't have enrollment records
        const missingStudentIds = studentIds.filter(id => !enrolledStudentIds.has(id));
        
        if (missingStudentIds.length > 0) {
          console.log('Found students in invoices without enrollment records:', missingStudentIds.length);
          const studentsFromInvoices = await User.find({
            _id: { $in: missingStudentIds.map(id => new mongoose.Types.ObjectId(id)) }
          }).select('name email avatar').lean();
          
          // Get invoices for missing students
          const missingInvoices = invoices.filter(inv => missingStudentIds.includes(inv.studentId));
          
          // Create mock enrollment-like objects from invoices
          const mockEnrollments = missingInvoices.map(invoice => {
            const student = studentsFromInvoices.find((s: any) => s._id?.toString() === invoice.studentId);
            if (!student) return null;
            
            return {
              student: student,
              batch: batchObjectId
            };
          }).filter(e => e !== null) as any[];
          
          // Add mock enrollments to the existing enrollments array
          enrollments = [...enrollments, ...mockEnrollments];
          console.log('Added students from invoices:', mockEnrollments.length);
        }
      } else {
        // No enrollments found, try to find enrollments by student and batch
        enrollments = await Enrollment.find({
          student: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) },
          $or: [
            { batch: batchObjectId },
            { batch: id }
          ]
        })
        .populate('student', 'name email avatar')
        .lean();
        
        // If still no enrollments, create student list directly from invoices
        if (enrollments.length === 0 && studentIds.length > 0) {
          const studentsFromInvoices = await User.find({
            _id: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) }
          }).select('name email avatar').lean();
          
          // Create mock enrollment-like objects from invoices
          enrollments = invoices.map(invoice => {
            const student = studentsFromInvoices.find((s: any) => s._id?.toString() === invoice.studentId);
            if (!student) return null;
            
            return {
              student: student,
              batch: batchObjectId
            };
          }).filter(e => e !== null) as any[];
        }
      }
    }

    // Filter out enrollments with missing student data
    const validEnrollments = enrollments.filter(e => e.student && e.student._id);

    // Remove duplicates by student ID (in case same student has multiple enrollments/invoices)
    const uniqueStudentsMap = new Map<string, any>();
    validEnrollments.forEach((e: any) => {
      if (e.student && e.student._id) {
        const studentId = e.student._id.toString();
        // Keep the first occurrence
        if (!uniqueStudentsMap.has(studentId)) {
          uniqueStudentsMap.set(studentId, {
            _id: studentId,
            name: e.student.name || 'Unknown Student',
            email: e.student.email || 'No email',
            avatar: e.student.avatar
          });
        }
      }
    });

    const uniqueStudents = Array.from(uniqueStudentsMap.values());

    console.log('=== ATTENDANCE API STUDENTS ===');
    console.log('Total enrollments:', enrollments.length);
    console.log('Valid enrollments:', validEnrollments.length);
    console.log('Unique students:', uniqueStudents.length);
    console.log('Students:', uniqueStudents.map(s => ({ _id: s._id, name: s.name })));

    return NextResponse.json({
      attendance: attendanceRecords,
      schedules: schedules,
      students: uniqueStudents,
      total: attendanceRecords.length
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// POST /api/mentor/batches/[id]/attendance - Mark attendance for students
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
    const validatedData = markAttendanceSchema.parse(body);

    // Convert batch ID to ObjectId
    const batchObjectId = new mongoose.Types.ObjectId(id);
    const classDate = new Date(validatedData.classDate);
    
    // Set time to start of day for consistent date comparison
    classDate.setHours(0, 0, 0, 0);

    // Get schedule if provided
    let schedule = null;
    if (validatedData.scheduleId) {
      schedule = await Schedule.findById(validatedData.scheduleId);
      if (!schedule || schedule.batchId.toString() !== id) {
        return NextResponse.json(
          { error: 'Schedule not found or does not belong to this batch' },
          { status: 404 }
        );
      }
    }

    // Verify all students are enrolled in this batch - use robust lookup
    const studentIds = validatedData.attendance.map(a => new mongoose.Types.ObjectId(a.studentId));
    
    // First, try to find enrollments with ObjectId
    let enrollments = await Enrollment.find({
      batch: batchObjectId,
      student: { $in: studentIds }
    });

    // If not all students found, try with string ID
    if (enrollments.length !== studentIds.length) {
      const enrollmentsString = await Enrollment.find({
        batch: id,
        student: { $in: studentIds }
      });
      
      // Merge unique enrollments
      const foundStudentIds = new Set([
        ...enrollments.map(e => e.student.toString()),
        ...enrollmentsString.map(e => e.student.toString())
      ]);
      
      enrollments = [...enrollments, ...enrollmentsString.filter(e => 
        !foundStudentIds.has(e.student.toString())
      )];
    }

    // If still not all students found, check invoices
    if (enrollments.length !== studentIds.length) {
      const foundStudentIds = new Set(enrollments.map(e => e.student.toString()));
      const missingStudentIds = studentIds.filter(id => !foundStudentIds.has(id.toString()));
      
      if (missingStudentIds.length > 0) {
        // Check if these students have paid invoices for this batch
        const invoices = await Invoice.find({
          batchId: id,
          studentId: { $in: missingStudentIds.map(id => id.toString()) },
          status: { $in: ['paid', 'partial'] }
        });

        const invoiceStudentIds = new Set(invoices.map(inv => inv.studentId));
        const allFoundStudentIds = new Set([
          ...Array.from(foundStudentIds),
          ...Array.from(invoiceStudentIds)
        ]);

        // If all students have either enrollments or paid invoices, allow attendance
        const allStudentsFound = studentIds.every(id => 
          allFoundStudentIds.has(id.toString())
        );

        if (!allStudentsFound) {
          return NextResponse.json(
            { error: 'Some students are not enrolled in this batch' },
            { status: 400 }
          );
        }
      }
    }

    // Create or update attendance records
    const attendanceRecords = [];
    for (const att of validatedData.attendance) {
      const studentId = new mongoose.Types.ObjectId(att.studentId);
      const scheduleObjectId = validatedData.scheduleId ? new mongoose.Types.ObjectId(validatedData.scheduleId) : null;
      
      // Check if attendance already exists
      // When scheduleId is provided, use the sparse unique index: student + scheduleId
      // When scheduleId is not provided, use the regular unique index: student + batch + classDate
      let existingAttendance;
      
      if (scheduleObjectId) {
        // Check using the sparse unique index (student + scheduleId)
        existingAttendance = await Attendance.findOne({
          student: studentId,
          scheduleId: scheduleObjectId
        });
      } else {
        // Check using the regular unique index (student + batch + classDate)
        existingAttendance = await Attendance.findOne({
          student: studentId,
          batch: batchObjectId,
          classDate: classDate
        });
      }

      if (existingAttendance) {
        // Update existing attendance
        existingAttendance.status = att.status;
        existingAttendance.notes = att.notes;
        existingAttendance.markedBy = payload.userId;
        existingAttendance.markedAt = new Date();
        existingAttendance.classDate = classDate; // Update date in case it changed
        existingAttendance.batch = batchObjectId; // Ensure batch is set
        if (att.status === 'present' || att.status === 'late') {
          existingAttendance.checkInTime = new Date();
        }
        await existingAttendance.save();
        attendanceRecords.push(existingAttendance);
      } else {
        // Create new attendance record
        const newAttendance = new Attendance({
          student: studentId,
          batch: batchObjectId,
          scheduleId: scheduleObjectId,
          classDate: classDate,
          status: att.status,
          notes: att.notes,
          markedBy: payload.userId,
          markedAt: new Date(),
          isOnline: batch.courseType === 'online',
          checkInTime: (att.status === 'present' || att.status === 'late') ? new Date() : undefined
        });
        
        try {
          await newAttendance.save();
          attendanceRecords.push(newAttendance);
        } catch (saveError: any) {
          // Handle duplicate key error - try to find and update instead
          if (saveError.code === 11000) {
            // Duplicate key error - try to find the existing record
            let duplicateRecord;
            if (scheduleObjectId) {
              duplicateRecord = await Attendance.findOne({
                student: studentId,
                scheduleId: scheduleObjectId
              });
            } else {
              duplicateRecord = await Attendance.findOne({
                student: studentId,
                batch: batchObjectId,
                classDate: classDate
              });
            }
            
            if (duplicateRecord) {
              // Update the existing record
              duplicateRecord.status = att.status;
              duplicateRecord.notes = att.notes;
              duplicateRecord.markedBy = payload.userId;
              duplicateRecord.markedAt = new Date();
              duplicateRecord.classDate = classDate;
              duplicateRecord.batch = batchObjectId;
              if (att.status === 'present' || att.status === 'late') {
                duplicateRecord.checkInTime = new Date();
              }
              await duplicateRecord.save();
              attendanceRecords.push(duplicateRecord);
            } else {
              // If we can't find it, re-throw the error
              throw saveError;
            }
          } else {
            // Re-throw non-duplicate errors
            throw saveError;
          }
        }
      }
    }

    return NextResponse.json({
      message: 'Attendance marked successfully',
      attendance: attendanceRecords
    }, { status: 201 });

  } catch (error) {
    console.error('Error marking attendance:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    // Handle MongoDB duplicate key errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { error: 'Attendance already exists for this student and schedule. Please update the existing record instead.' },
        { status: 409 }
      );
    }

    // Provide more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to mark attendance';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

