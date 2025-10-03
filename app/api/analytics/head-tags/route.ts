import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const headTagsConfig = await db.collection('analytics_config').findOne({ type: 'head_tags' });
    
    return NextResponse.json({
      success: true,
      config: headTagsConfig || null
    });
  } catch (error) {
    console.error('Error fetching head tags config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch head tags configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    
    const headTagsConfig = {
      type: 'head_tags',
      defaultTitle: body.defaultTitle,
      defaultDescription: body.defaultDescription,
      defaultKeywords: body.defaultKeywords,
      defaultOgImage: body.defaultOgImage,
      defaultCanonicalUrl: body.defaultCanonicalUrl,
      customHeadTags: body.customHeadTags,
      updatedAt: new Date()
    };
    
    await db.collection('analytics_config').replaceOne(
      { type: 'head_tags' },
      headTagsConfig,
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Head tags configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving head tags config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save head tags configuration' },
      { status: 500 }
    );
  }
}
