import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/models/Mentor';
import User from '@/models/User';
import { verifyTokenEdge } from '@/lib/auth';

// GET all mentors
export async function GET(request: NextRequest) {
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
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const expertise = searchParams.get('expertise') || '';

    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, unknown> = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { expertise: { $in: [new RegExp(search, 'i')] } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (expertise) {
      filter.expertise = { $in: [new RegExp(expertise, 'i')] };
    }

    const mentors = await Mentor.find(filter)
      .populate('userId', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Mentor.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      mentors,
      pagination: {
        currentPage: page,
        totalPages,
        totalMentors: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new mentor
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
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      avatar,
      bio,
      designation,
      experience,
      expertise = [],
      education = [],
      socialLinks = {},
      skills = [],
      languages = [],
      certifications = [],
      availability = {},
      teachingExperience = 0,
      teachingStyle,
      specializations = [],
      status = 'pending'
    } = body;

    // Validate required fields
    if (!name || !email || !experience) {
      return NextResponse.json({ 
        error: 'Name, email, and experience are required' 
      }, { status: 400 });
    }

    // Check if mentor email already exists
    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) {
      return NextResponse.json({ 
        error: 'Mentor with this email already exists' 
      }, { status: 400 });
    }

    // Check if user exists and is not already a mentor
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ 
        error: 'User with this email does not exist. Please create user first.' 
      }, { status: 400 });
    }

    if (user.role !== 'mentor') {
      return NextResponse.json({ 
        error: 'User is not assigned mentor role' 
      }, { status: 400 });
    }

    const existingMentorProfile = await Mentor.findOne({ userId: user._id });
    if (existingMentorProfile) {
      return NextResponse.json({ 
        error: 'Mentor profile already exists for this user' 
      }, { status: 400 });
    }

    // Create new mentor
    const mentor = new Mentor({
      name,
      email,
      phone,
      avatar,
      bio,
      designation,
      experience,
      expertise,
      education,
      socialLinks,
      skills,
      languages,
      certifications,
      availability: {
        timezone: 'Asia/Dhaka',
        workingHours: '9:00 AM - 6:00 PM',
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        ...availability
      },
      teachingExperience,
      teachingStyle,
      specializations,
      status,
      userId: user._id,
      createdBy: payload.userId
    });

    await mentor.save();

    // Update user role to mentor if not already
    if (user.role !== 'mentor') {
      await User.findByIdAndUpdate(user._id, { role: 'mentor' });
    }

    return NextResponse.json({
      message: 'Mentor created successfully',
      mentor
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
