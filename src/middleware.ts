import { NextRequest, NextResponse } from 'next/server';
import { FIREBASE_TOKEN_COOKIE } from '@/lib/utils';

// Array of public routes that don't require authentication
const publicRoutes = [
  '/auth/signin', 
  '/auth/error', 
  '/firebase-debug',
  '/firebase-check',
  '/api/auth/verify-token' // We'll create this API route for token verification
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes, static assets, and API routes
  // API routes handle their own authentication
  if (
    publicRoutes.some(route => pathname === route || pathname.startsWith(route)) ||
    pathname.startsWith('/_next') || 
    pathname.includes('.') || 
    pathname.startsWith('/api/')
  ) {
    return NextResponse.next();
  }
  
  // Check for Firebase ID token in the cookies
  const token = request.cookies.get(FIREBASE_TOKEN_COOKIE)?.value;
  
  // If no token is found, redirect to sign-in page
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(signInUrl);
  }
  
  // Token exists, but we're not verifying it here for performance reasons
  // The actual verification will happen in the API routes when needed
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all request paths except for the ones we explicitly exclude
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
}; 