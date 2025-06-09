import { NextRequest, NextResponse } from 'next/server';
import connectDB from './database';
import User from '@/models/User';
import { FIREBASE_TOKEN_COOKIE } from './utils';
import { verifyIdToken } from './firebase-admin';

/**
 * Get the authenticated user from the request
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

    // Log token for debugging in development only
    if (process.env.NODE_ENV === 'development') {
      console.log('Token found:', token.substring(0, 20) + '...');
    }

    // Verify the token with Firebase Admin SDK
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      console.log('Invalid token (verification failed)');
      return null;
    }
    
    const uid = decodedToken.uid;
    
    if (!uid) {
      console.log('No UID in decoded token');
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
          uid: uid,
          email: decodedToken.email || 'mock@example.com',
          displayName: decodedToken.name || 'Mock User',
          role: 'admin'
        };
      }
      throw dbError;
    }
    
    console.log('Looking up user with UID:', uid);
    
    // Find user in the database
    let user = await User.findOne({ uid });
    
    // Create user if it doesn't exist (first login after registration)
    if (!user) {
      console.log('User not found in database, creating new user record');
      try {
        user = await User.create({
          uid,
          email: decodedToken.email,
          displayName: decodedToken.name || decodedToken.email?.split('@')[0],
          photoURL: decodedToken.picture,
          // For first user or development, set as admin
          role: (process.env.NODE_ENV === 'development' || 
                (await User.countDocuments()) === 0) ? 'admin' : 'user',
        });
        console.log('Created new user in database:', user._id);
      } catch (createError) {
        console.error('Error creating user in database:', createError);
        
        // In development, return mock user
        if (process.env.NODE_ENV === 'development') {
        return {
          _id: 'mock-user-id',
            uid,
            email: decodedToken.email || 'mock@example.com',
            displayName: decodedToken.name || 'Mock User',
          role: 'admin'
        };
        }
        
        throw createError;
      }
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
    
    // Log request details for debugging
    console.error('Request details:', {
      url: request.url,
      method: request.method,
      hasCookies: !!request.cookies.get(FIREBASE_TOKEN_COOKIE),
      hasAuthHeader: !!request.headers.get('Authorization')
    });
    
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
    try {
    const user = await getAuthUser(request);
    
    if (!user) {
        console.log('Auth middleware: Unauthorized request');
        // Add response headers for debugging
        const headers = new Headers();
        headers.set('X-Auth-Error', 'No authenticated user found');
        headers.set('X-Auth-Debug', 'Token verification failed or not provided');
        
        return NextResponse.json({ 
          error: 'Unauthorized',
          message: 'Authentication required. Please sign in.'
        }, { 
          status: 401,
          headers
        });
    }
    
    return handler(request, user);
    } catch (error) {
      console.error('Error in auth middleware:', error);
      
      return NextResponse.json({ 
        error: 'Authentication error',
        message: 'An error occurred during authentication. Please try again.'
      }, { 
        status: 500 
      });
    }
  };
}

/**
 * Helper to protect API routes with admin-only access
 */
export function withAdminAuth(handler: (req: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    try {
    const user = await getAuthUser(request);
    
    if (!user) {
        console.log('Admin middleware: Unauthorized request');
        return NextResponse.json({ 
          error: 'Unauthorized',
          message: 'Authentication required. Please sign in.'
        }, { 
          status: 401 
        });
    }
    
    if (user.role !== 'admin') {
        console.log('Admin middleware: Forbidden - user is not admin', user.email, user.role);
        return NextResponse.json({ 
          error: 'Admin access required',
          message: 'You do not have permission to access this resource.'
        }, { 
          status: 403 
        });
    }
    
    return handler(request, user);
    } catch (error) {
      console.error('Error in admin auth middleware:', error);
      
      return NextResponse.json({ 
        error: 'Authentication error',
        message: 'An error occurred during authentication. Please try again.'
      }, { 
        status: 500 
      });
    }
  };
}

// Check if the current route is an emergency route that bypasses auth
export function isEmergencyRoute(pathname: string): boolean {
  const emergencyRoutes = [
    '/api/cars/emergency',
    '/api/auth/token-fix',
    '/api/diagnose',
    '/api/auth/debug-token',
  ];
  
  return emergencyRoutes.some(route => pathname === route || pathname.startsWith(route));
} 