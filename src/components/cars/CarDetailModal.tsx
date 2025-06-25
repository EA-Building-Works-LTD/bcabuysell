'use client';

import React from 'react';
import { ICar } from '@/models/Car';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, CarIcon, TagIcon, InfoIcon, CheckCircleIcon, XCircleIcon, TrendingUpIcon, BanknoteIcon, GaugeCircleIcon, FileTextIcon, ClockIcon, UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { USER_COLORS } from '@/types/users';

// Helper functions
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (date: Date | string) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

interface CarDetailModalProps {
  car: ICar;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function CarDetailModal({ car, isOpen, onClose, onEdit }: CarDetailModalProps) {
  const [calculatedProfit, setCalculatedProfit] = useState<number | undefined>(undefined);
  const [statusLabel, setStatusLabel] = useState<React.ReactNode>(<div></div>);
  
  // Calculate profit when car data changes
  useEffect(() => {
    if (car) {
      const totalRepairsCost = car.repairs?.reduce((sum, repair) => sum + repair.cost, 0) || 0;
      const totalCost = car.purchasePrice + car.recoveryPrice + car.fuelCost + car.insuranceCost + totalRepairsCost;
      
      if (car.soldPrice) {
        setCalculatedProfit(car.soldPrice - totalCost);
      } else {
        setCalculatedProfit(car.salePrice - totalCost);
      }
    }
  }, [car]);
  
  useEffect(() => {
    setStatusLabel(getStatusLabel());
  }, [car]);
  
  // Get status label with appropriate color
  const getStatusLabel = () => {
    if (!car) return null;
    
    switch (car.status) {
      case 'purchased':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Purchased
          </div>
        );
      case 'listed':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <TagIcon className="w-3 h-3 mr-1" />
            Listed
          </div>
        );
      case 'sold':
        return (
          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <BanknoteIcon className="w-3 h-3 mr-1" />
            Sold
          </div>
        );
      default:
        return null;
    }
  };
  
  const totalRepairCost = car.repairs?.reduce((sum, repair) => sum + repair.cost, 0) || 0;
  const totalCost = car.purchasePrice + car.recoveryPrice + car.fuelCost + car.insuranceCost + totalRepairCost;

  if (!car) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center">
            <CarIcon className="mr-2 h-5 w-5" />
            {car.makeModel}
          </DialogTitle>
        </DialogHeader>
        
        {/* Header Section - replacing Image Section */}
                    <div className="relative w-full h-24 mb-4 rounded-lg overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
          {/* Status Badge */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 rounded-full px-3 py-1 text-sm font-medium flex items-center shadow-sm border border-gray-200 dark:border-gray-700">
            <span className={`w-2 h-2 rounded-full mr-2 ${
              car.status === 'purchased' ? 'bg-blue-600' : 
              car.status === 'listed' ? 'bg-amber-600' : 'bg-green-600'
            }`}></span>
            <span className="capitalize text-gray-900 dark:text-white">{car.status}</span>
          </div>
          
          {/* Owner Badge */}
          <div className={`absolute top-4 left-4 ${USER_COLORS[car.owner]} text-white font-medium px-3 py-1 rounded-md text-sm shadow-sm flex items-center`}>
            <UserIcon className="h-4 w-4 mr-1" />
            {car.owner}
          </div>
          
          {/* Registration Plate */}
          {car.regNumber && (
            <div className="absolute bottom-4 left-4 bg-yellow-300 text-black font-mono font-bold px-2 py-0.5 rounded-md text-xs shadow-sm">
              {car.regNumber.toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Car Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-base">Vehicle Information</h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Purchase Date</p>
                  <p className="font-medium">{new Date(car.purchaseDate).toLocaleDateString() || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Source</p>
                  <p className="font-medium">{car.auctionSource || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <TagIcon className="h-4 w-4 mr-2 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Registration</p>
                  <p className="font-medium">{car.regNumber ? car.regNumber.toUpperCase() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Prices section */}
          <div className="space-y-4">
            <h3 className="font-medium text-base">Vehicle Cost Breakdown</h3>
            
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Purchase Price</p>
                  <p className="font-bold text-gray-900 dark:text-white">{formatPrice(car.purchasePrice)}</p>
                </div>
                
                {car.status === 'listed' && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Listed Price</p>
                    <p className="font-bold text-amber-700 dark:text-amber-300">{formatPrice(car.salePrice)}</p>
                  </div>
                )}
                
                {car.status === 'sold' && car.soldPrice && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700 dark:text-green-300">Sold Price</p>
                    <p className="font-bold text-green-700 dark:text-green-300">{formatPrice(car.soldPrice)}</p>
                  </div>
                )}
              </div>
              
              {/* Additional costs */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-3">
                <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-white">Additional Costs</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Recovery:</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(car.recoveryPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Fuel:</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(car.fuelCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Insurance:</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(car.insuranceCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">Repairs:</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(totalRepairCost)}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-1 mt-1">
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-800 dark:text-gray-200">Total Costs:</span>
                      <span className="text-gray-900 dark:text-white">{formatPrice(totalCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profit section */}
              {car.status === 'sold' && calculatedProfit !== undefined && (
                <div className={`rounded-lg p-3 mb-3 ${
                  calculatedProfit >= 0 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center mb-2">
                    <TrendingUpIcon className={`h-4 w-4 mr-1 ${
                      calculatedProfit >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`} />
                    <h4 className={`text-sm font-medium ${
                      calculatedProfit >= 0 
                        ? 'text-green-800 dark:text-green-300' 
                        : 'text-red-800 dark:text-red-300'
                    }`}>
                      Profit Summary
                    </h4>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className={calculatedProfit >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                    }>
                      Total Profit:
                    </span>
                    <span className={calculatedProfit >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                    }>
                      {formatPrice(calculatedProfit)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Potential profit for listed cars */}
              {car.status === 'listed' && car.salePrice && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 mb-3">
                  <div className="flex items-center mb-2">
                    <TrendingUpIcon className="h-4 w-4 mr-1 text-amber-600 dark:text-amber-400" />
                    <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                      Potential Profit
                    </h4>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-amber-600 dark:text-amber-400">
                      If sold at listed price:
                    </span>
                    <span className="text-amber-600 dark:text-amber-400">
                      {formatPrice(car.salePrice - totalCost)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Notes section if available */}
        {car.notes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">{car.notes}</p>
          </div>
        )}
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="mr-2">Close</Button>
          <Button onClick={onEdit}>Edit Car</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 