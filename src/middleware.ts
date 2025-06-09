import { NextRequest, NextResponse } from 'next/server';

// Middleware to handle routing and protection
export async function middleware(request: NextRequest) {
  // Since we've removed authentication, all routes are now public
  // We just pass through all requests
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Match all request paths except for static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)',
  ],
}; 