import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    
    const { db } = await connectToDatabase();
    
    if (path) {
      // Get specific page by path
      const page = await db.collection('page_seo').findOne({ page: path });
      
      return NextResponse.json({
        success: true,
        page: page
      });
    } else {
      // Get all pages
      const pages = await db.collection('page_seo').find({}).sort({ page: 1 }).toArray();
      
      return NextResponse.json({
        success: true,
        pages
      });
    }
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    
    const pageData = {
      page: body.page,
      title: body.title,
      description: body.description,
      keywords: body.keywords,
      canonicalUrl: body.canonicalUrl,
      robots: body.robots,
      ogTitle: body.ogTitle,
      ogDescription: body.ogDescription,
      ogImage: body.ogImage,
      ogImageAlt: body.ogImageAlt,
      ogType: body.ogType,
      twitterTitle: body.twitterTitle,
      twitterDescription: body.twitterDescription,
      twitterImage: body.twitterImage,
      twitterCard: body.twitterCard,
      structuredData: body.structuredData,
      customHeadTags: body.customHeadTags,
      lastModified: new Date(),
      createdAt: body.createdAt || new Date()
    };
    
    const result = await db.collection('page_seo').replaceOne(
      { page: body.page },
      pageData,
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Page SEO saved successfully',
      id: result.upsertedId || body.page
    });
  } catch (error) {
    console.error('Error saving page SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save page SEO' },
      { status: 500 }
    );
  }
}