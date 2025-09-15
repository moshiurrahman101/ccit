import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'সব ফিল্ড প্রয়োজন' },
        { status: 400 }
      );
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'অ্যাডমিন অ্যাকাউন্ট ইতিমধ্যে তৈরি করা হয়েছে' },
        { status: 409 }
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

    console.log('Creating admin user with:', {
      name,
      email: email.toLowerCase(),
      role: 'admin',
      isActive: true
    });

    // Create admin user (password will be hashed by the pre-save hook)
    const admin = new User({
      name,
      email: email.toLowerCase(),
      password: password, // Let the model hash it
      role: 'admin',
      isActive: true
    });

    await admin.save();
    console.log('Admin user created successfully:', {
      id: admin._id,
      email: admin.email,
      role: admin.role
    });

    return NextResponse.json({
      message: 'অ্যাডমিন অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে',
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { error: 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
