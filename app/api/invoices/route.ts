import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyTokenEdge } from '@/lib/auth';
import Invoice from '@/models/Invoice';
import BatchSimple from '@/models/BatchSimple';
import User from '@/models/User';

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
    const status = searchParams.get('status') || '';
    const studentId = searchParams.get('studentId') || '';

    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { batchName: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (studentId) {
      query.studentId = studentId;
    }

    // Get invoices with pagination
    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'name email phone')
      .populate('batchId', 'name courseType fee');

    const total = await Invoice.countDocuments(query);

    return NextResponse.json({
      invoices,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
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
    const { studentId, batchId, promoCode } = body;

    // Get batch information
    const batch = await BatchSimple.findById(batchId);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Get student information
    const student = await User.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Calculate amounts
    const amount = batch.fee;
    let discountAmount = 0;
    let promoDiscount = 0;

    // Apply promo code if provided
    if (promoCode) {
      const PromoCode = (await import('@/models/PromoCode')).default;
      const promo = await PromoCode.findOne({ 
        code: promoCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (promo) {
        // Check if user has already used this promo code
        const userUsageCount = promo.usedBy.filter((usage: { userId: string }) => usage.userId === studentId).length;
        if (userUsageCount < promo.maxUsesPerUser && promo.usedCount < promo.maxUses) {
          if (amount >= promo.minAmount) {
            if (promo.type === 'percentage') {
              promoDiscount = (amount * promo.value) / 100;
            } else {
              promoDiscount = promo.value;
            }
            discountAmount = promoDiscount;
          }
        }
      }
    }

    const finalAmount = amount - discountAmount;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber,
      studentId,
      batchId,
      batchName: batch.name,
      courseType: batch.courseType,
      amount,
      discountAmount,
      finalAmount,
      currency: batch.currency,
      promoCode: promoCode || undefined,
      promoDiscount,
      status: 'pending',
      dueDate,
      paidAmount: 0,
      remainingAmount: finalAmount,
      payments: [],
      createdBy: authResult.userId
    });

    await invoice.save();

    return NextResponse.json({
      message: 'Invoice created successfully',
      invoice
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
