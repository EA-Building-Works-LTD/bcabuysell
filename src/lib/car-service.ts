import connectDB from '@/lib/database';
import Car from '@/models/Car';
import mongoose from 'mongoose';

/**
 * Get all cars with optional status filter
 * 
 * @param status Optional status filter
 * @returns Array of car objects
 */
export async function getAllCars(status?: string) {
  try {
    // Connect to the database
    await connectDB();
    
    // Build query based on filters
    const query: any = {};
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    // Get cars matching the query - no user filtering
    const cars = await Car.find(query).sort({ createdAt: -1 });
    return cars;
  } catch (error) {
    console.error('Error in getAllCars:', error);
    throw error;
  }
}

/**
 * Get a car by ID
 * 
 * @param carId Car ID
 * @returns Car object or null if not found
 */
export async function getCarById(carId: string) {
  try {
    // Connect to the database
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      throw new Error('Invalid car ID format');
    }
    
    // Get car by ID
    const car = await Car.findById(carId);
    return car;
  } catch (error) {
    console.error('Error in getCarById:', error);
    throw error;
  }
}

/**
 * Create a new car
 * 
 * @param carData Car data
 * @param userId User ID of the car owner
 * @returns Created car object
 */
export async function createCar(carData: any, userId: string) {
  try {
    // Connect to the database
    await connectDB();
    
    // Create new car
    const car = new Car({
      ...carData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Save car to database
    await car.save();
    return car;
  } catch (error) {
    console.error('Error in createCar:', error);
    throw error;
  }
}

/**
 * Update an existing car
 * 
 * @param carId Car ID
 * @param carData Car data to update
 * @param userId User ID of the requester (for authorization)
 * @returns Updated car object or null if not found
 */
export async function updateCar(carId: string, carData: any, userId: string) {
  try {
    // Connect to the database
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      throw new Error('Invalid car ID format');
    }
    
    // Get the car
    const car = await Car.findById(carId);
    
    if (!car) {
      throw new Error('Car not found');
    }
    
    // Since we removed authentication, anyone can update any car
    // No permission check needed
    
    // Update car
    Object.assign(car, {
      ...carData,
      updatedAt: new Date()
    });
    
    // Save updated car
    await car.save();
    return car;
  } catch (error) {
    console.error('Error in updateCar:', error);
    throw error;
  }
}

/**
 * Delete a car
 * 
 * @param carId Car ID
 * @param userId User ID of the requester (for authorization)
 * @returns Deleted car object or null if not found
 */
export async function deleteCar(carId: string, userId: string) {
  try {
    // Connect to the database
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(carId)) {
      throw new Error('Invalid car ID format');
    }
    
    // Get the car
    const car = await Car.findById(carId);
    
    if (!car) {
      throw new Error('Car not found');
    }
    
    // Since we removed authentication, anyone can delete any car
    // No permission check needed
    
    // Delete car
    await car.deleteOne();
    return car;
  } catch (error) {
    console.error('Error in deleteCar:', error);
    throw error;
  }
} 