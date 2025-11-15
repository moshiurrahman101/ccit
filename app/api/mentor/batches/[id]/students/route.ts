import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import User from '@/models/User';
import Mentor from '@/models/Mentor';
import { Enrollment } from '@/models/Enrollment';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

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
    console.log('Batch currentStudents:', batch.currentStudents);

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

    // First, let's see all enrollments to understand the data structure
    const allEnrollments = await Enrollment.find({}).lean();
    console.log('All enrollments in database:', allEnrollments.length);
    
    // Log the actual enrollment data to see what batch field looks like
    if (allEnrollments.length > 0) {
      console.log('=== ACTUAL ENROLLMENT DATA ===');
      allEnrollments.forEach((enrollment, index) => {
        console.log(`Enrollment ${index + 1}:`, {
          _id: enrollment._id,
          batch: enrollment.batch,
          batchType: typeof enrollment.batch,
          batchString: enrollment.batch?.toString(),
          batchIdString: batchObjectId.toString(),
          matches: enrollment.batch?.toString() === batchObjectId.toString(),
          student: enrollment.student,
          course: enrollment.course,
          paymentStatus: enrollment.paymentStatus,
          status: enrollment.status
        });
      });
    }

    // Check if there are any enrollments with this batch ID (as string or ObjectId)
    const enrollmentsWithBatchString = await Enrollment.find({ batch: id }).lean();
    const enrollmentsWithBatchObjectId = await Enrollment.find({ batch: batchObjectId }).lean();
    console.log('Enrollments with batch ID (string):', enrollmentsWithBatchString.length);
    console.log('Enrollments with batch ID (ObjectId):', enrollmentsWithBatchObjectId.length);
    
    // Also check if batch field might be stored as string
    const enrollmentsWithBatchAsString = await Enrollment.find({ 
      batch: { $in: [id, batchObjectId.toString()] }
    }).lean();
    console.log('Enrollments with batch (any format):', enrollmentsWithBatchAsString.length);

    // First, try to find enrollments by batch ObjectId (without paymentStatus filter to get all enrolled students)
    let enrollments = await Enrollment.find({ 
      batch: batchObjectId
    })
    .populate({
      path: 'student',
      select: 'name email phone avatar',
      model: 'User'
    })
    .sort({ enrollmentDate: -1 })
    .lean();

    // If no enrollments found, try finding by batch ID as string (since Invoice stores it as string)
    if (enrollments.length === 0) {
      console.log('No enrollments found with ObjectId, trying string match...');
      enrollments = await Enrollment.find({ 
        batch: id // Try as string
      })
      .populate({
        path: 'student',
        select: 'name email phone avatar',
        model: 'User'
      })
      .sort({ enrollmentDate: -1 })
      .lean();
    }

    // If still no enrollments, try to find students via invoices (since invoices have batchId as string)
    // Also check invoices even if enrollments exist, to catch any invoices without enrollment records
    console.log('Checking invoices for this batch...');
    const invoices = await Invoice.find({ 
      batchId: id // Invoice stores batchId as string
      // Include all invoices, not just paid ones, to match the batch count
    }).lean();
      
    console.log('Invoices found for this batch:', invoices.length);
    
    if (invoices.length > 0) {
      // Get unique student IDs from invoices
      const studentIds = [...new Set(invoices.map(inv => inv.studentId))];
      console.log('Student IDs from invoices:', studentIds);
      
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
          }).select('name email phone avatar').lean();
          
          // Get invoices for missing students
          const missingInvoices = invoices.filter(inv => missingStudentIds.includes(inv.studentId));
          
          // Create mock enrollment-like objects from invoices
          const mockEnrollments = missingInvoices.map(invoice => {
            const student = studentsFromInvoices.find((s: any) => s._id?.toString() === invoice.studentId);
            if (!student) return null;
            
            return {
              _id: new mongoose.Types.ObjectId(),
              student: student,
              batch: batchObjectId,
              enrollmentDate: invoice.createdAt,
              status: invoice.status === 'paid' || invoice.status === 'partial' ? 'approved' : 'pending',
              paymentStatus: invoice.status === 'paid' ? 'paid' : invoice.status === 'partial' ? 'partial' : 'pending',
              progress: 0,
              createdAt: invoice.createdAt,
              updatedAt: invoice.updatedAt
            };
          }).filter(e => e !== null) as any[];
          
          // Add mock enrollments to the existing enrollments array
          enrollments = [...enrollments, ...mockEnrollments];
          console.log('Added students from invoices:', mockEnrollments.length);
        }
      } else {
        // No enrollments found, try to find enrollments by student and batch (without paymentStatus filter)
        enrollments = await Enrollment.find({
          student: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) },
          $or: [
            { batch: batchObjectId },
            { batch: id }
          ]
        })
        .populate({
          path: 'student',
          select: 'name email phone avatar',
          model: 'User'
        })
        .sort({ enrollmentDate: -1 })
        .lean();
        
        console.log('Enrollments found via invoices:', enrollments.length);
        
        // If still no enrollments, create student list directly from invoices
        if (enrollments.length === 0 && studentIds.length > 0) {
          console.log('Creating student list directly from invoices...');
          const studentsFromInvoices = await User.find({
            _id: { $in: studentIds.map(id => new mongoose.Types.ObjectId(id)) }
          }).select('name email phone avatar').lean();
          
          // Create mock enrollment-like objects from invoices
          enrollments = invoices.map(invoice => {
            const student = studentsFromInvoices.find((s: any) => s._id?.toString() === invoice.studentId);
            if (!student) return null;
            
            return {
              _id: new mongoose.Types.ObjectId(),
              student: student,
              batch: batchObjectId,
              enrollmentDate: invoice.createdAt,
              status: invoice.status === 'paid' || invoice.status === 'partial' ? 'approved' : 'pending',
              paymentStatus: invoice.status === 'paid' ? 'paid' : invoice.status === 'partial' ? 'partial' : 'pending',
              progress: 0,
              createdAt: invoice.createdAt,
              updatedAt: invoice.updatedAt
            };
          }).filter(e => e !== null) as any[];
          
          console.log('Students created from invoices:', enrollments.length);
        }
      }
    }

    console.log('=== ENROLLMENT QUERY RESULTS ===');
    console.log('Batch ID searched:', id);
    console.log('Batch ObjectId:', batchObjectId.toString());
    console.log('Enrollments found (all payment statuses):', enrollments.length);
    if (enrollments.length > 0) {
      console.log('Sample enrollment:', {
        _id: enrollments[0]._id,
        batch: enrollments[0].batch,
        batchType: typeof enrollments[0].batch,
        student: enrollments[0].student ? {
          _id: enrollments[0].student._id,
          name: enrollments[0].student.name,
          type: typeof enrollments[0].student
        } : 'No student',
        status: enrollments[0].status,
        paymentStatus: enrollments[0].paymentStatus
      });
    } else {
      console.log('No enrollments found. Checking all enrollments for this batch...');
      // Check enrollments without paymentStatus filter
      const allBatchEnrollments = await Enrollment.find({ batch: batchObjectId }).lean();
      console.log('All enrollments for this batch (any paymentStatus):', allBatchEnrollments.length);
      if (allBatchEnrollments.length > 0) {
        console.log('Sample enrollment (any status):', {
          _id: allBatchEnrollments[0]._id,
          paymentStatus: allBatchEnrollments[0].paymentStatus,
          status: allBatchEnrollments[0].status
        });
      }
    }

    // Transform enrollment data to student format
    // Handle cases where student might not be populated
    const studentsPromises = enrollments.map(async (enrollment, index) => {
      let studentData: any = null;
      
      console.log(`Processing enrollment ${index + 1}/${enrollments.length}:`, {
        enrollmentId: enrollment._id,
        hasStudent: !!enrollment.student,
        studentType: typeof enrollment.student
      });
      
      // Check if student is populated
      if (enrollment.student && typeof enrollment.student === 'object' && 'name' in enrollment.student) {
        // Student is already populated
        studentData = enrollment.student;
        console.log(`Enrollment ${index + 1}: Student already populated:`, studentData._id, studentData.name);
      } else if (enrollment.student) {
        // Student is an ObjectId, fetch it manually
        const studentId = typeof enrollment.student === 'string' 
          ? enrollment.student 
          : enrollment.student._id?.toString() || enrollment.student.toString();
        
        console.log(`Enrollment ${index + 1}: Fetching student with ID:`, studentId);
        studentData = await User.findById(studentId).select('name email phone avatar').lean();
        
        if (!studentData) {
          console.log(`Enrollment ${index + 1}: Student not found for ID:`, studentId);
          return null;
        }
        console.log(`Enrollment ${index + 1}: Student found:`, studentData._id, studentData.name);
      } else {
        console.log(`Enrollment ${index + 1}: Enrollment has no student field:`, enrollment._id);
        return null;
      }
      
      return {
        _id: studentData._id.toString(),
        name: studentData.name || 'Unknown Student',
        email: studentData.email || 'No email',
        phone: studentData.phone || '',
        avatar: studentData.avatar,
        enrollmentDate: enrollment.enrollmentDate || enrollment.createdAt || new Date(),
        status: enrollment.status === 'completed' ? 'completed' : enrollment.status === 'approved' ? 'active' : 'pending',
        progress: enrollment.progress || 0,
        paymentStatus: enrollment.paymentStatus || 'pending',
        lastAccessed: enrollment.lastAccessed || enrollment.enrollmentDate || enrollment.createdAt || new Date()
      };
    });
    
    // Wait for all student data to be fetched
    const studentsResults = await Promise.all(studentsPromises);
    const studentsFiltered = studentsResults.filter(student => student !== null) as any[];
    
    // Remove duplicates by student ID (in case same student has multiple enrollments/invoices)
    const uniqueStudentsMap = new Map<string, any>();
    studentsFiltered.forEach(student => {
      if (student && student._id) {
        // Keep the first occurrence or the one with more recent enrollment date
        const existing = uniqueStudentsMap.get(student._id);
        if (!existing || 
            (student.enrollmentDate && existing.enrollmentDate && 
             new Date(student.enrollmentDate) > new Date(existing.enrollmentDate))) {
          uniqueStudentsMap.set(student._id, student);
        }
      }
    });
    
    const students = Array.from(uniqueStudentsMap.values());

    console.log('=== STUDENT TRANSFORMATION RESULTS ===');
    console.log('Total enrollments processed:', enrollments.length);
    console.log('Students after filtering nulls:', studentsFiltered.length);
    console.log('Students after deduplication:', students.length);
    console.log('Final students data:', students.map(s => ({ _id: s._id, name: s.name, email: s.email })));

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
        batchObjectId: batchObjectId.toString(),
        allEnrollmentsCount: allEnrollments.length,
        enrollmentsWithBatchStringCount: enrollmentsWithBatchString.length,
        enrollmentsWithBatchObjectIdCount: enrollmentsWithBatchObjectId.length,
        filteredEnrollmentsCount: enrollments.length,
        batchCurrentStudents: batch.currentStudents
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
