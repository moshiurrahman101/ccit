import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import User from '@/models/User';
import Mentor from '@/models/Mentor';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';

// GET /api/mentor/batches/[id]/students - Get enrolled students for a batch
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
        console.log('Access denied for mentor:', {
          mentorId: mentor._id.toString(),
          batchMentorId: batch.mentorId?.toString(),
          batchCreatedBy: batch.createdBy,
          payloadUserId: payload.userId
        });
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    // Debug: Log the batch ID and check what we're looking for
    console.log('=== FETCHING STUDENTS FOR BATCH ===');
    console.log('Batch ID:', id);
    console.log('Batch ID type:', typeof id);

    // First, let's see all enrollments to understand the data structure
    const allEnrollments = await Enrollment.find({}).lean();
    console.log('All enrollments in database:', allEnrollments.length);
    console.log('Sample enrollment:', allEnrollments[0]);

    // Check if there are any enrollments with this batch ID
    const enrollmentsWithBatch = await Enrollment.find({ batch: id }).lean();
    console.log('Enrollments with batch ID:', enrollmentsWithBatch.length);

    // Check if there are enrollments with different statuses
    const allStatusEnrollments = await Enrollment.find({ batch: id }).lean();
    console.log('All enrollments for this batch (any status):', allStatusEnrollments.length);

    // Fetch enrolled students from enrollment collection
    // For now, show all enrollments regardless of status for debugging
    const enrollments = await Enrollment.find({ 
      batch: id
      // status: { $in: ['approved', 'completed'] } // Temporarily disabled for debugging
    })
    .populate('student', 'name email phone avatar')
    .sort({ enrollmentDate: -1 })
    .lean();

    console.log('Filtered enrollments (approved/completed):', enrollments.length);

    // Transform enrollment data to student format
    const students = enrollments.map(enrollment => ({
      _id: enrollment.student._id,
      name: enrollment.student.name,
      email: enrollment.student.email,
      phone: enrollment.student.phone,
      avatar: enrollment.student.avatar,
      enrollmentDate: enrollment.enrollmentDate,
      status: enrollment.status === 'completed' ? 'completed' : 'active',
      progress: enrollment.progress,
      paymentStatus: enrollment.paymentStatus,
      lastAccessed: enrollment.lastAccessed
    }));

    console.log('Final students data:', students);
    console.log('Students count:', students.length);

    return NextResponse.json({
      students: students,
      total: students.length,
      batch: {
        _id: batch._id,
        name: batch.name,
        currentStudents: students.length,
        maxStudents: batch.maxStudents
      },
      debug: {
        batchId: id,
        allEnrollmentsCount: allEnrollments.length,
        enrollmentsWithBatchCount: enrollmentsWithBatch.length,
        allStatusEnrollmentsCount: allStatusEnrollments.length,
        filteredEnrollmentsCount: enrollments.length
      }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/mentor/batches/[id]/students - Add student to batch
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

    const body = await request.json();
    const { studentEmail, studentId } = body;

    if (!studentEmail && !studentId) {
      return NextResponse.json(
        { error: 'Student email or ID is required' },
        { status: 400 }
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

    // Check if batch has space
    if (batch.currentStudents >= batch.maxStudents) {
      return NextResponse.json(
        { error: 'Batch is full' },
        { status: 400 }
      );
    }

    // Find student
    let student;
    if (studentId) {
      student = await User.findById(studentId);
    } else {
      student = await User.findOne({ email: studentEmail });
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if student is already enrolled in this batch
    const existingEnrollment = await Enrollment.findOne({
      student: student._id,
      batch: id
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Student is already enrolled in this batch' },
        { status: 400 }
      );
    }

    // Create enrollment record
    const enrollment = new Enrollment({
      student: student._id,
      course: batch.course, // Assuming batch has a course reference
      batch: id,
      status: 'approved', // Auto-approve when added by mentor
      paymentStatus: 'paid', // Assume paid when added by mentor
      amount: batch.discountPrice || batch.regularPrice,
      approvedBy: payload.userId,
      approvedAt: new Date(),
      progress: 0
    });

    await enrollment.save();

    // Update batch student count
    await Batch.findByIdAndUpdate(id, {
      $inc: { currentStudents: 1 }
    });

    return NextResponse.json({
      message: 'Student enrolled successfully',
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        enrollmentDate: enrollment.enrollmentDate,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error enrolling student:', error);
    return NextResponse.json(
      { error: 'Failed to enroll student' },
      { status: 500 }
    );
  }
}

// DELETE /api/mentor/batches/[id]/students - Remove student from batch
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
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Find and remove enrollment
    const enrollment = await Enrollment.findOneAndDelete({
      student: studentId,
      batch: id
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Student enrollment not found' },
        { status: 404 }
      );
    }

    // Update batch student count
    await Batch.findByIdAndUpdate(id, {
      $inc: { currentStudents: -1 }
    });

    return NextResponse.json({
      message: 'Student removed from batch successfully'
    });

  } catch (error) {
    console.error('Error removing student:', error);
    return NextResponse.json(
      { error: 'Failed to remove student' },
      { status: 500 }
    );
  }
}
