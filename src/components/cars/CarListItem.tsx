'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ICar } from '@/models/Car';

interface CarListItemProps {
  car: ICar;
  onDelete: (id: string) => void;
}

export default function CarListItem({ car, onDelete }: CarListItemProps) {
  const formattedPurchaseDate = new Date(car.purchaseDate).toLocaleDateString();
  const formattedSoldDate = car.soldDate ? new Date(car.soldDate).toLocaleDateString() : '';
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP',
    }).format(price);
  };

  // Determine the status badge style
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

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {car.makeModel}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {formattedPurchaseDate}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{car.auctionSource}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{formatPrice(car.purchasePrice)}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(car.status)}`}>
          {car.status.charAt(0).toUpperCase() + car.status.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {car.profit !== undefined ? (
          <div className={`text-sm font-medium ${car.profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatPrice(car.profit)}
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400">-</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          <Link
            href={`/cars/${car._id?.toString()}`}
            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
          >
            View
          </Link>
          <Link
            href={`/cars/${car._id?.toString()}/edit`}
            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Edit
          </Link>
          <button
            onClick={() => car._id && onDelete(car._id.toString())}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
} 