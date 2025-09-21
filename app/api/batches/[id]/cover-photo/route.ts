import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication (admin only)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { coverPhoto } = await request.json();

    if (!coverPhoto || typeof coverPhoto !== 'string') {
      return NextResponse.json({ error: 'Cover photo URL is required' }, { status: 400 });
    }

    await connectDB();

    const { id } = await params;
    
    const batch = await Batch.findByIdAndUpdate(
      id,
      { coverPhoto },
      { new: true }
    );

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Cover photo updated successfully',
      batch 
    });
  } catch (error) {
    console.error('Error updating cover photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
