import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST INVOICES ROUTE CALLED ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    
    return NextResponse.json({ 
      success: true,
      message: 'Invoices route is working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test invoices route error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
