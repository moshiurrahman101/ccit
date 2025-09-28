import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset, { IPasswordResetModel } from '@/models/PasswordReset';
import { sendPasswordResetEmail } from '@/lib/email-service';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('সঠিক ইমেইল দিন')
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);

    // Find user by email
    const user = await User.findOne({ email: validatedData.email });
    
    // Always return success message for security (don't reveal if email exists)
    const response = {
      message: 'যদি এই ইমেইল দিয়ে অ্যাকাউন্ট থাকে, তাহলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে'
    };

    if (!user) {
      return NextResponse.json(response);
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json({
        message: 'আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে'
      }, { status: 403 });
    }

    try {
      // Create password reset token
      const resetToken = await (PasswordReset as IPasswordResetModel).createResetToken(validatedData.email);
      
      // Send email with reset link
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken.token}`;
      
      const emailSent = await sendPasswordResetEmail(user.email, user.name, resetUrl);
      
      if (!emailSent) {
        console.error('Failed to send password reset email to:', validatedData.email);
        // Still return success for security
      } else {
        console.log('Password reset email sent to:', validatedData.email);
      }
      
      return NextResponse.json(response);
      
    } catch (error) {
      console.error('Error creating password reset token:', error);
      return NextResponse.json(response); // Still return success for security
    }

  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { message: 'ভুল তথ্য', errors: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { message: 'সার্ভার ত্রুটি' },
      { status: 500 }
    );
  }
}
