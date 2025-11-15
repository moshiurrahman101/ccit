import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Enrollment } from '@/models/Enrollment';
import Invoice from '@/models/Invoice';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/student/batches/[id]/discussions - Get discussions for a batch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload || payload.role !== 'student') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Convert batch ID to ObjectId for proper matching
    let batchObjectId;
    try {
      batchObjectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid batch ID' },
        { status: 400 }
      );
    }

    // Check if student is enrolled in this batch - try both string and ObjectId
    let enrollment = await Enrollment.findOne({
      student: payload.userId,
      batch: batchObjectId
    });

    // If not found, try with string ID
    if (!enrollment) {
      enrollment = await Enrollment.findOne({
        student: payload.userId,
        batch: id
      });
    }

    // If still not found, check invoices (enrollment might not exist yet)
    if (!enrollment) {
      const invoice = await Invoice.findOne({
        studentId: payload.userId,
        batchId: id
      });

      if (invoice && (invoice.status === 'paid' || invoice.status === 'partial')) {
        // Create a mock enrollment object from invoice for access check
        enrollment = {
          _id: new mongoose.Types.ObjectId(),
          student: payload.userId,
          batch: batchObjectId,
          status: 'approved',
          paymentStatus: invoice.status === 'paid' ? 'paid' : 'partial',
          amount: invoice.finalAmount || 0,
          progress: 0,
          enrollmentDate: invoice.createdAt || new Date(),
          createdAt: invoice.createdAt || new Date(),
          updatedAt: invoice.updatedAt || new Date()
        } as any;
      }
    }

    console.log('=== STUDENT DISCUSSIONS ACCESS CHECK ===');
    console.log('Student ID:', payload.userId);
    console.log('Batch ID:', id);
    console.log('Batch ObjectId:', batchObjectId.toString());
    console.log('Enrollment found:', !!enrollment);
    if (enrollment) {
      console.log('Enrollment status:', enrollment.status);
      console.log('Enrollment payment status:', enrollment.paymentStatus);
    }

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Access denied - not enrolled in this batch' },
        { status: 403 }
      );
    }

    // Check if enrollment is approved and payment is verified
    // Students can access batch features after payment (full or partial) is verified by admin
    if (enrollment.paymentStatus !== 'paid' && enrollment.paymentStatus !== 'partial') {
      return NextResponse.json(
        { 
          error: 'Access denied - payment verification pending. Please wait for admin approval.',
          enrollmentStatus: enrollment.status,
          paymentStatus: enrollment.paymentStatus
        },
        { status: 403 }
      );
    }

    // TODO: Implement actual discussion system
    // For now, return empty discussions array
    return NextResponse.json({
      discussions: [],
      total: 0,
      message: 'Discussion system will be available soon'
    });

  } catch (error) {
    console.error('Error fetching discussions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch discussions' },
      { status: 500 }
    );
  }
}
