import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are set
  const envStatus = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    MONGODB_URI: !!process.env.MONGODB_URI,
    
    // Show the first 10 characters of each (for security)
    NEXTAUTH_URL_preview: process.env.NEXTAUTH_URL?.substring(0, 10) + '...',
    GOOGLE_CLIENT_ID_preview: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
    MONGODB_URI_preview: process.env.MONGODB_URI?.substring(0, 10) + '...',
  };

  // Return the status
  return NextResponse.json({
    message: 'Environment variables status',
    timestamp: new Date().toISOString(),
    envStatus,
  });
} 