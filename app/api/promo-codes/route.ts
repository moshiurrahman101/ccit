import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyTokenEdge } from '@/lib/auth';
import PromoCode from '@/models/PromoCode';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const authResult = verifyTokenEdge(token);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    // Get promo codes with pagination
    const promoCodes = await PromoCode.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PromoCode.countDocuments(query);

    return NextResponse.json({
      promoCodes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const authResult = verifyTokenEdge(token);
    if (!authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      currency,
      maxUses,
      maxUsesPerUser,
      validFrom,
      validUntil,
      applicableBatches,
      applicableCourseTypes,
      minAmount
    } = body;

    // Check if promo code already exists
    const existingCode = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return NextResponse.json({ 
        error: 'Promo code already exists' 
      }, { status: 400 });
    }

    // Validate dates
    if (new Date(validFrom) >= new Date(validUntil)) {
      return NextResponse.json({ 
        error: 'Valid from date must be before valid until date' 
      }, { status: 400 });
    }

    // Validate value
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json({ 
        error: 'Percentage value must be between 0 and 100' 
      }, { status: 400 });
    }

    if (type === 'fixed' && value < 0) {
      return NextResponse.json({ 
        error: 'Fixed value must be positive' 
      }, { status: 400 });
    }

    // Create promo code
    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      description,
      type,
      value,
      currency: currency || 'BDT',
      maxUses: maxUses || 100,
      maxUsesPerUser: maxUsesPerUser || 1,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      applicableBatches: applicableBatches || [],
      applicableCourseTypes: applicableCourseTypes || ['batch', 'course'],
      minAmount: minAmount || 0,
      createdBy: authResult.userId
    });

    await promoCode.save();

    return NextResponse.json({
      message: 'Promo code created successfully',
      promoCode
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
