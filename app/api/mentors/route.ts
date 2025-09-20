import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/models/Mentor';
import User from '@/models/User';
import { verifyTokenEdge } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET all mentors (public endpoint)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

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
      password,
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
      status = 'pending'
    } = body;

    // Validate required fields
    if (!name || !email || !password || !experience) {
      return NextResponse.json({ 
        error: 'Name, email, password, and experience are required' 
      }, { status: 400 });
    }

    // Check if mentor email already exists
    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) {
      return NextResponse.json({ 
        error: 'Mentor with this email already exists' 
      }, { status: 400 });
    }

    // Check if user exists, create if not
    let user = await User.findOne({ email });
    if (!user) {
      // Hash the provided password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Create new user with mentor role
      user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'mentor',
        isActive: true
      });
      await user.save();
      console.log('✅ New user created for mentor:', email);
    } else {
      // Check if user already has a mentor profile
      const existingMentorProfile = await Mentor.findOne({ userId: user._id });
      if (existingMentorProfile) {
        return NextResponse.json({ 
          error: 'Mentor profile already exists for this user' 
        }, { status: 400 });
      }
      
      // Update user role to mentor if not already
      if (user.role !== 'mentor') {
        await User.findByIdAndUpdate(user._id, { role: 'mentor' });
        console.log('✅ User role updated to mentor:', email);
      }
      
      // Update password if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await User.findByIdAndUpdate(user._id, { password: hashedPassword });
        console.log('✅ Password updated for user:', email);
      }
      
      console.log('✅ Using existing user account for mentor:', email);
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
      status,
      userId: user._id,
      createdBy: payload.userId
    });

    await mentor.save();

    return NextResponse.json({
      message: 'Mentor created successfully',
      mentor
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating mentor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE mentor
export async function DELETE(request: NextRequest) {
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
    const mentorId = searchParams.get('id');

    if (!mentorId) {
      return NextResponse.json({ error: 'Mentor ID is required' }, { status: 400 });
    }

    // Find the mentor
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Delete Cloudinary image if exists
    if (mentor.avatar) {
      try {
        // Extract public ID from Cloudinary URL
        const publicId = mentor.avatar.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`mentor-avatars/${publicId}`);
          console.log('✅ Cloudinary image deleted:', publicId);
        }
      } catch (cloudinaryError) {
        console.error('Error deleting Cloudinary image:', cloudinaryError);
        // Continue with mentor deletion even if image deletion fails
      }
    }

    // Delete associated user account
    if (mentor.userId) {
      await User.findByIdAndDelete(mentor.userId);
      console.log('✅ User account deleted for mentor:', mentor.email);
    }

    // Delete the mentor
    await Mentor.findByIdAndDelete(mentorId);
    console.log('✅ Mentor profile deleted:', mentor.email);

    return NextResponse.json({
      message: 'Mentor and associated user account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
