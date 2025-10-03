import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import Mentor from '@/models/Mentor';

// GET /api/batches/slug/[slug] - Get batch by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;
    
    console.log('Fetching batch with slug:', slug);

    const batch = await Batch.findOne({ 
      'marketing.slug': slug,
      isActive: true,
      status: { $in: ['published', 'upcoming', 'ongoing'] }
    }).populate('courseId');

    console.log('Batch found:', batch ? 'Yes' : 'No');
    if (batch) {
      console.log('Batch name:', batch.name);
      console.log('Batch status:', batch.status);
      console.log('Course populated:', batch.courseId ? 'Yes' : 'No');
    }

    if (!batch) {
      return NextResponse.json(
        { error: 'Batch not found' },
        { status: 404 }
      );
    }

    // Manually populate mentor data
    let mentor = null;
    if (batch.mentorId) {
      mentor = await Mentor.findById(batch.mentorId).select('name email avatar designation experience expertise bio skills socialLinks rating studentsCount coursesCount');
    }

    // Merge batch and course data
    const course = batch.courseId;

    // Populate all course mentors
    let courseMentors = [];
    if (course?.mentors && course.mentors.length > 0) {
      courseMentors = await Mentor.find({ _id: { $in: course.mentors } })
        .select('name email avatar designation experience expertise bio skills socialLinks rating studentsCount coursesCount');
    }
    const batchWithData = {
      ...batch.toObject(),
      mentorId: mentor,
      // Add course fields to batch for the frontend
      shortDescription: course?.shortDescription || batch.description || '',
      modules: course?.modules || [],
      whatYouWillLearn: course?.whatYouWillLearn || [],
      requirements: course?.requirements || [],
      features: course?.features || [],
      duration: course?.duration || batch.duration || 0,
      durationUnit: course?.durationUnit || batch.durationUnit || 'weeks',
      coverPhoto: course?.coverPhoto || batch.coverPhoto,
      // Use batch pricing if available, otherwise use course pricing
      regularPrice: batch.regularPrice || course?.regularPrice || 0,
      discountPrice: batch.discountPrice || course?.discountPrice,
      discountPercentage: batch.discountPercentage || course?.discountPercentage || 0,
      // Add all course mentors
      courseMentors: courseMentors
    };

    return NextResponse.json({ batch: batchWithData });

  } catch (error) {
    console.error('Error fetching batch by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch batch', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
