import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import PasswordReset from '@/models/PasswordReset';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    console.log('Reset password request body:', body);
    
    const validatedData = resetPasswordSchema.parse(body);
    console.log('Validated data:', validatedData);

    const { token, password } = validatedData;

    // Check if token exists and is valid
    const resetToken = await PasswordReset.findOne({ token });
    console.log('Found reset token:', resetToken ? 'Yes' : 'No');

    if (!resetToken) {
      return NextResponse.json(
        { message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired (1 hour = 3600000 milliseconds)
    const now = new Date();
    const tokenAge = now.getTime() - resetToken.createdAt.getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    console.log('Token age:', tokenAge, 'ms');
    console.log('Token expired:', tokenAge > oneHour);

    if (tokenAge > oneHour) {
      // Delete expired token
      await PasswordReset.deleteOne({ token });
      return NextResponse.json(
        { message: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await User.findOne({ email: resetToken.email });
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Update user password (will be hashed by User model's pre('save') hook)
    console.log('Updating user password...');
    await User.findByIdAndUpdate(user._id, {
      password, // Raw password - will be hashed automatically
      updatedAt: new Date()
    });

    // Delete the used reset token
    console.log('Deleting used reset token...');
    await PasswordReset.deleteOne({ token });

    console.log('Password reset completed successfully');
    return NextResponse.json({
      message: 'Password reset successfully'
    });

  } catch (error: unknown) {
    console.error('Error in reset password API:', error);
    
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError' && 'errors' in error) {
      return NextResponse.json(
        { message: 'Validation failed', errors: (error as { errors: unknown }).errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}