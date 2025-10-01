import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  maxPoints: z.number().min(1, 'Max points must be at least 1').default(100),
  attachments: z.array(z.string()).default([]),
  instructions: z.string().optional()
});

// GET /api/mentor/batches/[id]/assignments - Get assignments for a batch
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

    // For now, return mock data - replace with actual assignment system
    const mockAssignments = [
      {
        _id: '1',
        title: 'React Component Assignment',
        description: 'Create a todo list component with add, edit, delete functionality',
        dueDate: '2024-02-20T23:59:00.000Z',
        maxPoints: 100,
        attachments: ['assignment-guidelines.pdf'],
        instructions: 'Submit your code as a GitHub repository link. Include a README with setup instructions.',
        status: 'published',
        submissions: 15,
        createdAt: '2024-02-10T00:00:00.000Z',
        updatedAt: '2024-02-10T00:00:00.000Z'
      },
      {
        _id: '2',
        title: 'State Management Quiz',
        description: 'Test your understanding of React state management concepts',
        dueDate: '2024-02-18T23:59:00.000Z',
        maxPoints: 50,
        attachments: ['quiz-questions.pdf'],
        instructions: 'Complete the quiz within 30 minutes. No external resources allowed.',
        status: 'published',
        submissions: 12,
        createdAt: '2024-02-12T00:00:00.000Z',
        updatedAt: '2024-02-12T00:00:00.000Z'
      },
      {
        _id: '3',
        title: 'Project Proposal',
        description: 'Submit your final project proposal',
        dueDate: '2024-02-25T23:59:00.000Z',
        maxPoints: 75,
        attachments: ['project-template.docx'],
        instructions: 'Use the provided template and include all required sections.',
        status: 'draft',
        submissions: 0,
        createdAt: '2024-02-14T00:00:00.000Z',
        updatedAt: '2024-02-14T00:00:00.000Z'
      }
    ];

    return NextResponse.json({
      assignments: mockAssignments,
      total: mockAssignments.length,
      batch: {
        _id: batch._id,
        name: batch.name,
        currentStudents: batch.currentStudents
      }
    });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/mentor/batches/[id]/assignments - Create new assignment
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
    const validatedData = createAssignmentSchema.parse(body);

    // Validate due date
    const dueDate = new Date(validatedData.dueDate);
    const now = new Date();
    
    if (dueDate <= now) {
      return NextResponse.json(
        { error: 'Due date must be in the future' },
        { status: 400 }
      );
    }

    // Create assignment (mock implementation)
    const newAssignment = {
      _id: Date.now().toString(),
      ...validatedData,
      status: 'draft',
      submissions: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment: newAssignment
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating assignment:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}
