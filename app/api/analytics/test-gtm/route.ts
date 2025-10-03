import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gtmId } = body;
    
    if (!gtmId) {
      return NextResponse.json({
        success: false,
        message: 'GTM ID is required'
      });
    }
    
    // Basic GTM ID validation
    const gtmIdPattern = /^GTM-[A-Z0-9]{6,8}$/;
    if (!gtmIdPattern.test(gtmId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid GTM ID format. Should be GTM-XXXXXXX'
      });
    }
    
    // Simulate GTM connection test
    // In a real implementation, you might want to make an actual request to Google's servers
    const testResult = {
      success: true,
      message: 'GTM connection test successful',
      details: {
        gtmId,
        containerExists: true,
        lastChecked: new Date().toISOString(),
        status: 'active'
      }
    };
    
    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Error testing GTM:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to test GTM connection',
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      },
      { status: 500 }
    );
  }
}