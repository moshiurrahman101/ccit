import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Batch from '@/models/Batch';
import { Enrollment } from '@/models/Enrollment';
import Invoice from '@/models/Invoice';
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
        { phone: { $regex: search, $options: 'i' } },
        { 'studentInfo.studentId': { $regex: search, $options: 'i' } }
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

    // Enrich students with enrollment and payment data
    // Calculate stats for all students (not just current page)
    const statsFilter = { role: 'student' };
    const totalStudentsCount = await User.countDocuments(statsFilter);
    const pendingCount = await User.countDocuments({ ...statsFilter, approvalStatus: 'pending' });
    const approvedCount = await User.countDocuments({ ...statsFilter, approvalStatus: 'approved' });
    const rejectedCount = await User.countDocuments({ ...statsFilter, approvalStatus: 'rejected' });
    
    // Calculate payment stats more efficiently
    // Get all invoices grouped by student
    const allInvoices = await Invoice.find({ status: { $ne: 'cancelled' } }).sort({ studentId: 1, createdAt: -1 });
    const latestInvoiceByStudent = new Map();
    
    allInvoices.forEach(invoice => {
      const studentId = invoice.studentId.toString();
      if (!latestInvoiceByStudent.has(studentId)) {
        latestInvoiceByStudent.set(studentId, invoice);
      }
    });
    
    // Count payment statuses from invoices
    let paidCount = 0;
    let overdueCount = 0;
    let dueCount = totalStudentsCount; // Start with all students, subtract those with paid/overdue
    
    latestInvoiceByStudent.forEach((invoice) => {
      if (invoice.status === 'paid') {
        paidCount++;
        dueCount--;
      } else if (invoice.status === 'overdue') {
        overdueCount++;
        dueCount--;
      }
      // If status is 'partial' or 'pending', it counts as 'due', so we don't adjust dueCount
    });

    const enrichedStudents = await Promise.all(
      students.map(async (student) => {
        const studentObj = student.toObject();
        
        // Get active enrollments for this student
        const enrollments = await Enrollment.find({
          student: student._id
        })
          .populate('batch', 'name batchCode')
          .populate('course', 'title courseCode')
          .sort({ createdAt: -1 });

        // Get invoices for this student
        const invoices = await Invoice.find({
          studentId: student._id
        }).sort({ createdAt: -1 });

        // Calculate payment status from enrollments and invoices
        let overallPaymentStatus: 'paid' | 'partial' | 'due' | 'overdue' = 'due';
        let totalPaid = 0;
        let totalDue = 0;
        let hasCompletedCourse = false;

        if (enrollments.length > 0) {
          // Check if any enrollment is completed
          hasCompletedCourse = enrollments.some(e => e.status === 'completed');
          
          // Get the most recent active enrollment
          const activeEnrollment = enrollments.find(e => 
            e.status === 'approved' || e.status === 'completed'
          ) || enrollments[0];

          // Map enrollment paymentStatus to student paymentStatus
          if (activeEnrollment.paymentStatus === 'paid') {
            overallPaymentStatus = 'paid';
          } else if (activeEnrollment.paymentStatus === 'partial') {
            overallPaymentStatus = 'partial';
          } else {
            overallPaymentStatus = 'due';
          }
        }

        // Calculate from invoices if available
        if (invoices.length > 0) {
          const totalFinalAmount = invoices.reduce((sum, inv) => sum + (inv.finalAmount || 0), 0);
          const totalPaidAmount = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
          totalPaid = totalPaidAmount;
          totalDue = totalFinalAmount - totalPaidAmount;

          if (totalDue <= 0) {
            overallPaymentStatus = 'paid';
          } else if (totalPaidAmount > 0) {
            overallPaymentStatus = 'partial';
          } else {
            overallPaymentStatus = 'due';
          }
        }

        // Sync payment status to studentInfo if it exists, otherwise create it
        if (!studentObj.studentInfo) {
          studentObj.studentInfo = {};
        }
        if (!studentObj.studentInfo.paymentInfo) {
          studentObj.studentInfo.paymentInfo = {};
        }

        // Update payment info from enrollments/invoices if not set or different
        studentObj.studentInfo.paymentInfo.paymentStatus = overallPaymentStatus;
        studentObj.studentInfo.paymentInfo.paidAmount = totalPaid;
        studentObj.studentInfo.paymentInfo.dueAmount = totalDue;

        // If student has completed courses, mark batch status as completed
        if (hasCompletedCourse && studentObj.studentInfo.batchInfo) {
          const completedEnrollment = enrollments.find(e => e.status === 'completed');
          if (completedEnrollment && studentObj.studentInfo.batchInfo.status !== 'completed') {
            studentObj.studentInfo.batchInfo.status = 'completed';
          }
        }

        // Ensure studentId exists - if not, try to get from enrollments
        if (!studentObj.studentInfo.studentId && enrollments.length > 0) {
          // Could potentially generate one, but for now just keep as is
        }

        return studentObj;
      })
    );

    return NextResponse.json({
      students: enrichedStudents,
      pagination: {
        currentPage: page,
        totalPages,
        totalStudents,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      stats: {
        total: totalStudentsCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        due: dueCount,
        overdue: overdueCount,
        paid: paidCount
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
