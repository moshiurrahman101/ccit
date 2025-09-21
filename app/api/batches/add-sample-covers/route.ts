import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Batch from '@/models/Batch';
import { verifyToken } from '@/lib/auth';

// Sample cover photo URLs
const sampleCoverPhotos = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=200&fit=crop'
];

export async function POST(request: NextRequest) {
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

    await connectDB();

    // Get all batches without cover photos
    const batches = await Batch.find({ 
      $or: [
        { coverPhoto: { $exists: false } },
        { coverPhoto: null },
        { coverPhoto: '' }
      ]
    });

    console.log(`Found ${batches.length} batches without cover photos`);

    // Add sample cover photos
    const updatedBatches = [];
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const randomPhoto = sampleCoverPhotos[Math.floor(Math.random() * sampleCoverPhotos.length)];
      
      batch.coverPhoto = randomPhoto;
      await batch.save();
      
      updatedBatches.push({
        id: batch._id,
        name: batch.name,
        coverPhoto: batch.coverPhoto
      });
      
      console.log(`Added cover photo to batch: ${batch.name}`);
    }

    return NextResponse.json({ 
      message: 'Successfully added sample cover photos',
      updatedCount: updatedBatches.length,
      batches: updatedBatches
    });
  } catch (error) {
    console.error('Error adding sample cover photos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
