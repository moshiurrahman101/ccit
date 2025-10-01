import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/models/Mentor';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('=== MENTOR PROFILE CHECK API CALLED ===');
    
    await connectDB();

    // Verify authentication
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid auth header');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    console.log('Token extracted:', token.substring(0, 20) + '...');
    
    const payload = verifyToken(token);
    console.log('Token payload:', payload);
    
    if (!payload || !['admin', 'mentor'].includes(payload.role)) {
      console.log('Insufficient permissions. Role:', payload?.role);
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get user information
    const user = await User.findById(payload.userId);
    if (!user) {
      console.log('User not found:', payload.userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('User found:', user.email, 'Role:', user.role);

    // Check if mentor profile exists
    console.log('Looking for mentor with userId:', payload.userId);
    const mentor = await Mentor.findOne({ userId: payload.userId });
    console.log('Found mentor:', mentor ? 'Yes' : 'No');
    
    if (!mentor) {
      console.log('Mentor profile not found for user:', payload.userId);
      
      // If user is mentor but no mentor profile exists, create one
      if (user.role === 'mentor') {
        console.log('Creating mentor profile for user...');
        
        const newMentor = new Mentor({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          bio: 'Mentor profile created automatically',
          designation: 'Mentor',
          experience: 1, // Default experience
          expertise: ['General Programming'],
          education: [],
          skills: ['Teaching'],
          languages: ['English', 'Bengali'],
          certifications: [],
          socialLinks: {},
          teachingExperience: 1,
          status: 'active',
          isActive: true,
          isVerified: false,
          userId: user._id,
          createdBy: user._id
        });

        await newMentor.save();
        console.log('✅ Mentor profile created successfully');
        
        return NextResponse.json({
          message: 'Mentor profile created successfully',
          mentor: newMentor,
          created: true
        });
      } else {
        return NextResponse.json(
          { error: 'Mentor profile not found and user is not a mentor' },
          { status: 404 }
        );
      }
    }

    console.log('✅ Mentor profile found');
    return NextResponse.json({
      message: 'Mentor profile exists',
      mentor: mentor,
      created: false
    });

  } catch (error) {
    console.error('Error checking mentor profile:', error);
    return NextResponse.json(
      { error: 'Failed to check mentor profile' },
      { status: 500 }
    );
  }
}
