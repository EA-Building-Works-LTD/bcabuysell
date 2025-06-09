import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Car from '@/models/Car';
import User from '@/models/User';
import mongoose from 'mongoose';
import { withAuth } from '@/lib/api-utils';

// GET /api/cars - Get all cars with optional status filter
export const GET = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Connect to the database
    await connectDB();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    console.log('API: Fetching cars with status:', status || 'all');
    console.log('API: User:', user._id, user.email, user.role);
    
    // Build query based on filters
    const query: any = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // If not admin, only show user's own cars
    if (user.role !== 'admin') {
      console.log('API: Restricting to user cars only');
      query.userId = user._id;
    }
    
    // Get cars matching the query
    const cars = await Car.find(query).sort({ createdAt: -1 });
    console.log(`API: Found ${cars.length} cars matching query`);
    
    return NextResponse.json({ data: cars });
  } catch (error: any) {
    console.error('Error fetching cars:', error);
    
    // Log additional context for debugging
    console.error('Request URL:', request.url);
    console.error('User context:', {
      id: user?._id,
      email: user?.email,
      role: user?.role
    });
    
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch cars',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      context: { user: user?._id, role: user?.role }
    }, { status: 500 });
  }
});

// POST /api/cars - Create a new car
export const POST = withAuth(async (request: NextRequest, user: any) => {
  try {
    // Connect to the database
    await connectDB();
    
    // Parse the request body
    const data = await request.json();
    
    console.log('API: Creating new car for user:', user._id);
    
    // Create new car with user ID
    const newCar = await Car.create({
      ...data,
      userId: new mongoose.Types.ObjectId(user._id)
    });
    
    return NextResponse.json({ message: 'Car created successfully', car: newCar }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating car:', error);
    
    // Log additional context for debugging
    console.error('Request URL:', request.url);
    console.error('User context:', {
      id: user?._id,
      email: user?.email,
      role: user?.role
    });
    
    return NextResponse.json({ 
      error: error.message || 'Failed to create car',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }, { status: 500 });
  }
}); 