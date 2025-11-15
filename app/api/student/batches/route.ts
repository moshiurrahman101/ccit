import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import User from '@/models/User';
import Batch from '@/models/Batch';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is student
    if (payload.role !== 'student') {
      return NextResponse.json({ message: 'Student access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Build query - show all enrollments regardless of status
    // Students should see their enrolled batches even if payment is pending
    const query: any = {
      student: payload.userId
    };
    
    // Only filter by status if explicitly requested and not 'all'
    // This allows students to see pending enrollments
    if (status && status !== 'all' && status !== 'pending') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // First, get enrollments with batch populated
    // Also include enrollments where batch might be null (for invoices without enrollment)
    const enrollments = await Enrollment.find(query)
      .populate({
        path: 'batch',
        model: Batch,
        select: 'name description coverPhoto courseType regularPrice discountPrice mentorId courseId startDate endDate maxStudents currentStudents status'
      })
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Also check for invoices that might not have enrollment records yet
    const Invoice = (await import('@/models/Invoice')).default;
    const invoices = await Invoice.find({
      studentId: payload.userId
    })
      .populate({
        path: 'batchId',
        model: Batch,
        select: 'name description coverPhoto courseType regularPrice discountPrice mentorId courseId startDate endDate maxStudents currentStudents status'
      })
      .sort({ createdAt: -1 })
      .lean();

    // Create a map of batch IDs that already have enrollments
    const enrolledBatchIds = new Set(
      enrollments
        .filter(e => e.batch && e.batch._id)
        .map(e => e.batch._id.toString())
    );

    // Add invoices that don't have enrollment records yet
    for (const invoice of invoices) {
      if (invoice.batchId && !enrolledBatchIds.has(invoice.batchId._id.toString())) {
        // Create a mock enrollment object from invoice
        const mockEnrollment: any = {
          _id: invoice._id,
          student: payload.userId,
          course: invoice.batchId.courseId || null,
          batch: invoice.batchId,
          enrollmentDate: invoice.createdAt || new Date(),
          status: 'pending', // Payment pending
          paymentStatus: invoice.status === 'paid' ? 'paid' : 'pending',
          amount: invoice.finalAmount || invoice.amount,
          progress: 0,
          lastAccessed: new Date(),
          createdAt: invoice.createdAt || new Date(),
          updatedAt: invoice.updatedAt || new Date()
        };
        enrollments.push(mockEnrollment);
      }
    }

    // Then manually populate mentor and course information for each enrollment
    const Course = (await import('@/models/Course')).default;
    const Mentor = (await import('@/models/Mentor')).default;
    
    for (let enrollment of enrollments) {
      if (enrollment.batch) {
        const batchData: any = enrollment.batch; // Type assertion for dynamic property assignment
        
        // Populate mentor information
        // Handle both ObjectId and populated mentor object
        let mentorIdValue = batchData.mentorId;
        if (mentorIdValue && typeof mentorIdValue === 'object' && mentorIdValue._id) {
          mentorIdValue = mentorIdValue._id;
        } else if (mentorIdValue && typeof mentorIdValue === 'object' && mentorIdValue.toString) {
          mentorIdValue = mentorIdValue.toString();
        }
        
        if (mentorIdValue && typeof mentorIdValue === 'string') {
          const mentor = await Mentor.findById(mentorIdValue)
            .select('name avatar designation')
            .lean();
          
          if (mentor) {
            batchData.mentorId = mentor;
            console.log('Mentor populated for enrollment:', (mentor as any).name);
          } else {
            console.log('Mentor not found for ID:', mentorIdValue);
            // Set a default mentor object if mentor doesn't exist
            batchData.mentorId = {
              _id: mentorIdValue,
              name: 'Mentor Information Unavailable',
              designation: 'Contact Admin'
            };
          }
        } else if (!mentorIdValue) {
          // No mentor ID, set default
          batchData.mentorId = {
            _id: null,
            name: 'Mentor Information Unavailable',
            designation: 'Contact Admin'
          };
        }
        
        // Populate course information to get modules, duration, etc.
        if (batchData.courseId) {
          const course: any = await Course.findById(batchData.courseId)
            .select('modules duration durationUnit whatYouWillLearn requirements features')
            .lean();
          
          if (course) {
            // Add course fields to batch object
            batchData.modules = course.modules || [];
            batchData.duration = course.duration || 0;
            batchData.durationUnit = course.durationUnit || 'months';
            batchData.whatYouWillLearn = course.whatYouWillLearn || [];
            batchData.requirements = course.requirements || [];
            batchData.features = course.features || [];
            console.log('Course data populated for batch, modules count:', course.modules?.length || 0);
          } else {
            console.log('Course not found for ID:', batchData.courseId);
            // Set defaults if course doesn't exist
            batchData.modules = [];
            batchData.duration = 0;
            batchData.durationUnit = 'months';
          }
        }
      }
    }

    // Count total enrollments and invoices
    const enrollmentCount = await Enrollment.countDocuments(query);
    const invoiceCount = await Invoice.countDocuments({ studentId: payload.userId });
    // Total is the unique count (enrollments + invoices without enrollment)
    const total = Math.max(enrollmentCount, invoiceCount);

    console.log('=== STUDENT BATCH API DEBUG ===');
    console.log('Query:', query);
    console.log('Found enrollments:', enrollments.length);
    console.log('Enrollment count:', enrollmentCount);
    console.log('Invoice count:', invoiceCount);
    if (enrollments.length > 0) {
      console.log('First enrollment batch:', enrollments[0].batch);
      console.log('First enrollment status:', enrollments[0].status);
      console.log('First enrollment paymentStatus:', enrollments[0].paymentStatus);
      console.log('First enrollment mentorId:', enrollments[0].batch?.mentorId);
    }

    return NextResponse.json({
      success: true,
      batches: enrollments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(enrollments.length / limit),
        totalItems: enrollments.length,
        itemsPerPage: limit
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching student batches:', error);
    return NextResponse.json(
      { message: 'Failed to fetch student batches' },
      { status: 500 }
    );
  }
}