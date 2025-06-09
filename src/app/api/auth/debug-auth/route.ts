import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/database';

export async function GET() {
  const debugInfo = {
    environment: {
      node_env: process.env.NODE_ENV,
      nextauth_url: process.env.NEXTAUTH_URL,
      nextauth_url_masked: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL.substring(0, 10)}...` : null,
      nextauth_secret_exists: !!process.env.NEXTAUTH_SECRET,
      google_client_id_exists: !!process.env.GOOGLE_CLIENT_ID,
      google_client_secret_exists: !!process.env.GOOGLE_CLIENT_SECRET,
      google_client_id_valid_format: process.env.GOOGLE_CLIENT_ID?.includes('.apps.googleusercontent.com'),
      mongodb_uri_exists: !!process.env.MONGODB_URI,
    },
    server: {
      timestamp: new Date().toISOString(),
      process_cwd: process.cwd(),
    },
    database: {
      connection_status: 'unknown' as 'unknown' | 'connected' | 'error',
      mongoose_state: null as number | null,
      error: null as string | null
    }
  };

  // Test MongoDB connection
  try {
    await connectDB();
    debugInfo.database.connection_status = 'connected';
    debugInfo.database.mongoose_state = mongoose.connection.readyState;
  } catch (error) {
    debugInfo.database.connection_status = 'error';
    debugInfo.database.error = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(debugInfo);
} 