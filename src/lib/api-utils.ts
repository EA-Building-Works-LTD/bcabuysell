import { NextRequest, NextResponse } from 'next/server';
import connectDB from './database';
import User from '@/models/User';
import { FIREBASE_TOKEN_COOKIE } from './utils';

/**
 * Get the authenticated user from the request
 * This is a simplified implementation that needs Firebase Admin SDK in production
 */
export async function getAuthUser(request: NextRequest) {
  try {
    // Get the token from cookies or Authorization header
    let token = request.cookies.get(FIREBASE_TOKEN_COOKIE)?.value;
    
    // If no token in cookies, check the Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      console.log('No token found in cookies or Authorization header');
      return null;
    }
    
    // Connect to the database
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      
      // For development only: create a mock admin user if DB connection fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: Using mock admin user');
        return {
          _id: 'mock-user-id',
          uid: 'mock-firebase-uid',
          email: 'mock@example.com',
          displayName: 'Mock User',
          role: 'admin'
        };
      }
      throw dbError;
    }
    
    // In a real implementation, you would verify the token with Firebase Admin SDK
    // For now, we'll use a simplified approach for testing
    
    // TEMPORARY SOLUTION - THIS WOULD BE REPLACED BY FIREBASE ADMIN SDK VERIFICATION
    // In a real implementation, you would decode and verify the token with Firebase Admin SDK
    let uid = '';
    
    try {
      // This is a very simplified token parsing approach - DO NOT USE IN PRODUCTION
      // This assumes the token has a simple structure for testing only
      if (token.includes('.')) {
        // Simple attempt to extract payload from JWT-like token
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload));
        uid = payload.user_id || payload.uid || payload.sub;
      } else {
        // Fallback for testing - use the token directly as UID
        // For testing only - remove in production
        uid = token;
      }
    } catch (e) {
      console.error('Error parsing token:', e);
      // For testing, if token parsing fails, use it directly (ONLY FOR DEVELOPMENT)
      uid = token;
    }
    
    if (!uid) {
      console.log('No UID extracted from token');
      return null;
    }
    
    console.log('Looking up user with UID:', uid);
    
    // Temporary for testing: Create a test user if it doesn't exist
    let user = await User.findOne({ uid });
    
    if (!user && process.env.NODE_ENV === 'development') {
      console.log('Creating test user for development');
      // Create a test user for development only
      try {
        user = await User.create({
          uid,
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'admin', // Give admin role for testing
        });
      } catch (createError) {
        console.error('Error creating test user:', createError);
        // If creation fails but we're in development, still return a mock user
        return {
          _id: 'mock-user-id',
          uid: uid,
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'admin'
        };
      }
    }
    
    if (!user) {
      console.log('User not found in database');
      return null;
    }
    
    return {
      _id: user._id,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    
    // For development only - return a mock admin user when errors occur
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Returning mock admin user after error');
      return {
        _id: 'mock-user-id-error',
        uid: 'mock-firebase-uid-error',
        email: 'mock-error@example.com',
        displayName: 'Mock Error User',
        role: 'admin'
      };
    }
    
    return null;
  }
}

/**
 * Helper to protect API routes with Firebase authentication
 */
export function withAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    return handler(request, user);
  };
}

/**
 * Helper to protect API routes with admin-only access
 */
export function withAdminAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await getAuthUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    
    return handler(request, user);
  };
} 