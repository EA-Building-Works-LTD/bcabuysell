import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getServerConfig, checkEnvironmentVariables } from '@/lib/server-utils';
import { isAdminInitialized, getAdminConfigStatus } from '@/lib/firebase-admin';

// A diagnostic endpoint to check the server environment and Firebase Admin SDK
export async function GET(request: NextRequest) {
  // Get headers synchronously
  const headersList = headers();
  const authHeader = headersList.get('authorization') || '';
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  
  try {
    const serverConfig = getServerConfig();
    const adminStatus = getAdminConfigStatus();
    
    // Check if Firebase Admin SDK is initialized
    const adminInitialized = isAdminInitialized();
    
    // Check if we received a token in the request
    const hasToken = !!tokenFromHeader;
    
    // Check environment variables
    const envCheck = checkEnvironmentVariables();
    
    return NextResponse.json({
      status: 'success',
      serverConfig: {
        nodeEnv: process.env.NODE_ENV,
        // Filter out sensitive info
        cookieConfig: {
          name: serverConfig.cookies.name,
          secure: serverConfig.cookies.secure,
          sameSite: serverConfig.cookies.sameSite,
          maxAge: serverConfig.cookies.maxAge,
        },
      },
      firebaseAdmin: {
        config: adminStatus,
        initialized: adminInitialized,
        missingEnvVars: envCheck.missing,
      },
      request: {
        hasAuthHeader: !!authHeader,
        hasToken,
        method: request.method,
        url: request.url,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// POST endpoint to test passing a token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json({
        status: 'error',
        message: 'No token provided in request body',
      }, { status: 400 });
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Token received',
      tokenLength: token.length,
      tokenStart: token.substring(0, 10) + '...',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Diagnostic POST error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
} 