import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    
    // Get all SEO images from the database
    const images = await db.collection('seo_images').find({}).toArray();
    
    return NextResponse.json({
      success: true,
      images: images
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, filename, publicId, format, size, isCloudinary } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    const imageData = {
      url,
      filename: filename || 'image',
      publicId: publicId || null,
      format: format || 'jpg',
      size: size || 0,
      isCloudinary: isCloudinary || false,
      uploadedAt: new Date(),
      lastUsed: null,
      usageCount: 0
    };

    const result = await db.collection('seo_images').insertOne(imageData);
    
    return NextResponse.json({
      success: true,
      image: { ...imageData, id: result.insertedId }
    });
  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save image' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    
    await db.collection('seo_images').deleteOne({ _id: new ObjectId(imageId) });
    
    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
