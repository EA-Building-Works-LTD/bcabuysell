import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import User from '@/models/User';
import { withAdminAuth } from '@/lib/api-utils';

// Define a better type for admin user
interface AdminUser {
  _id: { toString: () => string };
  role: string;
  email: string;
  name?: string;
  displayName?: string;
}

// Define a type for API errors
interface ApiErrorResponse {
  message: string;
  error?: string;
}

// GET /api/admin/users - Get all users (admin only)
export const GET = withAdminAuth(async (request: NextRequest, user: any) => {
  try {
    // Connect to the database
    await connectDB();
    
    // Get all users
    const users = await User.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch users'
    }, { status: 500 });
  }
});

// PATCH /api/admin/users - Update a user's role (admin only)
export const PATCH = withAdminAuth(async (request: NextRequest, adminUser: AdminUser) => {
  try {
    // Connect to database
    await connectDB();
    
    // Parse the request body
    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }
    
    // Validate role
    if (role !== 'admin' && role !== 'user') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // Don't allow admin to remove their own admin rights
    if (adminUser._id.toString() === userId && role !== 'admin') {
      return NextResponse.json({ error: 'Cannot remove your own admin rights' }, { status: 400 });
    }
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name || updatedUser.displayName,
        email: updatedUser.email,
        role: updatedUser.role,
      }
    });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
});

// DELETE /api/admin/users - Delete a user (admin only)
export const DELETE = withAdminAuth(async (request: NextRequest, adminUser: AdminUser) => {
  try {
    // Connect to database
    await connectDB();
    
    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    // Don't allow admin to delete themselves
    if (adminUser._id.toString() === userId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }
    
    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Clean up associated cars
    // This would be a good place to also delete or reassign cars owned by this user
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}); 