import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const seoConfig = await db.collection('analytics_config').findOne({ type: 'seo' });
    
    return NextResponse.json({
      success: true,
      config: seoConfig || null
    });
  } catch (error) {
    console.error('Error fetching SEO config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SEO configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    
    const seoConfig = {
      type: 'seo',
      title: body.title,
      description: body.description,
      keywords: body.keywords,
      ogTitle: body.ogTitle,
      ogDescription: body.ogDescription,
      ogImage: body.ogImage,
      ogImageAlt: body.ogImageAlt,
      twitterTitle: body.twitterTitle,
      twitterDescription: body.twitterDescription,
      twitterImage: body.twitterImage,
      canonicalUrl: body.canonicalUrl,
      robots: body.robots,
      structuredData: body.structuredData,
      updatedAt: new Date()
    };
    
    await db.collection('analytics_config').replaceOne(
      { type: 'seo' },
      seoConfig,
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'SEO configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving SEO config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save SEO configuration' },
      { status: 500 }
    );
  }
}