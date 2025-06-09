import CarForm from '@/components/cars/CarForm';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/database';
import Car from '@/models/Car';
import mongoose from 'mongoose';

interface EditCarPageProps {
  params: {
    id: string;
  };
}

// Generate metadata dynamically
export async function generateMetadata({ params }: EditCarPageProps) {
  await connectDB();
  
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return {
      title: 'Car Not Found - BCA Buy Sell',
    };
  }
  
  const car = await Car.findById(params.id);
  
  if (!car) {
    return {
      title: 'Car Not Found - BCA Buy Sell',
    };
  }
  
  return {
    title: `Edit ${car.makeModel} - BCA Buy Sell`,
    description: `Edit details for ${car.makeModel}`,
  };
}

// This enables dynamic rendering for this route
export const dynamic = 'force-dynamic';

export default async function EditCarPage({ params }: EditCarPageProps) {
  await connectDB();
  
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    notFound();
  }
  
  const car = await Car.findById(params.id);
  
  if (!car) {
    notFound();
  }
  
  // Convert to plain object with string ID
  const carData = {
    ...car.toObject(),
    _id: car._id.toString(),
    createdAt: car.createdAt?.toISOString(),
    updatedAt: car.updatedAt?.toISOString(),
    purchaseDate: car.purchaseDate?.toISOString(),
    soldDate: car.soldDate?.toISOString(),
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-700">Edit Car</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Update details for {car.makeModel}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <CarForm carData={carData} isEdit={true} />
      </div>
    </div>
  );
} 