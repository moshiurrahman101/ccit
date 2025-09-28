import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'ইমেইল এবং পাসওয়ার্ড প্রয়োজন' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      role: 'admin'
    });

    console.log('Looking for user with email:', email.toLowerCase());
    console.log('Found user:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User email:', user.email);
      console.log('User role:', user.role);
      console.log('User isActive:', user.isActive);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'অ্যাডমিন অ্যাকাউন্ট পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে' },
        { status: 403 }
      );
    }

    // Verify password
    console.log('Comparing password:', password, 'with hash:', user.password.substring(0, 20) + '...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'ভুল পাসওয়ার্ড' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    return NextResponse.json({
      message: 'সফলভাবে লগইন হয়েছে',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
