import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Batch from '@/models/Batch';
import { verifyTokenEdge } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { generateStudentId } from '@/lib/utils/studentIdGenerator';

// GET all students with comprehensive filtering
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
    const gender = searchParams.get('gender') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';

    const skip = (page - 1) * limit;

    // Build comprehensive filter
    const filter: Record<string, unknown> = { role: 'student' };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }
    }

    const students = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalStudents = await User.countDocuments(filter);
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

// POST create new student with comprehensive profile
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
      // Basic Info
      name,
      email,
      phone,
      password = '123456',
      
      // Student Info
      dateOfBirth,
      gender,
      nid,
      bloodGroup,
      
      // Address
      address,
      
      // Emergency Contact
      emergencyContact,
      
      // Education
      education,
      
      // Social Info
      socialInfo,
      
      // Payment Info
      paymentInfo,
      
      // Batch Info
      batchId,
      
      // Additional Info
      isOfflineStudent = false,
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

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ 
        error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' 
      }, { status: 400 });
    }

    // Generate student ID
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const studentId = generateStudentId({
      batchId: batchId,
      batchName: batch.name,
      year: currentYear,
      month: currentMonth,
      serial: batch.currentStudents + 1
    });

    // Create comprehensive student profile (password will be hashed by User model's pre('save') hook)
    const student = new User({
      name,
      email,
      phone,
      password, // Raw password - will be hashed automatically
      role: 'student',
      isActive: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      studentInfo: {
        studentId,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        nid,
        bloodGroup,
        address: address || {},
        emergencyContact: emergencyContact || {},
        education: education || {},
        socialInfo: socialInfo || {},
        paymentInfo: {
          paymentStatus: 'due',
          dueAmount: 0,
          paidAmount: 0,
          ...paymentInfo
        },
        batchInfo: {
          batchId: batchId,
          batchName: batch.name,
          enrollmentDate: new Date(),
          status: 'enrolled'
        },
        isOfflineStudent,
        notes,
        isVerified: false
      }
    });

    await student.save();

    // Update batch student count
    await Batch.findByIdAndUpdate(batchId, {
      $inc: { currentStudents: 1 }
    });

    // Create invoice for the student
    const Invoice = (await import('@/models/Invoice')).default;
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    
    const invoice = new Invoice({
      invoiceNumber,
      studentId: student._id,
      batchId: batchId,
      batchName: batch.name,
      courseType: batch.courseType,
      amount: batch.fee,
      discountAmount: 0,
      finalAmount: batch.fee,
      currency: batch.currency,
      status: 'pending',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paidAmount: 0,
      remainingAmount: batch.fee,
      payments: [],
      createdBy: payload.userId
    });

    await invoice.save();

    // Return student without password
    const { password: _, ...studentWithoutPassword } = student.toObject();

    return NextResponse.json({
      message: 'শিক্ষার্থী সফলভাবে তৈরি হয়েছে',
      student: studentWithoutPassword,
      invoice: invoice
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'শিক্ষার্থী তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
