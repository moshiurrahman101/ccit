import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const createCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required').max(20, 'Code too long'),
  description: z.string().max(200, 'Description too long').optional(),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0, 'Value cannot be negative'),
  minAmount: z.number().min(0, 'Minimum amount cannot be negative').optional(),
  maxDiscount: z.number().min(0, 'Maximum discount cannot be negative').optional(),
  validFrom: z.string().transform(str => new Date(str)),
  validUntil: z.string().transform(str => new Date(str)),
  usageLimit: z.number().min(1, 'Usage limit must be at least 1').optional(),
  applicableBatches: z.array(z.string()).optional(),
  applicableCourses: z.array(z.string()).optional()
});

// GET /api/coupons - Get all coupons
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const query: any = {};
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const coupons = await Coupon.find(query)
      .populate('applicableBatches', 'name batchCode')
      .populate('applicableCourses', 'title courseCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCoupons = await Coupon.countDocuments(query);
    const totalPages = Math.ceil(totalCoupons / limit);

    return NextResponse.json({
      coupons,
      pagination: {
        currentPage: page,
        totalPages,
        totalCoupons,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

// POST /api/coupons - Create new coupon
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCouponSchema.parse(body);

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ 
      code: validatedData.code.toUpperCase() 
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Coupon code already exists' },
        { status: 400 }
      );
    }

    // Create coupon
    const coupon = new Coupon({
      ...validatedData,
      code: validatedData.code.toUpperCase(),
      createdBy: payload.userId
    });

    await coupon.save();

    return NextResponse.json({
      message: 'Coupon created successfully',
      coupon
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating coupon:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
