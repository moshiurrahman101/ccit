import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    console.log('Simple test email endpoint called');
    
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_APP_PASSWORD;

    console.log('Email config check:', { 
      user: emailUser ? 'set' : 'not set', 
      pass: emailPassword ? 'set' : 'not set' 
    });

    if (!emailUser || !emailPassword) {
      return NextResponse.json({
        success: false,
        error: 'Email configuration missing'
      }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });

    console.log('Transporter created');

    const info = await transporter.sendMail({
      from: emailUser,
      to: 'creativecanvasit@gmail.com',
      subject: 'Test Email',
      text: 'This is a simple test email.',
      html: '<p>This is a <strong>simple</strong> test email.</p>',
    });

    console.log('Email sent:', info.messageId);

    return NextResponse.json({
      success: true,
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Simple test email error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
