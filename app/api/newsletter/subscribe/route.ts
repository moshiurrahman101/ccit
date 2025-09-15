import { NextRequest, NextResponse } from 'next/server';
import Newsletter from '@/models/Newsletter';
import connectDB from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, name, source = 'homepage' } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'ইমেইল প্রয়োজন' },
        { status: 400 }
      );
    }

    // Email validation regex
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'সঠিক ইমেইল ঠিকানা দিন' },
        { status: 400 }
      );
    }

    // Get client info
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { error: 'আপনি ইতিমধ্যে আমাদের নিউজলেটারের সাবস্ক্রাইবার' },
          { status: 409 }
        );
      } else {
        // Reactivate the subscription
        existingSubscriber.isActive = true;
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.source = source;
        if (name) existingSubscriber.name = name;
        existingSubscriber.ipAddress = ipAddress;
        existingSubscriber.userAgent = userAgent;
        await existingSubscriber.save();

        return NextResponse.json({
          message: 'নিউজলেটার সাবস্ক্রিপশন সফলভাবে সক্রিয় করা হয়েছে',
          subscriber: {
            email: existingSubscriber.email,
            name: existingSubscriber.name,
            subscribedAt: existingSubscriber.subscribedAt
          }
        });
      }
    }

    // Create new subscription
    const newsletter = new Newsletter({
      email: email.toLowerCase(),
      name: name?.trim(),
      source,
      ipAddress,
      userAgent
    });

    await newsletter.save();

    return NextResponse.json({
      message: 'নিউজলেটার সাবস্ক্রিপশন সফলভাবে সম্পন্ন হয়েছে',
      subscriber: {
        email: newsletter.email,
        name: newsletter.name,
        subscribedAt: newsletter.subscribedAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'active';

    // Build query
    const query: Record<string, unknown> = {};
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Newsletter.countDocuments(query);

    // Get subscribers with pagination
    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-userAgent -ipAddress');

    return NextResponse.json({
      subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get newsletter subscribers error:', error);
    return NextResponse.json(
      { error: 'সার্ভার ত্রুটি।' },
      { status: 500 }
    );
  }
}
