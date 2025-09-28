import { NextRequest, NextResponse } from 'next/server';
import Newsletter from '@/models/Newsletter';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'ইমেইল প্রয়োজন' },
        { status: 400 }
      );
    }

    // Find and deactivate subscription
    const subscriber = await Newsletter.findOne({ 
      email: email.toLowerCase() 
    });

    if (!subscriber) {
      return NextResponse.json(
        { error: 'এই ইমেইলটি আমাদের তালিকায় নেই' },
        { status: 404 }
      );
    }

    if (!subscriber.isActive) {
      return NextResponse.json(
        { error: 'এই ইমেইলটি ইতিমধ্যে আনসাবস্ক্রাইব করা আছে' },
        { status: 409 }
      );
    }

    subscriber.isActive = false;
    await subscriber.save();

    return NextResponse.json({
      message: 'সফলভাবে আনসাবস্ক্রাইব করা হয়েছে',
      email: subscriber.email
    });

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}
