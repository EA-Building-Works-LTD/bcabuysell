import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Car from '@/models/Car';
import mongoose from 'mongoose';
import User from '@/models/User';
import { getAuthUser } from '@/lib/api-utils';

// Helper function to validate MongoDB ID
function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Helper to check if user has access to the car
async function checkUserAccess(carId: string, userEmail: string) {
  await connectDB();
  
  // Get the user
  const user = await User.findOne({ email: userEmail });
  if (!user) {
    return { access: false, message: 'User not found' };
  }
  
  // If admin, grant access
  if (user.role === 'admin') {
    return { access: true, user };
  }
  
  // Get the car
  const car = await Car.findById(carId);
  if (!car) {
    return { access: false, message: 'Car not found' };
  }
  
  // Check if user owns the car
  if (car.userId.toString() !== user._id.toString()) {
    return { access: false, message: 'You do not have permission to access this car' };
  }
  
  return { access: true, user, car };
}

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
    
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check access
    const accessCheck = await checkUserAccess(id, user.email);
    if (!accessCheck.access) {
      return NextResponse.json({ error: accessCheck.message }, { status: 403 });
    }
    
    // Return the car that was found in access check or fetch it again
    const car = accessCheck.car || await Car.findById(id);
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
    
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check access
    const accessCheck = await checkUserAccess(id, user.email);
    if (!accessCheck.access) {
      return NextResponse.json({ error: accessCheck.message }, { status: 403 });
    }
    
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
    
    // Get authenticated user
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check access
    const accessCheck = await checkUserAccess(id, user.email);
    if (!accessCheck.access) {
      return NextResponse.json({ error: accessCheck.message }, { status: 403 });
    }
    
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