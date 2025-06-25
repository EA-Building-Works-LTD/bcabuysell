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
import { FIXED_USERS, USER_COLORS, USER_COLOR_SCHEMES, FixedUser } from '@/types/users';
import CarCard from './CarCard';

export default function CarList() {
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [deleteCarId, setDeleteCarId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCars = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const owner = filter !== 'all' ? filter : '';
        const apiUrl = `/api/cars${owner ? `?owner=${owner}` : ''}`;
        
        // Simply fetch from the API without authentication
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          let errorMessage = `Error ${response.status}: ${response.statusText}`;
          
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // If response isn't JSON, use the status text
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setCars(data.data);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching cars:', error);
        setError(error.message || 'Error loading cars. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, [filter]);

  const handleDeleteCar = async (id: string) => {
    try {
      const response = await fetch(`/api/cars/${id}`, {
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

  // Count cars by owner
  const ownerCounts: Record<string, number> = {
    all: cars.length,
    ...FIXED_USERS.reduce((acc, owner) => {
      acc[owner] = cars.filter(car => car.owner === owner).length;
      return acc;
    }, {} as Record<string, number>)
  };



  return (
    <div className="flex flex-col h-full">
      {/* Tab navigation - owner-based filtering */}
      <div className="px-4 pt-6">
        <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="flex flex-wrap justify-center gap-2 mt-2 mb-4 bg-white dark:bg-gray-800 p-2 rounded-2xl h-auto shadow-md border border-gray-200 dark:border-gray-700">
            <TabsTrigger 
              value="all" 
              className="rounded-xl text-gray-700 dark:text-gray-300 shadow-sm text-sm px-4 py-3 h-auto transition-all duration-200 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md font-medium whitespace-nowrap flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span>All</span>
              <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white font-semibold min-w-[24px] text-center">
                {ownerCounts.all}
              </span>
            </TabsTrigger>
            {FIXED_USERS.map((owner) => {
              const ownerColors = USER_COLOR_SCHEMES[owner];
              return (
                <TabsTrigger 
                  key={owner}
                  value={owner} 
                  className="rounded-xl text-gray-700 dark:text-gray-300 shadow-sm text-sm px-4 py-3 h-auto transition-all duration-200 data-[state=active]:shadow-md data-[state=active]:text-white font-medium whitespace-nowrap flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  style={{
                    ['--tab-active-bg' as any]: ownerColors.primary,
                  }}
                  data-state={filter === owner ? 'active' : 'inactive'}
                >
                  <span>{owner}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg data-[state=active]:bg-white/20 data-[state=active]:text-white font-semibold min-w-[24px] text-center">
                    {ownerCounts[owner] || 0}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={filter} className="mt-0 space-y-0 pb-1">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden rounded-xl mb-3 shadow-premium border-0">
                    <div className="h-32 bg-muted/30 animate-pulse" />
                    <div className="p-4 space-y-3">
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
              <div className="mx-2 mt-2 bg-destructive/10 p-4 rounded-xl flex items-center text-destructive border border-destructive/20">
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            ) : cars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="bg-muted/30 rounded-2xl p-4 mb-4 shadow-sm">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-10 w-10 text-muted-foreground" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" 
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">No cars found</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                  {filter === 'all' ? 'Get started by adding your first car to the inventory' : `No cars found for ${filter}. Try selecting a different owner or add a new car.`}
                </p>
                <Link href="/cars/new">
                  <Button size="lg" className="shadow-premium">
                    Add your first car
                  </Button>
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
        <DialogContent className="sm:max-w-[425px] rounded-xl shadow-premium-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Car</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this car? This action cannot be undone.
          </p>
          <DialogFooter className="flex space-x-3 sm:space-x-0">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="shadow-sm">
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteCarId && handleDeleteCar(deleteCarId)} className="shadow-sm">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 