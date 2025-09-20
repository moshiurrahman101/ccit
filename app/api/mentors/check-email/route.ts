import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Mentor from '@/models/Mentor';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();
    
    // Check both Mentor and User collections
    const [existingMentor, existingUser] = await Promise.all([
      Mentor.findOne({ email: email.toLowerCase() }),
      User.findOne({ email: email.toLowerCase() })
    ]);
    
    const exists = !!(existingMentor || existingUser);
    
    return NextResponse.json({ 
      exists,
      mentorExists: !!existingMentor,
      userExists: !!existingUser
    });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
