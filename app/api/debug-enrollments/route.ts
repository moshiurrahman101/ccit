import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Batch from '@/models/Batch';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all enrollments with populated data
    const enrollments = await Enrollment.find()
      .populate('student', 'name email phone')
      .populate('course', 'name')
      .populate('batch', 'name courseType')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Get enrollment statistics
    const stats = await Enrollment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get batch-wise enrollment counts
    const batchStats = await Enrollment.aggregate([
      {
        $match: { batch: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$batch',
          count: { $sum: 1 },
          approvedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: 'batches',
          localField: '_id',
          foreignField: '_id',
          as: 'batch'
        }
      },
      {
        $unwind: '$batch'
      },
      {
        $project: {
          batchName: '$batch.name',
          batchType: '$batch.courseType',
          totalEnrollments: '$count',
          approvedEnrollments: '$approvedCount',
          completedEnrollments: '$completedCount'
        }
      }
    ]);

    return NextResponse.json({
      message: 'Enrollment debug information',
      totalEnrollments: enrollments.length,
      enrollments: enrollments,
      statusStats: stats,
      batchStats: batchStats
    });

  } catch (error) {
    console.error('Error fetching enrollment debug info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollment debug info' },
      { status: 500 }
    );
  }
}
