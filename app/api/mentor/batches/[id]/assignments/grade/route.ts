import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import Assignment from '@/models/Assignment';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const gradeAssignmentSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  grade: z.number().min(0).max(1000, 'Grade must be between 0 and 1000'),
  feedback: z.string().optional()
});

// POST /api/mentor/batches/[id]/assignments/grade - Grade an assignment submission
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
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validatedData = gradeAssignmentSchema.parse(body);

    // Find assignment
    const assignment = await Assignment.findOne({
      _id: validatedData.assignmentId,
      batchId: id
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Find student's submission
    const submissionIndex = assignment.submissions?.findIndex((sub: any) => 
      sub.student?.toString() === validatedData.studentId ||
      (typeof sub.student === 'object' && sub.student._id?.toString() === validatedData.studentId)
    );

    if (submissionIndex === -1 || submissionIndex === undefined) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update submission with grade and feedback
    const submission = assignment.submissions[submissionIndex];
    submission.grade = validatedData.grade;
    submission.feedback = validatedData.feedback || '';
    submission.gradedBy = payload.userId;
    submission.gradedAt = new Date();

    await assignment.save();

    return NextResponse.json({
      message: 'Assignment graded successfully',
      submission: {
        grade: submission.grade,
        feedback: submission.feedback,
        gradedAt: submission.gradedAt
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error grading assignment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to grade assignment' },
      { status: 500 }
    );
  }
}

