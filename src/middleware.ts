import { NextRequest, NextResponse } from 'next/server';
import { FIREBASE_TOKEN_COOKIE } from '@/lib/utils';

// Array of public routes that don't require authentication
const publicRoutes = [
  '/auth/signin', 
  '/auth/error', 
  '/api/auth/debug-token',
  '/api/auth/verify-token',
  '/api/auth/verify-credentials',
  '/api/auth/check-api-config',
  '/api/cars/emergency',
  '/api/auth/token-fix',
  '/firebase-debug',
  '/firebase-check'
];

// Array of emergency API routes that should always work even with auth issues
const emergencyRoutes = [
  '/api/cars/emergency',
  '/api/auth/token-fix',
  '/api/diagnose',
  '/api/auth/debug-token',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public routes, static assets, and emergency endpoints
  if (
    publicRoutes.some(route => pathname === route || pathname.startsWith(route)) ||
    pathname.startsWith('/_next') || 
    pathname.includes('.') ||
    emergencyRoutes.some(route => pathname === route || pathname.startsWith(route))
  ) {
    console.log('Middleware: skipping for route', pathname);
    return NextResponse.next();
  }
  
  // Handle API routes (except emergency ones)
  if (pathname.startsWith('/api/')) {
    // For API routes, we'll still let them through but we'll check
    // for the token so that the API route itself can handle auth
    console.log('Middleware: API route, passing through', pathname);
    return NextResponse.next();
  }
  
  // Check for Firebase ID token in the cookies
  const token = request.cookies.get(FIREBASE_TOKEN_COOKIE)?.value;
  
  // If no token is found, redirect to sign-in page
  if (!token) {
    console.log('No auth token found, redirecting to sign-in page');
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