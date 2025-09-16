import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// GET /api/admin/users/[id] - Get single user
export async function GET(
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

    const user = await User.findById(params.id).select('-password');
    
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

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'ব্যবহারকারী লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user
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

    const { name, email, role, phone, isActive } = await request.json();

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

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: params.id }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' },
          { status: 409 }
        );
      }
    }

    // Validate role if being changed
    if (role) {
      const allowedRoles = ['admin', 'mentor', 'marketing', 'support'];
      if (!allowedRoles.includes(role)) {
        return NextResponse.json(
          { error: 'অবৈধ ব্যবহারকারীর ভূমিকা' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
      message: 'ব্যবহারকারী সফলভাবে আপডেট হয়েছে',
      user: updatedUser
    });

  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'ব্যবহারকারী আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
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

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'শেষ অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যাবে না' },
          { status: 400 }
        );
      }
    }

    await User.findByIdAndDelete(params.id);

    return NextResponse.json({
      message: 'ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'ব্যবহারকারী মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
