import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(1, 'নাম প্রয়োজন'),
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে'),
  phone: z.string().optional(),
  role: z.enum(['student', 'mentor', 'admin', 'marketing', 'support']).default('student')
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'এই ইমেইল দিয়ে ইতিমধ্যে নিবন্ধন করা হয়েছে' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      ...validatedData,
      // Set approval status to pending for students
      approvalStatus: validatedData.role === 'student' ? 'pending' : 'approved'
    });
    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Create response with cookie
    const response = NextResponse.json({
      message: 'সফলভাবে নিবন্ধন হয়েছে',
      user: user.toJSON(),
      token
    }, { status: 201 });

    // Set cookie for middleware
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('auth-token', token, {
      path: '/',
      maxAge: 86400, // 24 hours
      secure: isProduction,
      sameSite: 'lax',
      httpOnly: false // Allow client-side access
    });

    return response;

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError' && 'errors' in error) {
      return NextResponse.json(
        { message: 'ভুল তথ্য', errors: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { message: 'ভুল তথ্য', errors: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'সার্ভার ত্রুটি' },
      { status: 500 }
    );
  }
}
