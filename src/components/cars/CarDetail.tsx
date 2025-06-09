'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ICar, IRepair } from '@/models/Car';

interface CarDetailProps {
  car: ICar & {
    _id: string;
    purchaseDate?: string;
    soldDate?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export default function CarDetail({ car }: CarDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };
  
  // Calculate total costs
  const totalRepairCost = car.repairs?.reduce((sum, repair) => sum + repair.cost, 0) || 0;
  const totalCost = car.purchasePrice + car.recoveryPrice + car.fuelCost + car.insuranceCost + totalRepairCost;
  
  // Format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'purchased':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'listed':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'sold':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };
  
  // Handle car deletion
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${car.makeModel}?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/cars/${car._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete car');
      }
      
      router.push('/cars');
      router.refresh();
    } catch (error) {
      console.error('Error deleting car:', error);
      alert('Failed to delete car. Please try again.');
      setIsDeleting(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(car.status)}`}>
            {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
          </span>
        </div>
        <div className="flex space-x-3">
          <Link
            href={`/cars/${car._id}/edit`}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium ${
              isDeleting ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <Link
            href="/cars"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Back to List
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Car Details Section */}
        <div>
          <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
            Car Details
          </h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{car.makeModel}</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Purchased from {car.auctionSource}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Date</p>
                <p className="font-medium">{formatDate(car.purchaseDate)}</p>
              </div>
              
              {car.soldDate && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sold Date</p>
                  <p className="font-medium">{formatDate(car.soldDate)}</p>
                </div>
              )}
              
              <div className="col-span-2 mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                <p className="font-medium whitespace-pre-wrap">{car.notes || 'No notes available'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Financial Summary Section */}
        <div>
          <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
            Financial Summary
          </h2>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Price</p>
                <p className="font-medium">{formatPrice(car.purchasePrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recovery Cost</p>
                <p className="font-medium">{formatPrice(car.recoveryPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Cost</p>
                <p className="font-medium">{formatPrice(car.fuelCost)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Insurance Cost</p>
                <p className="font-medium">{formatPrice(car.insuranceCost)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Repair Cost</p>
                <p className="font-medium">{formatPrice(totalRepairCost)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sale Price (Listed)</p>
                <p className="font-medium">{formatPrice(car.salePrice)}</p>
              </div>
              
              {car.soldPrice && car.soldPrice > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sold Price (Final)</p>
                  <p className="font-medium">{formatPrice(car.soldPrice)}</p>
                </div>
              )}
              
              <div className="col-span-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Costs</p>
                <p className="font-medium">{formatPrice(totalCost)}</p>
              </div>
              
              {car.profit !== undefined && (
                <div className="col-span-2 pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Profit</p>
                  <p className={`text-lg font-bold ${car.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPrice(car.profit)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Repairs Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          Repair Costs
        </h2>
        
        {car.repairs && car.repairs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {car.repairs.map((repair: IRepair, index: number) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {repair.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatPrice(repair.cost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {repair.description || 'N/A'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    Total
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {formatPrice(totalRepairCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"></td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No repair costs recorded</p>
        )}
      </div>
    </div>
  );
} 