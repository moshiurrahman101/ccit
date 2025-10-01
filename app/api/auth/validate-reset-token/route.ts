import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PasswordReset from '@/models/PasswordReset';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    // Check if token exists and is valid
    const resetToken = await PasswordReset.findOne({ token });

    if (!resetToken) {
      return NextResponse.json({
        valid: false,
        message: 'Invalid reset token'
      });
    }

    // Check if token is expired (1 hour = 3600000 milliseconds)
    const now = new Date();
    const tokenAge = now.getTime() - resetToken.createdAt.getTime();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    if (tokenAge > oneHour) {
      // Delete expired token
      await PasswordReset.deleteOne({ token });
      return NextResponse.json({
        valid: false,
        message: 'Reset token has expired'
      });
    }

    return NextResponse.json({
      valid: true,
      message: 'Token is valid'
    });

  } catch (error) {
    console.error('Error validating reset token:', error);
    return NextResponse.json(
      { valid: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
