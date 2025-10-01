import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import PasswordReset from '@/models/PasswordReset';
import User from '@/models/User';
import { sendOtpEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ message: 'Authentication required' }, { status: 401 });

    const payload = verifyToken(token);
    if (!payload) return NextResponse.json({ message: 'Invalid token' }, { status: 401 });

    const admin = await User.findById(payload.userId);
    if (!admin || !['admin', 'marketing'].includes(admin.role)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    // Generate a short OTP using PasswordReset flow
    const resetToken = await (PasswordReset as any).createResetToken(admin.email.toLowerCase());
    // Use first 6 chars as OTP code (still validate token fully on delete)
    const otpCode = resetToken.token.slice(0, 6).toUpperCase();

    const sent = await sendOtpEmail(admin.email, admin.name || 'Admin', otpCode, 'Payment Deletion OTP');
    if (!sent) {
      return NextResponse.json({ message: 'Failed to send OTP email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent to your email', hint: 'Check your inbox' });
  } catch (error) {
    console.error('Error sending payment deletion OTP:', error);
    return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 });
  }
}

