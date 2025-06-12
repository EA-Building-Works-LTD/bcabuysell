'use client';

import { ICar } from '@/models/Car';
import { Card } from '@/components/ui/card';
import { TrendingUp, Car as CarIcon, Tag, CheckCircle, PoundSterling, ArrowUp, ArrowDown } from 'lucide-react';

interface StatsSummaryCardsProps {
  cars: ICar[];
}

export default function StatsSummaryCards({ cars }: StatsSummaryCardsProps) {
  // Count cars by status
  const soldCount = cars.filter(car => car.status === 'sold').length;
  const totalCars = cars.length;
  
  // Calculate total investment (purchase prices only)
  const totalInvestment = cars.reduce((sum, car) => sum + car.purchasePrice, 0);
  
  // Calculate total profit from sold cars
  const totalProfit = cars
    .filter(car => car.status === 'sold' && car.soldPrice)
    .reduce((sum, car) => {
      const totalRepairCost = car.repairs?.reduce((acc, repair) => acc + repair.cost, 0) || 0;
      const totalCost = car.purchasePrice + car.recoveryPrice + car.fuelCost + car.insuranceCost + totalRepairCost;
      return sum + (car.soldPrice ? car.soldPrice - totalCost : 0);
    }, 0);
  
  // Calculate conversion rate
  const conversionRate = totalCars > 0 ? Math.round((soldCount / totalCars) * 100) : 0;
  
  // Format numbers for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Investment Card */}
      <Card className="p-4 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Investment</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totalInvestment)}</p>
          </div>
          <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
            <PoundSterling className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Purchase prices only
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
          <span className={`text-xs font-medium flex items-center ${totalProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {totalProfit >= 0 ? (
              <ArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDown className="h-3 w-3 mr-1" />
            )}
            From sold cars only
          </span>
        </div>
      </Card>
      
      {/* Total Cars Card */}
      <Card className="p-4 border-l-4 border-purple-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Cars</p>
            <p className="text-2xl font-bold mt-1">{totalCars}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
            <CarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            All inventory
          </span>
        </div>
      </Card>
      
      {/* Cars Sold Card */}
      <Card className="p-4 border-l-4 border-amber-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cars Sold</p>
            <p className="text-2xl font-bold mt-1">{soldCount}</p>
          </div>
          <div className="bg-amber-100 dark:bg-amber-900/20 p-3 rounded-full">
            <Tag className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Completed sales
          </span>
        </div>
      </Card>
      
      {/* Conversion Rate Card */}
      <Card className="p-4 border-l-4 border-indigo-500">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Conversion Rate</p>
            <p className="text-2xl font-bold mt-1">{conversionRate}%</p>
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-full">
            <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {soldCount} sold of {totalCars} total
          </span>
        </div>
      </Card>
    </div>
  );
} 