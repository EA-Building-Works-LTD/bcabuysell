import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Car from '@/models/Car';

// EMERGENCY ROUTE - TEMPORARY ACCESS WITHOUT AUTH FOR DEBUGGING
// THIS IS A TEMPORARY SOLUTION AND SHOULD BE REMOVED AFTER FIXING THE AUTHENTICATION ISSUES
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    console.log('EMERGENCY API: Fetching cars with status:', status || 'all');
    
    // Build query based on filters
    const query: any = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Get cars matching the query
    const cars = await Car.find(query).sort({ createdAt: -1 });
    console.log(`EMERGENCY API: Found ${cars.length} cars matching query`);
    
    // Add CORS headers to allow access from any origin (for debugging)
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return NextResponse.json({ 
      data: cars,
      message: 'Emergency access mode - authentication bypassed',
      timestamp: new Date().toISOString() 
    }, { 
      headers 
    });
  } catch (error: any) {
    console.error('Error in emergency cars route:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch cars',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
} 