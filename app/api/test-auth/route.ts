import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/models/Invoice';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TEST AUTH API CALLED ===');
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false,
        error: 'No token provided',
        step: 'auth_header_check'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('Token extracted:', token.substring(0, 20) + '...');
    
    const payload = verifyToken(token);
    console.log('Token payload:', payload);

    if (!payload) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid token',
        step: 'token_verification'
      }, { status: 401 });
    }

    // Test database connection
    try {
      await connectDB();
      console.log('Database connected successfully');
      
      // Test finding invoices
      const invoiceCount = await Invoice.countDocuments({ studentId: payload.userId });
      console.log('Invoice count for student:', invoiceCount);
      
      return NextResponse.json({
        success: true,
        message: 'Authentication and database test successful',
        data: {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
          invoiceCount: invoiceCount
        }
      });
      
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        step: 'database_connection',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error',
      step: 'general_error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
