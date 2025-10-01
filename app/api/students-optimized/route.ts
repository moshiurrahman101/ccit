import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Batch from '@/models/Batch';
import { verifyTokenEdge } from '@/lib/auth';

// GET all students with optimized queries
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyTokenEdge(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin or mentor
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !['admin', 'mentor'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const batch = searchParams.get('batch') || '';
    const status = searchParams.get('status') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';

    const skip = (page - 1) * limit;

    // Build optimized filter
    const filter: Record<string, unknown> = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (batch) {
      filter.batchId = batch;
    }
    
    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    // Optimized query with minimal data
    const students = await Student.find(filter)
      .populate('batchId', 'name courseType startDate endDate')
      .populate('userId', 'name email phone avatar')
      .select('studentId name email phone batchId status paymentStatus totalAmount paidAmount dueAmount enrollmentDate isVerified')
      .sort({ enrollmentDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalStudents = await Student.countDocuments(filter);
    const totalPages = Math.ceil(totalStudents / limit);

    return NextResponse.json({
      students,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'শিক্ষার্থীদের তথ্য আনতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// POST create new student (optimized)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyTokenEdge(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      batchId,
      emergencyContact,
      previousEducation,
      institution,
      totalAmount = 0,
      notes
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !batchId) {
      return NextResponse.json({ 
        error: 'নাম, ইমেইল, ফোন এবং ব্যাচ প্রয়োজন' 
      }, { status: 400 });
    }

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ 
        error: 'ব্যাচ পাওয়া যায়নি' 
      }, { status: 404 });
    }

    // Check if batch has space
    if (batch.currentStudents >= batch.maxStudents) {
      return NextResponse.json({ 
        error: 'ব্যাচ পূর্ণ' 
      }, { status: 400 });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (!user) {
      // Create minimal user
      user = new User({
        name,
        email,
        phone,
        password: '123456', // Default password
        role: 'student',
        isActive: true,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=64`,
        studentInfo: {
          studentId: '', // Will be set after student creation
          currentBatch: batchId,
          enrollmentDate: new Date(),
          isActiveStudent: true
        }
      });
      await user.save();
    }

    // Generate student ID
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const studentId = `STU${currentYear}${currentMonth.toString().padStart(2, '0')}${batch.currentStudents + 1}`;

    // Create student record
    const student = new Student({
      userId: user._id,
      studentId,
      batchId,
      name,
      email,
      phone,
      enrollmentDate: new Date(),
      status: 'enrolled',
      previousEducation,
      institution,
      paymentStatus: 'due',
      totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      emergencyContact,
      isOfflineStudent: false,
      isVerified: false,
      notes
    });

    await student.save();

    // Update user with student ID
    await User.findByIdAndUpdate(user._id, {
      'studentInfo.studentId': studentId
    });

    // Update batch student count
    await Batch.findByIdAndUpdate(batchId, {
      $inc: { currentStudents: 1 }
    });

    return NextResponse.json({
      message: 'শিক্ষার্থী সফলভাবে তৈরি হয়েছে',
      student: {
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        email: student.email,
        batchId: student.batchId
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'শিক্ষার্থী তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
