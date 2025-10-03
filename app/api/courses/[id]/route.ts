import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Course from '@/models/Course';
import Mentor from '@/models/Mentor';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';
import mongoose from 'mongoose';

const updateCourseSchema = z.object({
  title: z.string().min(1, 'Course title is required').max(100, 'Title too long').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  shortDescription: z.string().max(500, 'Short description too long').optional(),
  coverPhoto: z.string().optional(),
  courseType: z.enum(['online', 'offline', 'both']).optional(),
  regularPrice: z.number().min(0, 'Price cannot be negative').optional(),
  discountPrice: z.number().min(0, 'Discount price cannot be negative').optional(),
  mentors: z.array(z.string().min(1, 'Mentor ID is required')).optional(),
  modules: z.array(z.object({
    title: z.string().min(1, 'Module title is required'),
    description: z.string().min(1, 'Module description is required'),
    duration: z.number().min(0.5, 'Module duration must be at least 0.5 hours'),
    order: z.number().min(1, 'Order must be at least 1')
  })).optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  duration: z.number().min(1, 'Duration must be at least 1').optional(),
  durationUnit: z.enum(['days', 'weeks', 'months', 'years']).optional(),
  maxStudents: z.number().min(1, 'Max students must be at least 1').optional(),
  marketing: z.object({
    slug: z.string().min(1, 'Slug is required'),
    metaDescription: z.string().max(160, 'Meta description too long').optional(),
    tags: z.array(z.string())
  }).optional(),
  category: z.enum(['web-development', 'data-science', 'mobile-development', 'design', 'marketing', 'other']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  language: z.enum(['bengali', 'english']).optional(),
  courseCode: z.string().min(1, 'Course code is required').max(10, 'Course code too long').optional(),
  courseShortcut: z.string().min(1, 'Course shortcut is required').max(50, 'Course shortcut too long').optional(),
  status: z.enum(['draft', 'published', 'archived']).optional()
});

// GET /api/courses/[id] - Get single course
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !['admin', 'mentor', 'student'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = await Course.findById(id)
      .populate('mentors', 'name email avatar designation experience expertise');

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });

  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateCourseSchema.parse(body);

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if mentors exist (if mentors are being updated)
    if (validatedData.mentors) {
      const mentors = await Mentor.find({ _id: { $in: validatedData.mentors } });
      if (mentors.length !== validatedData.mentors.length) {
        return NextResponse.json(
          { error: 'One or more mentors not found' },
          { status: 404 }
        );
      }
    }

    // Check for conflicts if updating unique fields
    if (validatedData.title && validatedData.title !== course.title) {
      const existingCourse = await Course.findOne({ title: validatedData.title });
      if (existingCourse) {
        return NextResponse.json(
          { error: 'Course with this title already exists' },
          { status: 409 }
        );
      }
    }

    if (validatedData.courseCode && validatedData.courseCode !== course.courseCode) {
      const existingCode = await Course.findOne({ courseCode: validatedData.courseCode });
      if (existingCode) {
        return NextResponse.json(
          { error: 'Course with this code already exists' },
          { status: 409 }
        );
      }
    }

    if (validatedData.marketing?.slug && validatedData.marketing.slug !== course.marketing.slug) {
      const existingSlug = await Course.findOne({ 'marketing.slug': validatedData.marketing.slug });
      if (existingSlug) {
        return NextResponse.json(
          { error: 'Course with this slug already exists' },
          { status: 409 }
        );
      }
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    ).populate('mentors', 'name email avatar designation experience expertise');

    return NextResponse.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });

  } catch (error) {
    console.error('Error updating course:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid course ID' },
        { status: 400 }
      );
    }

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if course has active batches
    const Batch = mongoose.model('Batch');
    const activeBatches = await Batch.countDocuments({ 
      courseId: id, 
      status: { $in: ['published', 'upcoming', 'ongoing'] } 
    });

    if (activeBatches > 0) {
      return NextResponse.json(
        { error: 'Cannot delete course with active batches' },
        { status: 400 }
      );
    }

    await Course.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
