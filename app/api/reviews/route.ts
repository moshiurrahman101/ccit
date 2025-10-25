import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import User from '@/models/User';
import { verifyTokenEdge } from '@/lib/auth';
import mongoose from 'mongoose';

// GET all reviews with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isApproved = searchParams.get('isApproved'); // For public view
    const isFeatured = searchParams.get('isFeatured'); // For homepage
    const isSuccessStory = searchParams.get('isSuccessStory'); // Filter success stories
    const limit = parseInt(searchParams.get('limit') || '50');

    await connectDB();

    const filter: Record<string, unknown> = {};
    
    // For public views, only show approved reviews
    if (isApproved !== null && isApproved !== undefined) {
      filter.isApproved = isApproved === 'true';
    }
    
    if (isFeatured !== null && isFeatured !== undefined) {
      filter.isFeatured = isFeatured === 'true';
    }
    
    if (isSuccessStory !== null && isSuccessStory !== undefined) {
      filter.isSuccessStory = isSuccessStory === 'true';
    }

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ reviews }, { status: 200 });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST create new review
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

    const currentUser = await User.findById(payload.userId);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      email,
      role,
      company,
      rating,
      review,
      earning,
      isSuccessStory,
      tags,
      batchId,
      beforeAfter
    } = body;

    // Validate required fields (email is optional)
    if (!name || !role || !rating || !review) {
      return NextResponse.json(
        { error: 'Missing required fields: name, role, rating, and review are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create review
    const newReview = new Review({
      studentId: payload.userId,
      batchId: batchId ? new mongoose.Types.ObjectId(batchId) : undefined,
      name: currentUser.name || name,
      email: currentUser.email || email,
      avatar: currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      role,
      company,
      rating,
      review,
      earning,
      isSuccessStory: isSuccessStory || false,
      isApproved: currentUser.role === 'admin', // Auto-approve for admins
      isFeatured: false,
      tags: tags || [],
      beforeAfter: beforeAfter || undefined,
      createdBy: payload.userId,
      approvedBy: currentUser.role === 'admin' ? payload.userId : undefined,
      approvedAt: currentUser.role === 'admin' ? new Date() : undefined
    });

    await newReview.save();

    return NextResponse.json({
      message: currentUser.role === 'admin' 
        ? 'Review created and approved successfully' 
        : 'Review submitted successfully. It will be published after admin approval.',
      review: newReview
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
