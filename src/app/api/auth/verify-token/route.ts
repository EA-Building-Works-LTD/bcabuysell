import { NextRequest, NextResponse } from 'next/server';

interface TokenError {
  message: string;
  code?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    // Get the token from the request body
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }
    
    // Verify the token with Firebase Admin SDK
    // Note: We're using Firebase client SDK which doesn't have built-in token verification
    // In a production app, you would use Firebase Admin SDK here
    
    // For now, we'll just verify that the token is present
    // and let Firebase handle authentication on the client side
    
    return NextResponse.json({ 
      valid: true,
      message: 'Token is present. Full verification requires Firebase Admin SDK.' 
    });
    
  } catch (error: unknown) {
    console.error('Error verifying token:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Token verification failed', message: errorMessage },
      { status: 403 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method to verify tokens' },
    { status: 405 }
  );
} 