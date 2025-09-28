import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('সঠিক ইমেইল দিন'),
  password: z.string().min(1, 'পাসওয়ার্ড প্রয়োজন')
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      return NextResponse.json(
        { message: 'ভুল ইমেইল বা পাসওয়ার্ড' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'আপনার অ্যাকাউন্ট নিষ্ক্রিয়' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'ভুল ইমেইল বা পাসওয়ার্ড' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Create response with cookie
    const response = NextResponse.json({
      message: 'সফলভাবে লগইন হয়েছে',
      user: user.toJSON(),
      token
    });

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
