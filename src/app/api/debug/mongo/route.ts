import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import mongoose from 'mongoose';

export async function GET() {
  try {
    // Attempt to connect to the database
    await connectDB();
    
    // Check if we're connected
    const isConnected = mongoose.connection.readyState === 1;
    
    // Get details about the connection
    const connectionDetails = {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      // Don't expose full connection string for security
    };
    
    if (isConnected) {
      return NextResponse.json({
        status: 'success',
        message: 'MongoDB connection successful',
        connectionDetails
      });
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'MongoDB connection failed',
        connectionDetails
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('MongoDB connection test error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'MongoDB connection test failed',
      error: error.message
    }, { status: 500 });
  }
} 