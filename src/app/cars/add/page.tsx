import CarForm from '@/components/cars/CarForm';

export const metadata = {
  title: 'Add New Car - BCA Buy Sell',
  description: 'Add a new car to your inventory',
};

export default function AddCarPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-700">Add New Car</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Enter the details of the car you purchased
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <CarForm />
      </div>
    </div>
  );
} 