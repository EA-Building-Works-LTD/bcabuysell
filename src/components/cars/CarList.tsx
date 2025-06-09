'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ICar } from '@/models/Car';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertCircle } from 'lucide-react';
import CarCard from './CarCard';
import { useAuth } from '@/contexts/AuthContext';
import { fetchJson, authFetch } from '@/lib/fetch-utils';

export default function CarList() {
  const { user } = useAuth();
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [deleteCarId, setDeleteCarId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCars = async () => {
      if (!user) return; // Don't fetch if user is not authenticated
      
      setLoading(true);
      setError(null);
      
      try {
        const status = filter !== 'all' ? filter : '';
        const data = await fetchJson(`/api/cars${status ? `?status=${status}` : ''}`);
        setCars(data.data);
      } catch (err: any) {
        setError(err.message || 'Error loading cars. Please try again later.');
        console.error('Error fetching cars:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, [filter, user]);

  const handleDeleteCar = async (id: string) => {
    try {
      const response = await authFetch(`/api/cars/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete car');
      }
      
      // Remove the car from the state
      setCars(cars.filter(car => car._id !== id));
      setIsDeleteDialogOpen(false);
    } catch (err: any) {
      console.error('Error deleting car:', err);
      alert(err.message || 'Failed to delete car. Please try again.');
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteCarId(id);
    setIsDeleteDialogOpen(true);
  };

  // Handle car update
  const handleCarUpdate = (updatedCar: ICar) => {
    setCars(cars.map(car => 
      car._id === updatedCar._id ? updatedCar : car
    ));
  };

  // Count cars by status
  const statusCounts = {
    all: cars.length,
    purchased: cars.filter(car => car.status === 'purchased').length,
    listed: cars.filter(car => car.status === 'listed').length,
    sold: cars.filter(car => car.status === 'sold').length
  };

  // Get active tab color
  const getActiveTabColor = (value: string): string => {
    switch(value) {
      case 'purchased':
        return 'data-[state=active]:bg-blue-600 data-[state=active]:text-white';
      case 'listed':
        return 'data-[state=active]:bg-amber-600 data-[state=active]:text-white';
      case 'sold':
        return 'data-[state=active]:bg-green-600 data-[state=active]:text-white';
      default:
        return 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* App-like header with improved contrast */}
      <div className="sticky top-0 z-10 bg-secondary dark:bg-gray-800 px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-secondary-foreground dark:text-white">Cars</h1>
        </div>
      </div>

      {/* Tab navigation - app style with improved contrast */}
      <div className="px-2">
        <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid grid-cols-4 mt-2 mb-2 bg-secondary/80 dark:bg-gray-800 p-1 rounded-full h-auto">
            <TabsTrigger 
              value="all" 
              className={`rounded-full text-secondary-foreground dark:text-gray-300 shadow-sm text-sm py-1 h-auto ${getActiveTabColor('all')}`}
            >
              All
              <span className="ml-1 text-xs text-gray-600 dark:text-gray-400 data-[state=active]:text-white dark:data-[state=active]:text-white/90">
                {statusCounts.all}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="purchased" 
              className={`rounded-full text-secondary-foreground dark:text-gray-300 shadow-sm text-sm py-1 h-auto ${getActiveTabColor('purchased')}`}
            >
              New
              <span className="ml-1 text-xs text-gray-600 dark:text-gray-400 data-[state=active]:text-white dark:data-[state=active]:text-white/90">
                {statusCounts.purchased}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="listed" 
              className={`rounded-full text-secondary-foreground dark:text-gray-300 shadow-sm text-sm py-1 h-auto ${getActiveTabColor('listed')}`}
            >
              Listed
              <span className="ml-1 text-xs text-gray-600 dark:text-gray-400 data-[state=active]:text-white dark:data-[state=active]:text-white/90">
                {statusCounts.listed}
              </span>
            </TabsTrigger>
            <TabsTrigger 
              value="sold" 
              className={`rounded-full text-secondary-foreground dark:text-gray-300 shadow-sm text-sm py-1 h-auto ${getActiveTabColor('sold')}`}
            >
              Sold
              <span className="ml-1 text-xs text-gray-600 dark:text-gray-400 data-[state=active]:text-white dark:data-[state=active]:text-white/90">
                {statusCounts.sold}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-0 space-y-0 pb-1">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-xl mb-3">
                    <div className="h-32 bg-gray-200 dark:bg-gray-800 animate-pulse" />
                    <div className="p-2 space-y-2">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="mx-2 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg flex items-center text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-2 text-center">
                <div className="bg-secondary dark:bg-gray-800 rounded-full p-3 mb-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-1 text-foreground">No cars found</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                  No cars match the current filter
                </p>
                <Link href="/cars/new">
                  <Button>Add your first car</Button>
                </Link>
              </div>
            ) : (
              <div className="px-0 space-y-2">
                {cars.map((car) => (
                  <CarCard 
                    key={car._id?.toString()} 
                    car={car} 
                    onDelete={confirmDelete}
                    onUpdate={handleCarUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Car</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this car? This action cannot be undone.
          </p>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteCarId && handleDeleteCar(deleteCarId)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 