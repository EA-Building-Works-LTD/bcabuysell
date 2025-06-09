'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { ICar } from '@/models/Car';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Car as CarIcon, TrendingUp, Tag, CheckCircle, BarChart4, Clock, AlertCircle } from 'lucide-react';
import { fetchJson } from '@/lib/fetch-utils';

export default function Home() {
  const { user, userData, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cars, setCars] = useState<ICar[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setIsLoading(false);
    }
  }, [loading]);

  // Fetch cars data for dashboard
  useEffect(() => {
    const fetchCars = async () => {
      if (!user) return;
      
      setDataLoading(true);
      try {
        const data = await fetchJson('/api/cars');
        setCars(data.data);
      } catch (err: any) {
        setError(err.message || 'Error loading data. Please try again later.');
        console.error('Error fetching cars:', err);
      } finally {
        setDataLoading(false);
      }
    };
    
    if (user) {
      fetchCars();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    redirect('/auth/signin');
  }

  // Count cars by status
  const purchasedCount = cars.filter(car => car.status === 'purchased').length;
  const listedCount = cars.filter(car => car.status === 'listed').length;
  const soldCount = cars.filter(car => car.status === 'sold').length;
  
  // Calculate total profit from sold cars
  const totalProfit = cars
    .filter(car => car.status === 'sold' && car.soldPrice)
    .reduce((sum, car) => {
      const totalRepairCost = car.repairs?.reduce((acc, repair) => acc + repair.cost, 0) || 0;
      const totalCost = car.purchasePrice + car.recoveryPrice + car.fuelCost + car.insuranceCost + totalRepairCost;
      return sum + (car.soldPrice ? car.soldPrice - totalCost : 0);
    }, 0);

  // Get recent cars (last 5)
  const recentCars = [...cars]
    .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
    .slice(0, 5);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome to BCA Buy Sell</h1>
          <p className="text-gray-600 dark:text-gray-300">Hello, {user.displayName || user.email}</p>
          {userData?.role === 'admin' && (
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Admin privileges enabled</p>
          )}
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link href="/cars/new">
            <Button className="flex items-center">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Car
            </Button>
          </Link>
          <Link href="/statistics">
            <Button variant="outline" className="flex items-center">
              <BarChart4 className="mr-2 h-4 w-4" />
              View Statistics
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Inventory Card */}
        <Card className="p-4 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Inventory</p>
              <p className="text-2xl font-bold mt-1">{cars.length} cars</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
              <CarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">
              {purchasedCount} new
            </span>
            <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full">
              {listedCount} listed
            </span>
            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
              {soldCount} sold
            </span>
          </div>
        </Card>

        {/* Total Profit Card */}
        <Card className="p-4 border-l-4 border-green-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalProfit)}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {soldCount} cars sold
            </span>
          </div>
        </Card>

        {/* Cars Listed Card */}
        <Card className="p-4 border-l-4 border-amber-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Currently Listed</p>
              <p className="text-2xl font-bold mt-1">{listedCount}</p>
            </div>
            <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full">
              <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <Link href="/cars?status=listed" className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline">
              View listed cars →
            </Link>
          </div>
        </Card>

        {/* New Inventory Card */}
        <Card className="p-4 border-l-4 border-purple-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">New Inventory</p>
              <p className="text-2xl font-bold mt-1">{purchasedCount}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="flex items-center mt-4">
            <Link href="/cars?status=purchased" className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline">
              Manage new inventory →
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/cars">
            <Card className="p-4 h-full hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center">
              <CarIcon className="h-8 w-8 mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="font-medium">View All Cars</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{cars.length} total</p>
            </Card>
          </Link>
          <Link href="/cars/new">
            <Card className="p-4 h-full hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center">
              <PlusCircle className="h-8 w-8 mb-2 text-green-600 dark:text-green-400" />
              <h3 className="font-medium">Add New Car</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create listing</p>
            </Card>
          </Link>
          <Link href="/statistics">
            <Card className="p-4 h-full hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center">
              <BarChart4 className="h-8 w-8 mb-2 text-purple-600 dark:text-purple-400" />
              <h3 className="font-medium">Statistics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View analytics</p>
            </Card>
          </Link>
          <Link href="/cars?status=sold">
            <Card className="p-4 h-full hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center">
              <CheckCircle className="h-8 w-8 mb-2 text-amber-600 dark:text-amber-400" />
              <h3 className="font-medium">Sold Cars</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{soldCount} sold</p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Cars</h2>
        {dataLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : recentCars.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="text-left p-3 text-sm font-medium">Car</th>
                  <th className="text-left p-3 text-sm font-medium">Purchase Date</th>
                  <th className="text-left p-3 text-sm font-medium">Source</th>
                  <th className="text-left p-3 text-sm font-medium">Status</th>
                  <th className="text-left p-3 text-sm font-medium">Price</th>
                  <th className="text-left p-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentCars.map((car) => (
                  <tr key={car._id?.toString()} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="p-3 text-sm">{car.makeModel}</td>
                    <td className="p-3 text-sm">{new Date(car.purchaseDate).toLocaleDateString()}</td>
                    <td className="p-3 text-sm">{car.auctionSource}</td>
                    <td className="p-3 text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        car.status === 'purchased' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        car.status === 'listed' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      {car.status === 'sold' ? formatCurrency(car.soldPrice || 0) : 
                      car.status === 'listed' ? formatCurrency(car.salePrice || 0) : 
                      formatCurrency(car.purchasePrice)}
                    </td>
                    <td className="p-3 text-sm">
                      <Link href={`/cars/${car._id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No cars in inventory yet</p>
            <Link href="/cars/new">
              <Button className="mt-4">Add Your First Car</Button>
            </Link>
          </Card>
        )}
        {recentCars.length > 0 && (
          <div className="mt-4 text-center">
            <Link href="/cars">
              <Button variant="outline">View All Cars</Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
