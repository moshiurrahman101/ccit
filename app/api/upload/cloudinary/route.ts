import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'seo-images';
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.' 
      }, { status: 400 });
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Please upload an image smaller than 10MB.' 
      }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with transformations based on folder
    let transformation = [];
    
    if (folder === 'seo-images') {
      // For SEO images, create OG-optimized versions
      transformation = [
        { width: 1200, height: 630, crop: 'fill', quality: 'auto' },
        { format: 'auto' }
      ];
    } else if (folder === 'blog-images') {
      // For blog images, limit size
      transformation = [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        { format: 'auto' }
      ];
    } else if (folder === 'course-covers') {
      // For course covers, maintain aspect ratio
      transformation = [
        { width: 600, height: 400, crop: 'fill', quality: 'auto' },
        { format: 'auto' }
      ];
    } else {
      // Default transformation
      transformation = [
        { width: 800, height: 800, crop: 'limit', quality: 'auto' },
        { format: 'auto' }
      ];
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          transformation: transformation,
          tags: folder === 'seo-images' ? ['seo', 'og-image'] : [folder],
          context: folder === 'seo-images' ? 'alt=SEO Image' : undefined
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // Generate optimized URLs for different use cases
    const baseUrl = (result as { secure_url: string }).secure_url;
    const optimizedUrls = {
      original: baseUrl,
      og: baseUrl.replace('/upload/', '/upload/w_1200,h_630,c_fill,f_auto,q_auto/'),
      thumbnail: baseUrl.replace('/upload/', '/upload/w_300,h_300,c_fill,f_auto,q_auto/'),
      medium: baseUrl.replace('/upload/', '/upload/w_600,h_600,c_fill,f_auto,q_auto/'),
    };

    return NextResponse.json({ 
      success: true, 
      url: (result as { secure_url: string }).secure_url,
      data: {
        public_id: (result as { public_id: string }).public_id,
        secure_url: (result as { secure_url: string }).secure_url,
        optimized_urls: optimizedUrls,
        width: (result as { width: number }).width,
        height: (result as { height: number }).height,
        format: (result as { format: string }).format,
        bytes: (result as { bytes: number }).bytes,
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