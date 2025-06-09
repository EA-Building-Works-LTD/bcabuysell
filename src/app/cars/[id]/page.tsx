'use client';

import CarDetail from '@/components/cars/CarDetail';
import { notFound, redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface CarDetailPageProps {
  params: {
    id: string;
  };
}

export default function CarDetailPage({ params }: CarDetailPageProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [car, setCar] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    if (!loading && !user) {
      router.push('/auth/signin');
      return;
    }

    // Fetch car data
    async function fetchCar() {
      try {
        const response = await fetch(`/api/cars/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/404');
            return;
          }
          
          if (response.status === 403) {
            router.push('/cars?error=unauthorized');
            return;
          }
          
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch car data');
        }
        
        const data = await response.json();
        setCar(data.data);
      } catch (error: any) {
        console.error('Error fetching car:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    if (!loading && user) {
      fetchCar();
    }
  }, [loading, user, params.id, router]);

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!car) {
    return null; // Let the useEffect redirects handle this
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary-700">Car Details</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Viewing details for {car.makeModel}
        </p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <CarDetail car={car} />
      </div>
    </div>
  );
} 