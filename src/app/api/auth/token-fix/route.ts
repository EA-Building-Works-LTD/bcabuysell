import { NextRequest, NextResponse } from 'next/server';
import { FIREBASE_TOKEN_COOKIE } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    // Log all request headers
    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    
    // Get token from request
    let token = request.cookies.get(FIREBASE_TOKEN_COOKIE)?.value;
    
    // If no token in cookies, check the Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    
    // Decode JWT token parts without verification (for debugging only)
    let tokenData = { header: null, payload: null, valid: false };
    
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          // Decode JWT parts (without verification)
          tokenData.header = JSON.parse(atob(parts[0]));
          tokenData.payload = JSON.parse(atob(parts[1]));
          tokenData.valid = true;
        }
      } catch (e) {
        console.error('Error decoding token:', e);
      }
    }
    
    // Check environment variables
    const envVars = {
      hasFirebaseAdminEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      // Only show the first few characters of values that exist
      firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID 
        ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.substring(0, 5)}...` 
        : 'missing',
      adminEmail: process.env.FIREBASE_CLIENT_EMAIL 
        ? `${process.env.FIREBASE_CLIENT_EMAIL.substring(0, 10)}...` 
        : 'missing'
    };
    
    // Return diagnostic information
    return NextResponse.json({
      message: 'Token diagnostic information',
      tokenExists: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
      tokenData,
      requestHeaders: headersObj,
      cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, `${c.value.substring(0, 10)}...`])),
      environmentVars: envVars,
      serverTime: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Diagnostic error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 