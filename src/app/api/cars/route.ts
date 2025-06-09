import { NextRequest, NextResponse } from 'next/server';
import { getAllCars, createCar } from '@/lib/car-service';
import connectDB from '@/lib/database';

// Default user ID for all operations since we've removed authentication
const DEFAULT_USER_ID = 'default-user';

// GET /api/cars - Get all cars with optional status filter
export async function GET(req: NextRequest) {
  console.log('API /cars: Request received');
  
  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    
    console.log(`API /cars: Fetching cars with status filter: ${status || 'all'}`);
    
    // Get all cars without user filtering
    const cars = await getAllCars(status);
    
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
    // Parse request body
    const carData = await req.json();
    
    // Create car using the default user
    const car = await createCar(carData, DEFAULT_USER_ID);
    
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