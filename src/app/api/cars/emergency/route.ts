import { NextRequest, NextResponse } from 'next/server';
import { getAllCars } from '@/lib/car-service';

/**
 * Emergency endpoint for getting cars data
 * This endpoint bypasses authentication for debugging
 * and as a fallback mechanism
 */
export async function GET(req: NextRequest) {
  console.log('EMERGENCY API: Fetching cars without authentication');
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    
    // Get cars data - without providing userId to see all cars
    const cars = await getAllCars(status);
    
    console.log(`EMERGENCY API: Returning ${cars.length} cars`);
    
    // Return successful response with the cars data
    return NextResponse.json({
      success: true,
      data: cars,
      count: cars.length,
      emergency: true,
      message: 'Emergency mode: Authentication bypassed'
    });
  } catch (error: any) {
    console.error('EMERGENCY API Error:', error);
    
    // Handle database or server errors
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        emergency: true
      }, 
      { status: 500 }
    );
  }
}

// Add middleware for this route
export const dynamic = 'force-dynamic'; // Do not cache this route 