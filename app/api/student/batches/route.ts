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

    // Build query
    const query: any = {
      student: payload.userId
    };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    // First, get enrollments with batch populated
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

    // Then manually populate mentor and course information for each enrollment
    const Course = (await import('@/models/Course')).default;
    const Mentor = (await import('@/models/Mentor')).default;
    
    for (let enrollment of enrollments) {
      if (enrollment.batch) {
        const batchData: any = enrollment.batch; // Type assertion for dynamic property assignment
        
        // Populate mentor information
        if (batchData.mentorId) {
          const mentor = await Mentor.findById(batchData.mentorId)
            .select('name avatar designation')
            .lean();
          
          if (mentor) {
            batchData.mentorId = mentor;
            console.log('Mentor populated for enrollment:', (mentor as any).name);
          } else {
            console.log('Mentor not found for ID:', batchData.mentorId);
            // Set a default mentor object if mentor doesn't exist
            batchData.mentorId = {
              _id: batchData.mentorId,
              name: 'Mentor Information Unavailable',
              designation: 'Contact Admin'
            };
          }
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

    const total = await Enrollment.countDocuments(query);

    console.log('=== STUDENT BATCH API DEBUG ===');
    console.log('Query:', query);
    console.log('Found enrollments:', enrollments.length);
    if (enrollments.length > 0) {
      console.log('First enrollment batch:', enrollments[0].batch);
      console.log('First enrollment mentorId:', enrollments[0].batch?.mentorId);
      console.log('First enrollment mentorId type:', typeof enrollments[0].batch?.mentorId);
      console.log('Is mentorId populated?', enrollments[0].batch?.mentorId && typeof enrollments[0].batch?.mentorId === 'object');
    }

    return NextResponse.json({
      success: true,
      batches: enrollments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
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