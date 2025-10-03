import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    // Check if Cloudinary credentials are configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Cloudinary credentials not configured' },
        { status: 500 }
      );
    }

    // Generate signature for deletion
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const params = {
      public_id: publicId,
      resource_type: 'image',
      timestamp: timestamp.toString(),
    };

    // Create signature
    const signatureString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key as keyof typeof params]}`)
      .join('&') + process.env.CLOUDINARY_API_SECRET;

    const signature = crypto
      .createHash('sha1')
      .update(signatureString)
      .digest('hex');

    // Delete from Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          public_id: publicId,
          resource_type: 'image',
          timestamp: timestamp.toString(),
          signature: signature,
          api_key: process.env.CLOUDINARY_API_KEY,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary delete error:', errorData);
      
      let errorMessage = 'Failed to delete image from Cloudinary';
      if (errorData.error?.message) {
        if (errorData.error.message.includes('not found')) {
          errorMessage = 'Image not found in Cloudinary';
        } else {
          errorMessage = errorData.error.message;
        }
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
      data: result,
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
