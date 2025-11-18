import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Invoice from '@/models/Invoice';
import Assignment from '@/models/Assignment';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';
import { z } from 'zod';

const submitAssignmentSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
  facebookPostLink: z.string().url('Valid Facebook post URL is required')
});

// POST /api/student/batches/[id]/assignments/submit - Submit assignment
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
    
    if (!payload || payload.role !== 'student') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Convert batch ID to ObjectId
    let batchObjectId;
    try {
      batchObjectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    // Check enrollment
    let enrollment = await Enrollment.findOne({
      student: payload.userId,
      batch: batchObjectId
    });

    if (!enrollment) {
      enrollment = await Enrollment.findOne({
        student: payload.userId,
        batch: id
      });
    }

    if (!enrollment) {
      const invoice = await Invoice.findOne({
        studentId: payload.userId,
        batchId: id
      });

      if (!invoice || (invoice.status !== 'paid' && invoice.status !== 'partial')) {
        return NextResponse.json(
          { error: 'Access denied - not enrolled in this batch' },
          { status: 403 }
        );
      }
    }

    // Validate request body
    const body = await request.json();
    const validatedData = submitAssignmentSchema.parse(body);

    // Find assignment
    const assignment = await Assignment.findOne({
      _id: validatedData.assignmentId,
      batchId: batchObjectId,
      status: 'published'
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions?.find((sub: any) => 
      sub.student?.toString() === payload.userId ||
      (typeof sub.student === 'object' && sub.student._id?.toString() === payload.userId)
    );

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = validatedData.facebookPostLink;
      existingSubmission.submittedAt = new Date();
    } else {
      // Create new submission
      if (!assignment.submissions) {
        assignment.submissions = [];
      }
      assignment.submissions.push({
        student: payload.userId,
        content: validatedData.facebookPostLink,
        submittedAt: new Date()
      });
    }

    await assignment.save();

    return NextResponse.json({
      message: 'Assignment submitted successfully',
      submission: {
        submittedAt: existingSubmission?.submittedAt || new Date(),
        facebookPostLink: validatedData.facebookPostLink
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error submitting assignment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to submit assignment' },
      { status: 500 }
    );
  }
}

