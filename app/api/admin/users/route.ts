import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/admin/users - Get all users except students
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build filter query
    const filter: any = {
      role: { $ne: 'student' } // Exclude students
    };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (status) {
      if (status === 'active') {
        filter.isActive = true;
      } else if (status === 'inactive') {
        filter.isActive = false;
      }
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'ব্যবহারকারী তালিকা লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password, role, phone, isActive = true } = await request.json();

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'নাম, ইমেইল, পাসওয়ার্ড এবং ভূমিকা প্রয়োজন' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' },
        { status: 409 }
      );
    }

    // Validate role (exclude students)
    const allowedRoles = ['admin', 'mentor', 'marketing', 'support'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'অবৈধ ব্যবহারকারীর ভূমিকা' },
        { status: 400 }
      );
    }

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      isActive
    });

    await user.save();

    return NextResponse.json({
      message: 'ব্যবহারকারী সফলভাবে তৈরি হয়েছে',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'ব্যবহারকারী তৈরি করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
