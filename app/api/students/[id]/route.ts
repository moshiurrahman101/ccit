import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Batch from '@/models/Batch';
import { verifyTokenEdge } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET single student with full profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyTokenEdge(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin, mentor, or the student themselves
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || (!['admin', 'mentor'].includes(currentUser.role) && currentUser._id.toString() !== id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const student = await User.findById(id)
      .populate('studentInfo.batchInfo.batchId', 'name description startDate endDate maxStudents currentStudents')
      .select('-password');

    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'শিক্ষার্থী পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ student });

  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'শিক্ষার্থীর তথ্য আনতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// PUT update student profile
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyTokenEdge(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin, mentor, or the student themselves
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || (!['admin', 'mentor'].includes(currentUser.role) && currentUser._id.toString() !== id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      // Basic Info
      name,
      email,
      phone,
      password,
      
      // Student Info
      dateOfBirth,
      gender,
      nid,
      bloodGroup,
      
      // Address
      address,
      
      // Emergency Contact
      emergencyContact,
      
      // Education
      education,
      
      // Social Info
      socialInfo,
      
      // Payment Info
      paymentInfo,
      
      // Batch Info
      batchId,
      
      // Additional Info
      isOfflineStudent,
      notes,
      isVerified
    } = body;

    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'শিক্ষার্থী পাওয়া যায়নি' }, { status: 404 });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== student.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' },
          { status: 409 }
        );
      }
    }

    // Update basic info
    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isOfflineStudent !== undefined) updateData['studentInfo.isOfflineStudent'] = isOfflineStudent;
    if (notes !== undefined) updateData['studentInfo.notes'] = notes;
    if (isVerified !== undefined) updateData['studentInfo.isVerified'] = isVerified;

    // Update password if provided (will be hashed by User model's pre('save') hook)
    if (password) {
      updateData.password = password; // Raw password - will be hashed automatically
    }

    // Update student info
    if (dateOfBirth !== undefined) updateData['studentInfo.dateOfBirth'] = dateOfBirth ? new Date(dateOfBirth) : null;
    if (gender !== undefined) updateData['studentInfo.gender'] = gender;
    if (nid !== undefined) updateData['studentInfo.nid'] = nid;
    if (bloodGroup !== undefined) updateData['studentInfo.bloodGroup'] = bloodGroup;

    // Update nested objects
    if (address) {
      Object.keys(address).forEach(key => {
        updateData[`studentInfo.address.${key}`] = address[key];
      });
    }

    if (emergencyContact) {
      Object.keys(emergencyContact).forEach(key => {
        updateData[`studentInfo.emergencyContact.${key}`] = emergencyContact[key];
      });
    }

    if (education) {
      Object.keys(education).forEach(key => {
        updateData[`studentInfo.education.${key}`] = education[key];
      });
    }

    if (socialInfo) {
      Object.keys(socialInfo).forEach(key => {
        updateData[`studentInfo.socialInfo.${key}`] = socialInfo[key];
      });
    }

    if (paymentInfo) {
      Object.keys(paymentInfo).forEach(key => {
        updateData[`studentInfo.paymentInfo.${key}`] = paymentInfo[key];
      });
    }

    // Handle batch change
    if (batchId && batchId !== student.studentInfo?.batchInfo?.batchId?.toString()) {
      const newBatch = await Batch.findById(batchId);
      if (!newBatch) {
        return NextResponse.json({ error: 'ব্যাচ পাওয়া যায়নি' }, { status: 404 });
      }

      if (newBatch.currentStudents >= newBatch.maxStudents) {
        return NextResponse.json({ error: 'ব্যাচ পূর্ণ' }, { status: 400 });
      }

      // Update old batch count
      if (student.studentInfo?.batchInfo?.batchId) {
        await Batch.findByIdAndUpdate(student.studentInfo.batchInfo.batchId, {
          $inc: { currentStudents: -1 }
        });
      }

      // Update new batch count
      await Batch.findByIdAndUpdate(batchId, {
        $inc: { currentStudents: 1 }
      });

      updateData['studentInfo.batchInfo.batchId'] = batchId;
      updateData['studentInfo.batchInfo.batchName'] = newBatch.name;
    }

    const updatedStudent = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('studentInfo.batchInfo.batchId', 'name description startDate endDate').select('-password');

    return NextResponse.json({
      message: 'শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'শিক্ষার্থীর তথ্য আপডেট করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const payload = verifyTokenEdge(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const student = await User.findById(id);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ error: 'শিক্ষার্থী পাওয়া যায়নি' }, { status: 404 });
    }

    // Update batch student count
    if (student.studentInfo?.batchInfo?.batchId) {
      await Batch.findByIdAndUpdate(student.studentInfo.batchInfo.batchId, {
        $inc: { currentStudents: -1 }
      });
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'শিক্ষার্থী সফলভাবে মুছে ফেলা হয়েছে'
    });

  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'শিক্ষার্থী মুছতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
