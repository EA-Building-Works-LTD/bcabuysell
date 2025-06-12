'use client';

import { ICar } from '@/models/Car';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarIcon, MapPinIcon, MoreVertical, Heart, Tag, EyeIcon, EditIcon, TrashIcon, ChevronDownIcon, TrendingUpIcon, BanknoteIcon, PoundSterlingIcon, MoreHorizontal, UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import CarDetailModal from './CarDetailModal';
import CarEditModal from './CarEditModal';
import Image from 'next/image';
import { USER_COLORS } from '@/types/users';

interface CarCardProps {
  car: ICar;
  onDelete: (id: string) => void;
  onUpdate?: (updatedCar: ICar) => void;
}

export default function CarCard({ car, onDelete, onUpdate }: CarCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [calculatedProfit, setCalculatedProfit] = useState<number | undefined>(undefined);
  const [potentialProfit, setPotentialProfit] = useState<number | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Format price with currency
  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Status indicator colors
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'purchased':
        return 'bg-blue-500';
      case 'listed':
        return 'bg-amber-500';
      case 'sold':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Calculate profits when component mounts or when car changes
  useEffect(() => {
    // Calculate total costs
    const totalRepairCost = car.repairs?.reduce((sum, repair) => sum + repair.cost, 0) || 0;
    const totalCost = car.purchasePrice + car.recoveryPrice + car.fuelCost + car.insuranceCost + totalRepairCost;
    
    // Calculate actual profit for sold cars
    if (car.status === 'sold' && car.soldPrice) {
      setCalculatedProfit(car.soldPrice - totalCost);
    }
    
    // Calculate potential profit for listed cars
    if (car.status === 'listed') {
      setPotentialProfit(car.salePrice - totalCost);
    }
  }, [car]);

  // Calculate total costs (needed for display)
  const totalRepairCost = car.repairs?.reduce((sum, repair) => sum + repair.cost, 0) || 0;
  const totalCost = car.purchasePrice + car.recoveryPrice + car.fuelCost + car.insuranceCost + totalRepairCost;

  // Handle delete with confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (car._id) {
      onDelete(car._id.toString());
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Handle opening modals
  const openDetailModal = () => {
    setShowDetailModal(true);
  };

  const openEditModal = () => {
    setShowEditModal(true);
  };

  // Handle car update from edit modal
  const handleCarUpdate = (updatedCar: ICar) => {
    setShowEditModal(false);
    if (onUpdate) {
      onUpdate(updatedCar);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm mb-2 relative">
        {/* Status indicator */}
        <div className={`absolute top-0 right-0 w-3 h-3 m-1.5 rounded-full ${getStatusColor(car.status)}`} />
        
        {/* Header section - replacing image section */}
        <div 
          className="bg-gradient-to-r from-sky-100 to-indigo-100 dark:from-sky-950/40 dark:to-indigo-950/40 h-24 flex items-center justify-center relative"
          onClick={openDetailModal}
        >
          {/* Owner Badge - Top Left */}
          <div className="absolute top-2 left-2 bg-black/80 text-white font-semibold px-3 py-1 rounded-md text-xs shadow-sm z-10 flex items-center min-w-[70px] whitespace-nowrap">
            <UserIcon className="h-3 w-3 mr-1" />
            <span className="ml-1 truncate">{car.owner || 'No Owner'}</span>
          </div>
          
          {/* Registration plate - Top Right */}
          <div className="absolute top-2 right-2 bg-yellow-300 text-black font-mono font-bold px-2 py-0.5 rounded-md text-xs shadow-sm z-10">
            {car.regNumber ? car.regNumber.toUpperCase() : 'REG PLATE'}
          </div>
          
          {/* Listed price - shown for listed and sold cars */}
          {(car.status === 'listed' || car.status === 'sold') && (
            <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-black/70 py-1 px-2 rounded-md shadow-sm flex items-center z-10">
              <PoundSterlingIcon className="h-3 w-3 mr-1 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatPrice(car.salePrice).replace('£', '')}
              </span>
            </div>
          )}
        </div>
        
        {/* Card content */}
        <div className="p-2">
          {/* Car name and basic info */}
          <div className="mb-1.5 flex justify-between items-start">
            <div onClick={openDetailModal} className="cursor-pointer">
              <h3 className="font-semibold text-md text-gray-900 dark:text-white">{car.makeModel}</h3>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5 space-x-2">
                <div className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {new Date(car.purchaseDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-3 w-3 mr-1" />
                  {car.auctionSource}
                </div>
              </div>
            </div>
            
            {/* Action menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={openDetailModal}>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openEditModal}>
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} className="text-red-600 dark:text-red-400">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Car details badges */}
          <div className="flex flex-wrap gap-1 my-1.5">
            {car.mileage && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600">
                {car.mileage.toLocaleString()} miles
              </span>
            )}
            {car.fuelType && (
              <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-full border border-blue-200 dark:border-blue-800/50">
                {car.fuelType}
              </span>
            )}
            {car.transmission && (
              <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800/50">
                {car.transmission}
              </span>
            )}
            {car.mot && (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded-full border border-green-200 dark:border-green-800/50">
                MOT: {car.mot}
              </span>
            )}
          </div>
          
          {/* All Prices Section */}
          <div className="mt-2 mb-1.5 flex flex-wrap gap-1.5">
            {/* Purchase Price - Fixed text color */}
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-1.5 py-1 flex-1 min-w-[100px]">
              <div className="text-xs text-gray-700 dark:text-gray-300 font-medium">Purchase</div>
              <div className="font-bold text-sm text-gray-900 dark:text-white">{formatPrice(car.purchasePrice)}</div>
            </div>
            
            {/* Listed Price - show if listed or sold */}
            {(car.status === 'listed' || car.status === 'sold') && (
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-1.5 py-1 flex-1 min-w-[100px]">
                <div className="text-xs text-amber-600 dark:text-amber-400">Profit</div>
                <div className="font-bold text-sm text-amber-700 dark:text-amber-300">
                  {car.status === 'listed' ? formatPrice(potentialProfit) : formatPrice(calculatedProfit)}
                </div>
              </div>
            )}
            
            {/* Sold Price - show only if sold */}
            {car.status === 'sold' && car.soldPrice && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-1.5 py-1 flex-1 min-w-[100px]">
                <div className="text-xs text-green-600 dark:text-green-400">Sold</div>
                <div className="font-bold text-sm text-green-700 dark:text-green-300">{formatPrice(car.soldPrice)}</div>
              </div>
            )}
          </div>
          
          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="mt-1.5 mb-2 border border-red-200 dark:border-red-900/50 rounded-md p-2 bg-red-50 dark:bg-red-950/20">
              <p className="text-xs text-red-700 dark:text-red-400 mb-1.5">Are you sure you want to delete this car?</p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={cancelDelete}
                  className="text-xs h-6 px-2"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={confirmDelete}
                  className="text-xs h-6 px-2"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          {/* Actions row */}
          <div className="flex items-center justify-between mt-1.5">
            {/* Profit indicator - show actual profit for sold cars or potential profit for listed cars */}
            {calculatedProfit !== undefined && car.status === 'sold' ? (
              <div className={`py-0.5 px-1.5 text-xs rounded-md flex items-center ${
                calculatedProfit >= 0 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                <span>Profit: {formatPrice(calculatedProfit)}</span>
              </div>
            ) : potentialProfit !== undefined ? (
              <div className={`py-0.5 px-1.5 text-xs rounded-md flex items-center ${
                potentialProfit >= 0 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                <span>Potential: {formatPrice(potentialProfit)}</span>
              </div>
            ) : car.status === 'purchased' ? (
              <div className="flex items-center">
                <BanknoteIcon className="h-3 w-3 mr-1 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  Recently purchased
                </span>
              </div>
            ) : (
              <div></div> // Empty div as fallback
            )}
            
            {/* View button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="px-2 py-0 h-6 text-xs"
              onClick={openDetailModal}
            >
              <EyeIcon className="h-3 w-3 mr-1" /> View
            </Button>
          </div>
          
          {/* Expandable costs and profit section - improved text colors */}
          <div className="mt-2">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between py-1 px-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md"
            >
              Costs & Profit Details
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            
            {showDetails && (
              <div className="mt-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md p-1.5 space-y-1 bg-white dark:bg-gray-800">
                {/* Costs section */}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">Purchase Price:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(car.purchasePrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">Recovery:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(car.recoveryPrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">Fuel:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(car.fuelCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">Insurance:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(car.insuranceCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700 dark:text-gray-300">Repairs:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(totalRepairCost)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-800 dark:text-gray-200">Total Costs:</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(totalCost)}</span>
                  </div>
                  
                  {/* Listed price (if applicable) */}
                  {car.status === 'listed' && (
                    <>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-amber-600 dark:text-amber-400">Listed Price:</span>
                        <span className="text-gray-900 dark:text-white">{formatPrice(car.salePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
                        <span className={potentialProfit && potentialProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          Potential Profit:
                        </span>
                        <span className={potentialProfit && potentialProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {formatPrice(potentialProfit)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {/* Sold details (if applicable) */}
                  {car.status === 'sold' && car.soldPrice && (
                    <>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-gray-700 dark:text-gray-300">Sold Price:</span>
                        <span className="text-gray-900 dark:text-white">{formatPrice(car.soldPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
                        <span className={calculatedProfit && calculatedProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          Actual Profit:
                        </span>
                        <span className={calculatedProfit && calculatedProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {formatPrice(calculatedProfit)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Car Detail Modal */}
      <CarDetailModal 
        car={car} 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        onEdit={openEditModal}
      />

      {/* Car Edit Modal */}
      <CarEditModal 
        car={car} 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onSave={handleCarUpdate}
      />
    </>
  );
}