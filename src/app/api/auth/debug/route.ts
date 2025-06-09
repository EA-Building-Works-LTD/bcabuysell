import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/api-utils';
import { FIREBASE_TOKEN_COOKIE } from '@/lib/utils';

/**
 * Debug endpoint to check authentication status
 * This is for development purposes only
 */
export async function GET(request: NextRequest) {
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

    // Get the user from the token
    const user = await getAuthUser(request);

    return NextResponse.json({
      authenticated: !!user,
      user: user || null,
      token: token ? `${token.substring(0, 10)}...` : null,
      cookies: Object.fromEntries(request.cookies.getAll().map(c => [c.name, c.value])),
      headers: Object.fromEntries(
        Array.from(request.headers.entries())
          .filter(([key]) => !key.includes('cookie'))
      )
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Authentication error';
    const errorStack = error instanceof Error && process.env.NODE_ENV === 'development' 
      ? error.stack 
      : undefined;
    
    return NextResponse.json({
      error: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
} 