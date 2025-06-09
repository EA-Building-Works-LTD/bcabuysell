'use client';

import { useState, useEffect } from 'react';
import { ICar } from '@/models/Car';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfitChart from './ProfitChart';
import SalesByStatusChart from './SalesByStatusChart';
import StatsSummaryCards from './StatsSummaryCards';
import InventoryAgeChart from './InventoryAgeChart';
import { useAuth } from '@/contexts/AuthContext';
import { fetchJson } from '@/lib/fetch-utils';

export default function StatisticsOverview() {
  const { user } = useAuth();
  const [cars, setCars] = useState<ICar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all');
  
  // Fetch all cars for statistics
  useEffect(() => {
    const fetchCars = async () => {
      if (!user) return; // Don't fetch if user is not authenticated
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchJson('/api/cars');
        setCars(data.data);
      } catch (err: any) {
        setError(err.message || 'Error loading statistics. Please try again later.');
        console.error('Error fetching cars for statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCars();
  }, [user]);
  
  // Filter cars based on time range
  const getFilteredCars = (): ICar[] => {
    if (timeRange === 'all') return cars;
    
    const now = new Date();
    const timeRangeInDays = timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoffDate = new Date(now.setDate(now.getDate() - timeRangeInDays));
    
    return cars.filter(car => {
      const purchaseDate = new Date(car.purchaseDate);
      return purchaseDate >= cutoffDate;
    });
  };
  
  const filteredCars = getFilteredCars();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md">
        {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-center">
        <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-auto">
          <TabsList className="mx-auto">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
            <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
            <TabsTrigger value="1y">Last Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Summary Cards */}
      <StatsSummaryCards cars={filteredCars} />
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Profit Analysis</h3>
          <ProfitChart cars={filteredCars} />
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Inventory by Status</h3>
          <SalesByStatusChart cars={filteredCars} />
        </Card>
      </div>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Inventory Age Distribution</h3>
        <InventoryAgeChart cars={filteredCars} />
      </Card>
    </div>
  );
} 