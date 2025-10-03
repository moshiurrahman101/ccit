import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, transformations } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Default transformations for OG images
    const defaultTransformations = {
      og: 'w_1200,h_630,c_fill,f_auto,q_auto',
      thumbnail: 'w_300,h_300,c_fill,f_auto,q_auto',
      medium: 'w_600,h_600,c_fill,f_auto,q_auto',
      small: 'w_150,h_150,c_fill,f_auto,q_auto'
    };

    // Use provided transformations or defaults
    const transforms = transformations || defaultTransformations;

    // Generate optimized URLs
    const optimizedUrls: Record<string, string> = {};
    
    for (const [key, transform] of Object.entries(transforms)) {
      if (typeof transform === 'string') {
        // Insert transformation into the Cloudinary URL
        const optimizedUrl = imageUrl.replace('/upload/', `/upload/${transform}/`);
        optimizedUrls[key] = optimizedUrl;
      }
    }

    return NextResponse.json({
      success: true,
      originalUrl: imageUrl,
      optimizedUrls: optimizedUrls
    });

  } catch (error) {
    console.error('Optimization error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to optimize image' },
      { status: 500 }
    );
  }
}
