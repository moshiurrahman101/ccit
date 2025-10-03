import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb-client';

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const gtmConfig = await db.collection('analytics_config').findOne({ type: 'gtm' });
    
    return NextResponse.json({
      success: true,
      config: gtmConfig || null
    });
  } catch (error) {
    console.error('Error fetching GTM config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch GTM configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { db } = await connectToDatabase();
    
    const gtmConfig = {
      type: 'gtm',
      gtmId: body.gtmId,
      enabled: body.enabled,
      customCode: body.customCode,
      events: body.events,
      customEvents: body.customEvents,
      updatedAt: new Date()
    };
    
    await db.collection('analytics_config').replaceOne(
      { type: 'gtm' },
      gtmConfig,
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'GTM configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving GTM config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save GTM configuration' },
      { status: 500 }
    );
  }
}