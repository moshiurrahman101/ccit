import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get pending students
    const pendingStudents = await User.find({ 
      role: 'student', 
      approvalStatus: 'pending' 
    }).select('name email phone createdAt approvalStatus').sort({ createdAt: -1 });

    // Get approved students
    const approvedStudents = await User.find({ 
      role: 'student', 
      approvalStatus: 'approved' 
    }).select('name email phone createdAt approvalStatus').sort({ createdAt: -1 });

    // Get rejected students
    const rejectedStudents = await User.find({ 
      role: 'student', 
      approvalStatus: 'rejected' 
    }).select('name email phone createdAt approvalStatus').sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: 'Student approval test data',
      data: {
        pendingStudents: pendingStudents.map(student => ({
          id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          approvalStatus: student.approvalStatus,
          createdAt: student.createdAt
        })),
        approvedStudents: approvedStudents.map(student => ({
          id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          approvalStatus: student.approvalStatus,
          createdAt: student.createdAt
        })),
        rejectedStudents: rejectedStudents.map(student => ({
          id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone,
          approvalStatus: student.approvalStatus,
          createdAt: student.createdAt
        })),
        summary: {
          total: pendingStudents.length + approvedStudents.length + rejectedStudents.length,
          pending: pendingStudents.length,
          approved: approvedStudents.length,
          rejected: rejectedStudents.length
        }
      }
    });

  } catch (error: unknown) {
    console.error('Error testing student approval:', error);
    return NextResponse.json(
      { message: 'Failed to test student approval', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
