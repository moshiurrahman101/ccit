import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Invoice from '@/models/Invoice';
import Assignment from '@/models/Assignment';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/student/batches/[id]/assignments - Get assignments for a batch
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
    
    if (!payload || payload.role !== 'student') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Convert batch ID to ObjectId for proper matching
    let batchObjectId;
    try {
      batchObjectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    // Check if student is enrolled in this batch - try both string and ObjectId
    let enrollment = await Enrollment.findOne({
      student: payload.userId,
      batch: batchObjectId
    });

    // If not found, try with string ID
    if (!enrollment) {
      enrollment = await Enrollment.findOne({
        student: payload.userId,
        batch: id
      });
    }

    // If still not found, check invoices (enrollment might not exist yet)
    if (!enrollment) {
      const invoice = await Invoice.findOne({
        studentId: payload.userId,
        batchId: id
      });

      if (invoice && (invoice.status === 'paid' || invoice.status === 'partial')) {
        // Create a mock enrollment object from invoice for access check
        enrollment = {
          _id: new mongoose.Types.ObjectId(),
          student: payload.userId,
          batch: batchObjectId,
          status: 'approved',
          paymentStatus: invoice.status === 'paid' ? 'paid' : 'partial',
          amount: invoice.finalAmount || 0,
          progress: 0,
          enrollmentDate: invoice.createdAt || new Date(),
          createdAt: invoice.createdAt || new Date(),
          updatedAt: invoice.updatedAt || new Date()
        } as any;
      }
    }

    console.log('=== STUDENT ASSIGNMENTS ACCESS CHECK ===');
    console.log('Student ID:', payload.userId);
    console.log('Batch ID:', id);
    console.log('Batch ObjectId:', batchObjectId.toString());
    console.log('Enrollment found:', !!enrollment);
    if (enrollment) {
      console.log('Enrollment status:', enrollment.status);
      console.log('Enrollment payment status:', enrollment.paymentStatus);
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Access denied - not enrolled in this batch' },
        { status: 403 }
      );
    }

    // Check if enrollment is approved and payment is verified
    // Students can access batch features after payment (full or partial) is verified by admin
    if (enrollment.paymentStatus !== 'paid' && enrollment.paymentStatus !== 'partial') {
      return NextResponse.json(
        { 
          error: 'Access denied - payment verification pending. Please wait for admin approval.',
          enrollmentStatus: enrollment.status,
          paymentStatus: enrollment.paymentStatus
        },
        { status: 403 }
      );
    }

    // Fetch assignments from database - only published ones for students
    const assignments = await Assignment.find({ 
      batchId: batchObjectId,
      status: 'published' // Only show published assignments to students
    })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .lean();

    // Format assignments for response with student's submission data
    const formattedAssignments = assignments.map((assignment: any) => {
      // Find student's submission if exists
      const studentSubmission = assignment.submissions?.find((sub: any) => 
        sub.student?.toString() === payload.userId || 
        (typeof sub.student === 'object' && sub.student._id?.toString() === payload.userId)
      );

      // Determine status based on submission
      let status = 'assigned';
      if (studentSubmission) {
        if (studentSubmission.grade !== undefined && studentSubmission.grade !== null) {
          status = 'graded';
        } else {
          status = 'submitted';
        }
      }

      return {
        _id: assignment._id?.toString() || assignment._id,
        title: assignment.title,
        description: assignment.description,
        instructions: assignment.instructions || '',
        dueDate: assignment.dueDate?.toISOString() || new Date(assignment.dueDate).toISOString(),
        maxPoints: assignment.maxPoints,
        attachments: assignment.attachments || [],
        status: status,
        submittedAt: studentSubmission?.submittedAt?.toISOString() || null,
        submissionLink: studentSubmission?.content || null,
        grade: studentSubmission?.grade || null,
        feedback: studentSubmission?.feedback || null,
        submissions: assignment.submissions?.length || 0,
        createdAt: assignment.createdAt?.toISOString() || new Date(assignment.createdAt).toISOString(),
        updatedAt: assignment.updatedAt?.toISOString() || new Date(assignment.updatedAt).toISOString()
      };
    });

    return NextResponse.json({
      assignments: formattedAssignments,
      total: formattedAssignments.length
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}
