import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { FIREBASE_TOKEN_COOKIE } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookies or authorization header
    let token = request.cookies.get(FIREBASE_TOKEN_COOKIE)?.value;
    
    // If no token in cookies, check the Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    if (!token) {
      return NextResponse.json({ 
        error: 'No token found in cookies or Authorization header',
        status: 'missing_token',
        helpMessage: 'Try signing in again. Your session may have expired.'
      }, { status: 400 });
    }
    
    // Check if token is in the correct format
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return NextResponse.json({ 
        error: 'Invalid token format',
        status: 'invalid_token_format',
        token: token.substring(0, 10) + '...',
        helpMessage: 'The token is not in valid JWT format. Try signing out and in again.'
      }, { status: 400 });
    }
    
    // Try to decode the token
    try {
      const decodedToken = await verifyIdToken(token);
      
      if (!decodedToken) {
        return NextResponse.json({ 
          error: 'Token verification failed',
          status: 'verification_failed',
          helpMessage: 'Your token could not be verified. Try signing in again.'
        }, { status: 401 });
      }
      
      // Return basic information from the token (without sensitive data)
      return NextResponse.json({
        status: 'success',
        message: 'Token is valid',
        user: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          tokenIssued: new Date().toISOString(),
        },
        firebaseAdmin: {
          initialized: !!decodedToken
        }
      });
    } catch (error: any) {
      return NextResponse.json({ 
        error: `Token verification error: ${error.message}`,
        status: 'verification_error',
        helpMessage: 'There was an error verifying your token. Try signing out and in again.'
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: `Server error: ${error.message}`,
      status: 'server_error',
    }, { status: 500 });
  }
} 