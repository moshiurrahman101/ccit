import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Schedule from '@/models/Schedule';
import Batch from '@/models/Batch';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all schedules with batch information
    const schedules = await Schedule.find()
      .populate('batchId', 'name courseType')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Get schedule count by batch
    const scheduleStats = await Schedule.aggregate([
      {
        $group: {
          _id: '$batchId',
          count: { $sum: 1 },
          latestSchedule: { $max: '$createdAt' }
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
          scheduleCount: '$count',
          latestSchedule: 1
        }
      }
    ]);

    return NextResponse.json({
      message: 'Schedule debug information',
      totalSchedules: schedules.length,
      schedules: schedules,
      stats: scheduleStats
    });

  } catch (error) {
    console.error('Error fetching schedule debug info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule debug info' },
      { status: 500 }
    );
  }
}
