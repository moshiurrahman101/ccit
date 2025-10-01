import { NextRequest, NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Create a test reset URL
    const testResetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=test-token-123`;
    
    // Send test email
    const emailSent = await sendPasswordResetEmail(email, name, testResetUrl);
    
    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        email: email
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test email. Check your email configuration.',
        email: email
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Check console for details'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Check email configuration
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_APP_PASSWORD;

  const isConfigured = !!(emailUser && emailPassword);

  return NextResponse.json({
    emailConfigured: isConfigured,
    configuration: {
      host: 'smtp.gmail.com',
      port: '587',
      user: emailUser || 'Not set',
      pass: emailPassword ? '***configured***' : 'Not set'
    },
    instructions: isConfigured 
      ? 'Email is configured. Use POST /api/test-email with { "email": "your-email@example.com", "name": "Your Name" } to test.'
      : 'Email not configured. Please set EMAIL_USER and EMAIL_APP_PASSWORD in your .env.local file. See EMAIL_SETUP_GUIDE.md for instructions.'
  });
}
