import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset, { IPasswordResetModel } from '@/models/PasswordReset';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'টোকেন প্রয়োজন'),
  password: z.string().min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে')
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Verify and use the reset token
    const resetToken = await (PasswordReset as IPasswordResetModel).verifyAndUseToken(validatedData.token);
    
    if (!resetToken) {
      return NextResponse.json(
        { message: 'অবৈধ বা মেয়াদোত্তীর্ণ টোকেন' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: resetToken.email });
    
    if (!user) {
      return NextResponse.json(
        { message: 'ব্যবহারকারী পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'আপনার অ্যাকাউন্ট নিষ্ক্রিয়' },
        { status: 403 }
      );
    }

    // Update password
    user.password = validatedData.password; // Let the model hash it
    await user.save();

    // Delete all reset tokens for this user
    await PasswordReset.deleteMany({ email: resetToken.email });

    return NextResponse.json({
      message: 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে'
    });

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { message: 'ভুল তথ্য', errors: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    console.error('Error in reset password:', error);
    return NextResponse.json(
      { message: 'সার্ভার ত্রুটি' },
      { status: 500 }
    );
  }
}

// GET endpoint to verify token validity
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'টোকেন প্রয়োজন' },
        { status: 400 }
      );
    }

    // Check if token is valid (not used and not expired)
    const resetToken = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: 'অবৈধ বা মেয়াদোত্তীর্ণ টোকেন' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'টোকেন বৈধ',
      email: resetToken.email
    });

  } catch (error) {
    console.error('Error verifying reset token:', error);
    return NextResponse.json(
      { message: 'সার্ভার ত্রুটি' },
      { status: 500 }
    );
  }
}
