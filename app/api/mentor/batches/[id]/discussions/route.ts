import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const createDiscussionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  isPinned: z.boolean().default(false)
});

// GET /api/mentor/batches/[id]/discussions - Get discussions for a batch
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

    // For now, return mock data - replace with actual discussion system
    const mockDiscussions = [
      {
        _id: '1',
        title: 'Project Ideas Discussion',
        content: 'Let\'s discuss some interesting project ideas for our final project. I\'d love to hear your thoughts on what kind of application you\'d like to build.',
        author: {
          _id: payload.userId,
          name: mentor?.name || 'Mentor',
          avatar: null,
          role: 'mentor'
        },
        replies: 8,
        isPinned: true,
        createdAt: '2024-02-10T00:00:00.000Z',
        updatedAt: '2024-02-10T00:00:00.000Z'
      },
      {
        _id: '2',
        title: 'React Hooks Question',
        content: 'I\'m having trouble understanding the useEffect hook. Can someone explain when to use the dependency array?',
        author: {
          _id: 'student1',
          name: 'রাহুল আহমেদ',
          avatar: null,
          role: 'student'
        },
        replies: 5,
        isPinned: false,
        createdAt: '2024-02-11T00:00:00.000Z',
        updatedAt: '2024-02-11T00:00:00.000Z'
      },
      {
        _id: '3',
        title: 'Assignment Submission Guidelines',
        content: 'Please make sure to submit your assignments on time and follow the naming convention: FirstName_LastName_AssignmentName.zip',
        author: {
          _id: payload.userId,
          name: mentor?.name || 'Mentor',
          avatar: null,
          role: 'mentor'
        },
        replies: 3,
        isPinned: true,
        createdAt: '2024-02-12T00:00:00.000Z',
        updatedAt: '2024-02-12T00:00:00.000Z'
      },
      {
        _id: '4',
        title: 'Study Group Meeting',
        content: 'Anyone interested in forming a study group for the upcoming quiz? We can meet online and discuss the topics together.',
        author: {
          _id: 'student2',
          name: 'সুমাইয়া খান',
          avatar: null,
          role: 'student'
        },
        replies: 12,
        isPinned: false,
        createdAt: '2024-02-13T00:00:00.000Z',
        updatedAt: '2024-02-13T00:00:00.000Z'
      }
    ];

    return NextResponse.json({
      discussions: mockDiscussions,
      total: mockDiscussions.length,
      batch: {
        _id: batch._id,
        name: batch.name
      }
    });

  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}

// POST /api/mentor/batches/[id]/discussions - Create new discussion
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

    // Get user information
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
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

    const body = await request.json();
    const validatedData = createDiscussionSchema.parse(body);

    // Create discussion (mock implementation)
    const newDiscussion = {
      _id: Date.now().toString(),
      ...validatedData,
      author: {
        _id: user._id,
        name: user.name,
        avatar: null,
        role: user.role
      },
      replies: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      message: 'Discussion created successfully',
      discussion: newDiscussion
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating discussion:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    );
  }
}
