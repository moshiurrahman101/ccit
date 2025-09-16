import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// PUT /api/admin/users/[id]/password - Update user password
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'অবৈধ ব্যবহারকারী ID' },
        { status: 400 }
      );
    }

    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' },
        { status: 400 }
      );
    }

    const user = await User.findById(params.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'ব্যবহারকারী পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    // Don't allow access to students
    if (user.role === 'student') {
      return NextResponse.json(
        { error: 'অনুমতি নেই' },
        { status: 403 }
      );
    }

    // Update password
    user.password = password;
    await user.save();

    return NextResponse.json({
      message: 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে'
    });

  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
