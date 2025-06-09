import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, verifyIdToken } from '@/lib/firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';
import { FIREBASE_TOKEN_COOKIE } from './utils';
import { isEmergencyRoute } from './api-utils';

// Cache for token verifications
const tokenCache = new Map<string, { token: DecodedIdToken, expiry: number }>();

/**
 * Extract and verify the Firebase JWT token from an API request
 * 
 * @param req NextRequest object
 * @returns User ID if token is valid, null otherwise
 */
export async function verifyTokenFromRequest(req: NextRequest | Request): Promise<DecodedIdToken | null> {
  // Allow emergency routes to bypass auth
  const url = new URL(req.url);
  if (isEmergencyRoute(url.pathname)) {
    console.log('Emergency route detected, bypassing auth check:', url.pathname);
    return { uid: 'emergency-user' } as unknown as DecodedIdToken;
  }
  
  try {
    // Extract token from Authorization header or cookie
    let token: string | undefined;
    
    // Try to get token from Authorization header
    if (req.headers.get('Authorization')?.startsWith('Bearer ')) {
      token = req.headers.get('Authorization')?.substring(7);
    }
    
    // If not in header, try to get from cookie
    if (!token && req instanceof NextRequest) {
      token = req.cookies.get(FIREBASE_TOKEN_COOKIE)?.value;
    }
    
    if (!token) {
      console.warn('No token found in request');
      return null;
    }
    
    // Check cache first to avoid excessive Firebase Auth calls
    const cached = tokenCache.get(token);
    if (cached && cached.expiry > Date.now()) {
      return cached.token;
    }
    
    // Verify token with Firebase Admin SDK
    try {
      let decodedToken;
      
      if (adminAuth) {
        decodedToken = await adminAuth.verifyIdToken(token);
      } else {
        // Fallback to our custom verifyIdToken function
        decodedToken = await verifyIdToken(token);
      }
      
      if (!decodedToken) {
        return null;
      }
      
      // Cache the token with expiry (5 minutes before actual expiry to be safe)
      if (decodedToken && (decodedToken as any).exp) {
        const expiryMs = (decodedToken as any).exp * 1000 - (5 * 60 * 1000);
        tokenCache.set(token, { token: decodedToken as DecodedIdToken, expiry: expiryMs });
      }
      
      return decodedToken as DecodedIdToken;
    } catch (firebaseError: any) {
      // Log specific Firebase error
      if (firebaseError.code === 'auth/id-token-expired') {
        console.error('Firebase token expired:', firebaseError.message);
        // Remove from cache if expired
        tokenCache.delete(token);
      } else if (firebaseError.code === 'auth/argument-error') {
        console.error('Invalid token format:', firebaseError.message);
      } else {
        console.error('Firebase token verification error:', firebaseError);
      }
      
      return null;
    }
  } catch (error) {
    console.error('Unexpected error in token verification:', error);
    return null;
  }
}

// Function to check token and return appropriate response for API routes
export async function validateApiAuth(req: NextRequest): Promise<{ 
  isAuthorized: boolean; 
  userId?: string;
  response?: NextResponse;
}> {
  // Skip auth for emergency routes
  const url = new URL(req.url);
  if (isEmergencyRoute(url.pathname)) {
    return { isAuthorized: true, userId: 'emergency-user' };
  }
  
  const decodedToken = await verifyTokenFromRequest(req);
  
  if (!decodedToken) {
    return { 
      isAuthorized: false,
      response: NextResponse.json(
        { error: 'Unauthorized: Invalid or missing token' }, 
        { status: 401 }
      )
    };
  }
  
  return { isAuthorized: true, userId: decodedToken.uid };
} 