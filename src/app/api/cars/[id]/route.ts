import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Car from '@/models/Car';
import mongoose from 'mongoose';

// GET /api/cars/[id] - Get a single car by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    // Get the car
    const car = await Car.findById(id);
    
    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    return NextResponse.json({ data: car });
  } catch (error: any) {
    console.error('Error fetching car:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch car' }, { status: 500 });
  }
}

// PUT /api/cars/[id] - Update a car
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    // Parse request body
    const updates = await request.json();
    
    // Prevent changing the userId
    delete updates.userId;
    
    // Update the car
    const updatedCar = await Car.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    
    if (!updatedCar) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Car updated successfully', data: updatedCar });
  } catch (error: any) {
    console.error('Error updating car:', error);
    return NextResponse.json({ error: error.message || 'Failed to update car' }, { status: 500 });
  }
}

// DELETE /api/cars/[id] - Delete a car
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
    }
    
    // Connect to database
    await connectDB();
    
    // Delete the car
    const deletedCar = await Car.findByIdAndDelete(id);
    
    if (!deletedCar) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Car deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting car:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete car' }, { status: 500 });
  }
} 