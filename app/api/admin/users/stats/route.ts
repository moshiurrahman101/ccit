import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/admin/users/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all non-student users
    const allUsers = await User.find({ role: { $ne: 'student' } }).select('role isActive');

    // Calculate stats
    const total = allUsers.length;
    const active = allUsers.filter(user => user.isActive).length;
    const inactive = total - active;

    // Count by role
    const byRole = allUsers.reduce((acc: any, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Count active by role
    const activeByRole = allUsers
      .filter(user => user.isActive)
      .reduce((acc: any, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

    return NextResponse.json({
      total,
      active,
      inactive,
      byRole,
      activeByRole
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'ব্যবহারকারী পরিসংখ্যান লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
