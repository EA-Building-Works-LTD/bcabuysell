import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User, { IUser } from '@/models/User';
import { withAuth } from '@/lib/api-utils';

// GET /api/user - Get current user information
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Connect to database
    await connectDB();
    
    // Find the user by Firebase UID
    const dbUser = await User.findOne({ uid: user.uid })
      .select('-__v')
      .lean() as unknown as IUser & { _id: string };
    
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Return the user data
    return NextResponse.json({ 
      user: {
        id: dbUser._id.toString(),
        name: dbUser.displayName || dbUser.name || '',
        email: dbUser.email,
        image: dbUser.photoURL || dbUser.image || '',
        role: dbUser.role,
        createdAt: dbUser.createdAt,
      } 
    });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch user' }, { status: 500 });
  }
}); 