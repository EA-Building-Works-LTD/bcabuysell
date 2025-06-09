import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/auth-utils';
import { getAllCars, createCar } from '@/lib/car-service';
import connectDB from '@/lib/database';

// GET /api/cars - Get all cars with optional status filter
export async function GET(req: NextRequest) {
  console.log('API /cars: Request received');
  
  try {
    // Validate authentication
    const authResult = await validateApiAuth(req);
    
    if (!authResult.isAuthorized) {
      console.error('API /cars: Unauthorized request');
      return authResult.response;
    }
    
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    
    console.log(`API /cars: Fetching cars with status filter: ${status || 'all'}`);
    
    // Get cars data
    const cars = await getAllCars(status, authResult.userId);
    
    console.log(`API /cars: Returning ${cars.length} cars`);
    
    // Return successful response with the cars data
    return NextResponse.json({
      success: true,
      data: cars,
      count: cars.length,
      message: 'Cars fetched successfully'
    });
  } catch (error: any) {
    console.error('API /cars: Error:', error);
    
    // Handle database or server errors
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error', 
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      }, 
      { status: 500 }
    );
  }
}

// POST /api/cars - Create a new car
export async function POST(req: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateApiAuth(req);
    
    if (!authResult.isAuthorized) {
      return authResult.response;
    }
    
    // Parse request body
    const carData = await req.json();
    
    // Create car using the service
    const car = await createCar(carData, authResult.userId as string);
    
    return NextResponse.json({ 
      success: true,
      data: car,
      message: 'Car created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating car:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to create car'
    }, { status: 500 });
  }
}

// Add middleware for this route
export const dynamic = 'force-dynamic'; // Do not cache this route 