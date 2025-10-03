import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
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

    // Generate signature for signed upload
    const timestamp = Math.round(new Date().getTime() / 1000);
    const publicId = `seo-images/og-image-${timestamp}`;
    
    const params = {
      timestamp: timestamp.toString(),
      public_id: publicId,
      folder: 'seo-images',
      resource_type: 'image',
      allowed_formats: 'jpg,jpeg,png,gif,webp',
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

    // Create form data for signed upload
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('public_id', publicId);
    cloudinaryFormData.append('timestamp', timestamp.toString());
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('api_key', process.env.CLOUDINARY_API_KEY);
    cloudinaryFormData.append('folder', 'seo-images');
    cloudinaryFormData.append('resource_type', 'image');
    cloudinaryFormData.append('tags', 'seo,og-image');
    cloudinaryFormData.append('context', 'alt=SEO Image');

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Cloudinary upload error:', errorData);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to upload to Cloudinary';
      if (errorData.error?.message) {
        if (errorData.error.message.includes('format not allowed')) {
          errorMessage = 'Image format not supported. Please use JPG, PNG, GIF, or WebP.';
        } else if (errorData.error.message.includes('size')) {
          errorMessage = 'Image file is too large. Please use a smaller image.';
        } else if (errorData.error.message.includes('signature')) {
          errorMessage = 'Upload signature is invalid. Please try again.';
        } else {
          errorMessage = errorData.error.message;
        }
      }
      
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const data = await response.json();

    // Generate optimized URLs for different use cases
    const baseUrl = data.secure_url.replace('/upload/', '/upload/');
    const optimizedUrls = {
      original: data.secure_url,
      og: `${baseUrl}w_1200,h_630,c_fill,f_auto,q_auto/`,
      thumbnail: `${baseUrl}w_300,h_300,c_fill,f_auto,q_auto/`,
      medium: `${baseUrl}w_600,h_600,c_fill,f_auto,q_auto/`,
    };

    return NextResponse.json({
      success: true,
      data: {
        public_id: data.public_id,
        secure_url: data.secure_url,
        optimized_urls: optimizedUrls,
        width: data.width,
        height: data.height,
        format: data.format,
        bytes: data.bytes,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
