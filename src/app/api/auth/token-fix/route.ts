import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@/lib/firebase-admin';
import { isAdminInitialized, getAdminConfigStatus } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    
    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'No token provided',
      }, { status: 401 });
    }
    
    // Check if Firebase Admin is initialized
    const adminInitialized = isAdminInitialized();
    const adminStatus = getAdminConfigStatus();
    
    // If Admin SDK is not initialized, return detailed error
    if (!adminInitialized) {
      return NextResponse.json({
        status: 'error',
        message: 'Firebase Admin SDK not initialized',
        adminStatus,
        user: null,
        firebaseAdmin: {
          initialized: false
        }
      }, { status: 500 });
    }
    
    // Verify the token
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid token',
        user: null,
        firebaseAdmin: {
          initialized: true
        }
      }, { status: 401 });
    }
    
    // Token is valid
    return NextResponse.json({
      status: 'success',
      message: 'Token is valid',
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        tokenIssued: new Date().toISOString()
      },
      firebaseAdmin: {
        initialized: true
      }
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'An error occurred during token verification',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 