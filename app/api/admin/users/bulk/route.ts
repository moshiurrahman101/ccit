import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// POST /api/admin/users/bulk - Perform bulk actions on users
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userIds, action } = await request.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'ব্যবহারকারী ID প্রয়োজন' },
        { status: 400 }
      );
    }

    if (!action || !['activate', 'deactivate', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'অবৈধ কর্ম' },
        { status: 400 }
      );
    }

    // Validate all user IDs
    const validIds = userIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length !== userIds.length) {
      return NextResponse.json(
        { error: 'কিছু অবৈধ ব্যবহারকারী ID' },
        { status: 400 }
      );
    }

    // Get users to check roles
    const users = await User.find({ _id: { $in: validIds } });
    
    // Don't allow access to students
    const studentUsers = users.filter(user => user.role === 'student');
    if (studentUsers.length > 0) {
      return NextResponse.json(
        { error: 'ছাত্র ব্যবহারকারীদের উপর কর্ম করা যাবে না' },
        { status: 403 }
      );
    }

    let result;
    let message;

    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: validIds } },
          { isActive: true }
        );
        message = `${result.modifiedCount} ব্যবহারকারী সক্রিয় করা হয়েছে`;
        break;

      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: validIds } },
          { isActive: false }
        );
        message = `${result.modifiedCount} ব্যবহারকারী নিষ্ক্রিয় করা হয়েছে`;
        break;

      case 'delete':
        // Check if any of the users are admins
        const adminUsers = users.filter(user => user.role === 'admin');
        if (adminUsers.length > 0) {
          // Check if this would delete all admins
          const totalAdmins = await User.countDocuments({ role: 'admin' });
          if (totalAdmins <= adminUsers.length) {
            return NextResponse.json(
              { error: 'সব অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যাবে না' },
              { status: 400 }
            );
          }
        }

        result = await User.deleteMany({ _id: { $in: validIds } });
        message = `${result.deletedCount} ব্যবহারকারী মুছে ফেলা হয়েছে`;
        break;

      default:
        return NextResponse.json(
          { error: 'অবৈধ কর্ম' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      message,
      affectedCount: (result as { modifiedCount?: number; deletedCount?: number }).modifiedCount || 
                    (result as { modifiedCount?: number; deletedCount?: number }).deletedCount || 0
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      { error: 'বাল্ক কর্ম সম্পাদন করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
