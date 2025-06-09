import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { FIREBASE_TOKEN_COOKIE } from './utils';
import connectDB from './database';
import User from '@/models/User';

/**
 * Simplified Firebase token verification for server components
 * In a production environment, you would use Firebase Admin SDK here
 */
export async function getServerUser(request: NextRequest | null = null) {
  try {
    // Get the token from the request cookies if available
    let token = request ? request.cookies.get(FIREBASE_TOKEN_COOKIE)?.value : null;
    
    // If no token in request, try to get from cookie store
    if (!token) {
      // Cookies() returns a ReadonlyRequestCookies object, not a Promise
      const cookieStore = cookies();
      token = cookieStore.get(FIREBASE_TOKEN_COOKIE)?.value;
    }

    if (!token) {
      return null;
    }

    // Connect to the database
    await connectDB();
    
    // In a real implementation, you would verify the token with Firebase Admin SDK here
    // For now, we'll assume the token is valid if it exists and try to get the user from the database
    
    // Extract UID from token (this is a simplified mock implementation)
    // In a real implementation, you would decode and verify the token
    const uid = extractUidFromToken(token);
    
    if (!uid) {
      return null;
    }
    
    // Get user from database
    const user = await User.findOne({ uid });
    
    if (!user) {
      return null;
    }
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      photoURL: user.photoURL,
      createdAt: user.createdAt
    };
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    return null;
  }
}

/**
 * Mock function to extract UID from token
 * In a real implementation, you would use Firebase Admin SDK to verify and decode the token
 */
function extractUidFromToken(token: string): string | null {
  try {
    // This is a simplified mock implementation
    // In a real implementation, you would verify the token with Firebase Admin SDK
    // For testing purposes, we'll assume the token contains the UID
    
    // For testing: return a hardcoded UID if the token is not empty
    return token ? 'firebase-uid-for-testing' : null;
  } catch (error) {
    console.error('Error extracting UID from token:', error);
    return null;
  }
} 