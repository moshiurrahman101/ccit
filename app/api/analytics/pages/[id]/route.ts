import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase();
    const resolvedParams = await params;
    
    const result = await db.collection('page_seo').deleteOne({ page: resolvedParams.id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Page SEO deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting page SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete page SEO' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { db } = await connectToDatabase();
    const resolvedParams = await params;
    const page = await db.collection('page_seo').findOne({ page: resolvedParams.id });
    
    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      page
    });
  } catch (error) {
    console.error('Error fetching page SEO:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch page SEO' },
      { status: 500 }
    );
  }
}