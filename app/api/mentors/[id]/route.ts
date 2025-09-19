import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/models/Mentor';
import User from '@/models/User';
import { verifyTokenEdge } from '@/lib/auth';
import { deleteImage, getPublicIdFromUrl } from '@/lib/cloudinary-server';

// GET single mentor
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
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const mentor = await Mentor.findById(id)
      .populate('userId', 'name email role')
      .populate('createdBy', 'name email');

    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    return NextResponse.json({ mentor });
  } catch (error) {
    console.error('Error fetching mentor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update mentor
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
    
    // Check if user is admin
    const currentUser = await User.findById(payload.userId);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      avatar,
      bio,
      designation,
      experience,
      expertise,
      education,
      socialLinks,
      skills,
      languages,
      certifications,
      availability,
      teachingExperience,
      teachingStyle,
      specializations,
      status,
      isVerified
    } = body;

    // Check if mentor exists
    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Check if email is being changed and if it conflicts
    if (email && email !== mentor.email) {
      const existingMentor = await Mentor.findOne({ email, _id: { $ne: id } });
      if (existingMentor) {
        return NextResponse.json({ 
          error: 'Mentor with this email already exists' 
        }, { status: 400 });
      }
    }

    // Update mentor
    const updatedMentor = await Mentor.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        avatar,
        bio,
        designation,
        experience,
        expertise,
        education,
        socialLinks,
        skills,
        languages,
        certifications,
        availability,
        teachingExperience,
        teachingStyle,
        specializations,
        status,
        isVerified
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email role')
     .populate('createdBy', 'name email');

    return NextResponse.json({
      message: 'Mentor updated successfully',
      mentor: updatedMentor
    });
  } catch (error) {
    console.error('Error updating mentor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE mentor
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

    const mentor = await Mentor.findById(id);
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 });
    }

    // Check if mentor is assigned to any courses
    // You can add this check later when course-mentor relationship is established

    // Collect all image URLs to delete from Cloudinary
    const imagesToDelete: string[] = [];
    
    // Add avatar if exists
    if (mentor.avatar) {
      imagesToDelete.push(mentor.avatar);
    }

    // Add any other image URLs from the mentor data
    // You can add more image fields here if they exist in the future

    // Delete images from Cloudinary
    if (imagesToDelete.length > 0) {
      console.log('Deleting images from Cloudinary:', imagesToDelete);
      
      for (const imageUrl of imagesToDelete) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          const deleted = await deleteImage(publicId);
          if (deleted) {
            console.log(`Successfully deleted image: ${imageUrl}`);
          } else {
            console.warn(`Failed to delete image: ${imageUrl}`);
            // Continue with deletion even if image deletion fails
          }
        }
      }
    }

    // Delete mentor from database
    await Mentor.findByIdAndDelete(id);

    // Optionally, you might want to delete the associated user as well
    // Uncomment the following lines if you want to delete the user account too
    // if (mentor.userId) {
    //   await User.findByIdAndDelete(mentor.userId);
    // }

    return NextResponse.json({
      message: 'Mentor deleted successfully',
      deletedImages: imagesToDelete.length
    });
  } catch (error) {
    console.error('Error deleting mentor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
