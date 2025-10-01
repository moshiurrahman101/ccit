import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { Enrollment } from '@/models/Enrollment';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const approvalSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !['admin', 'marketing'].includes(currentUser.role)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    // Get pending students
    const pendingStudents = await User.find({
      role: 'student',
      approvalStatus: 'pending'
    })
    .select('name email phone createdAt approvalStatus')
    .sort({ createdAt: -1 });

    console.log('=== ADMIN STUDENT APPROVALS DEBUG ===');
    console.log('Found pending students:', pendingStudents.length);
    console.log('Pending students:', pendingStudents.map(s => ({ id: s._id, name: s.name, email: s.email, approvalStatus: s.approvalStatus })));

    // Also check the specific student we're debugging
    const specificStudent = await User.findById('68da85325d8c3b1cb6170a8d');
    console.log('=== SPECIFIC STUDENT DEBUG ===');
    console.log('Student 68da85325d8c3b1cb6170a8d:', specificStudent ? {
      id: specificStudent._id,
      name: specificStudent.name,
      email: specificStudent.email,
      approvalStatus: specificStudent.approvalStatus,
      role: specificStudent.role
    } : 'Student not found');

    return NextResponse.json({
      success: true,
      students: pendingStudents,
      debug: {
        totalPendingStudents: pendingStudents.length,
        specificStudent: specificStudent ? {
          id: specificStudent._id,
          name: specificStudent.name,
          email: specificStudent.email,
          approvalStatus: specificStudent.approvalStatus,
          role: specificStudent.role
        } : null
      }
    });

  } catch (error: unknown) {
    console.error('Error fetching pending students:', error);
    return NextResponse.json(
      { message: 'Failed to fetch pending students' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || !['admin', 'marketing'].includes(currentUser.role)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, rejectionReason } = approvalSchema.parse(body);

    // Find the student
    const student = await User.findById(userId);
    if (!student) {
      return NextResponse.json({ message: 'Student not found' }, { status: 404 });
    }

    if (student.role !== 'student') {
      return NextResponse.json({ message: 'User is not a student' }, { status: 400 });
    }

    if (student.approvalStatus !== 'pending') {
      return NextResponse.json({ message: 'Student approval status is not pending' }, { status: 400 });
    }

    // Update approval status
    const updateData: any = {
      approvalStatus: action === 'approve' ? 'approved' : 'rejected',
      approvalDate: new Date(),
      approvedBy: currentUser._id
    };

    if (action === 'reject' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    console.log('=== STUDENT APPROVAL UPDATE ===');
    console.log('User ID:', userId);
    console.log('Action:', action);
    console.log('Updated user approval status:', updatedUser?.approvalStatus);

    // If student is approved, also update their enrollment status
    if (action === 'approve') {
      const enrollmentUpdate = await Enrollment.updateMany(
        { student: userId, status: 'pending' },
        { 
          status: 'approved',
          approvedBy: currentUser._id,
          approvedAt: new Date()
        }
      );
      console.log('Enrollment update result:', enrollmentUpdate);
      console.log('Modified enrollments count:', enrollmentUpdate.modifiedCount);
    }

    return NextResponse.json({
      success: true,
      message: `Student ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      debug: {
        userId: userId,
        action: action,
        userApprovalStatus: updatedUser?.approvalStatus,
        enrollmentsUpdated: action === 'approve' ? 'checked' : 'skipped'
      }
    });

  } catch (error: unknown) {
    console.error('Error processing student approval:', error);
    
    if (error && typeof error === 'object' && 'issues' in error) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: (error as any).issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to process approval' },
      { status: 500 }
    );
  }
}
