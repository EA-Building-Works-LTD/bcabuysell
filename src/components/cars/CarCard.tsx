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
import { USER_COLORS, USER_COLOR_SCHEMES } from '@/types/users';

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

  // Status indicator colors using new color system
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'purchased':
        return 'bg-blue-500';
      case 'listed':
        return 'bg-warning';
      case 'sold':
        return 'bg-success';
      default:
        return 'bg-muted-foreground';
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
      <div className="bg-card rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border/20 mb-4 overflow-hidden group">
        {/* Clean Header Section */}
        <div className="relative">
          {/* Top Bar with Owner and Actions */}
          <div className="flex items-center justify-between p-4 pb-2">
            {/* Owner Badge */}
            <div 
              className="inline-flex items-center px-3 py-1.5 rounded-full text-white text-sm font-medium shadow-sm"
              style={{ backgroundColor: USER_COLOR_SCHEMES[car.owner]?.primary || 'hsl(var(--primary))' }}
            >
              <UserIcon className="h-4 w-4 mr-1.5" />
              {car.owner || 'No Owner'}
            </div>
            
            {/* Registration Plate */}
            <div className="bg-yellow-400 text-black font-mono font-bold px-3 py-1.5 rounded-lg text-sm shadow-sm">
              {car.regNumber ? car.regNumber.toUpperCase() : 'REG PLATE'}
            </div>
          </div>
          
          {/* Car Title Section */}
          <div className="px-4 pb-4" onClick={openDetailModal} role="button" tabIndex={0}>
            <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors cursor-pointer">
              {car.makeModel}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1.5" />
                {new Date(car.purchaseDate).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1.5" />
                {car.auctionSource}
              </div>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="absolute top-4 right-16">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(car.status)} shadow-sm`}></div>
          </div>
          
          {/* Action Menu */}
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="shadow-lg">
                <DropdownMenuItem onClick={openDetailModal} className="cursor-pointer">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openEditModal} className="cursor-pointer">
                  <EditIcon className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive hover:text-destructive cursor-pointer">
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Card Content */}
        <div className="px-4 pb-4 space-y-4">
          
          {/* Car Specifications */}
          {(car.mileage || car.fuelType || car.transmission || car.mot) && (
            <div className="flex flex-wrap gap-2">
              {car.mileage && (
                <span className="inline-flex items-center px-3 py-1 bg-muted/50 text-muted-foreground text-xs font-medium rounded-full border">
                  📊 {car.mileage.toLocaleString()} miles
                </span>
              )}
              {car.fuelType && (
                <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded-full border border-blue-200 dark:border-blue-800">
                  ⛽ {car.fuelType}
                </span>
              )}
              {car.transmission && (
                <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-800">
                  ⚙️ {car.transmission}
                </span>
              )}
              {car.mot && (
                <span className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-medium rounded-full border border-emerald-200 dark:border-emerald-800">
                  ✅ MOT: {car.mot}
                </span>
              )}
            </div>
          )}
          
          {/* Financial Summary */}
          <div className="space-y-3">
            {/* Purchase Price */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
              <div className="flex items-center text-sm text-muted-foreground">
                <BanknoteIcon className="h-4 w-4 mr-2" />
                Purchase
              </div>
              <div className="text-lg font-semibold text-foreground">
                {formatPrice(car.purchasePrice)}
              </div>
            </div>
            
            {/* Profit - show if listed or sold */}
            {(car.status === 'listed' || car.status === 'sold') && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <TrendingUpIcon className="h-4 w-4 mr-2" />
                  Profit
                </div>
                <div className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  {car.status === 'listed' ? formatPrice(potentialProfit) : formatPrice(calculatedProfit)}
                </div>
              </div>
            )}
            
            {/* Sold Price - show only if sold */}
            {car.status === 'sold' && car.soldPrice && (
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center text-sm text-emerald-600 dark:text-emerald-400">
                  <PoundSterlingIcon className="h-4 w-4 mr-2" />
                  Sold
                </div>
                <div className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
                  {formatPrice(car.soldPrice)}
                </div>
              </div>
            )}
          </div>
          
          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="mt-2 mb-3 border border-destructive/20 rounded-lg p-3 bg-destructive/10">
              <p className="text-sm text-destructive mb-3 font-medium">Are you sure you want to delete this car?</p>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={cancelDelete}
                  className="text-xs h-7 px-3"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={confirmDelete}
                  className="text-xs h-7 px-3"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
          
          {/* Action Section */}
          <div className="flex items-center justify-between pt-4 border-t border-border/20">
            {/* Status Badge */}
            {calculatedProfit !== undefined && car.status === 'sold' ? (
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                calculatedProfit >= 0 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
              }`}>
                <TrendingUpIcon className="h-4 w-4 mr-1.5" />
                {calculatedProfit >= 0 ? 'Profit' : 'Loss'}: {formatPrice(Math.abs(calculatedProfit))}
              </div>
            ) : potentialProfit !== undefined ? (
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                potentialProfit >= 0 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
              }`}>
                <TrendingUpIcon className="h-4 w-4 mr-1.5" />
                Potential: {formatPrice(Math.abs(potentialProfit))}
              </div>
            ) : car.status === 'purchased' ? (
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <BanknoteIcon className="h-4 w-4 mr-1.5" />
                Just Added
              </div>
            ) : (
              <div></div>
            )}
            
            {/* View Button */}
            <Button 
              onClick={openDetailModal}
              variant="default"
              size="sm"
              className="font-medium"
            >
              <EyeIcon className="h-4 w-4 mr-1.5" />
              Explore
            </Button>
          </div>
          
          {/* Expandable costs and profit section */}
          <div className="mt-3">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between py-2 px-3 text-xs font-medium text-muted-foreground bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border"
            >
              Costs & Profit Details
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </button>
            
            {showDetails && (
              <div className="mt-2 text-xs border rounded-lg p-3 space-y-2 bg-card shadow-sm">
                {/* Costs section */}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Purchase Price:</span>
                  <span className="text-foreground font-medium">{formatPrice(car.purchasePrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Recovery:</span>
                  <span className="text-foreground font-medium">{formatPrice(car.recoveryPrice)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Fuel:</span>
                  <span className="text-foreground font-medium">{formatPrice(car.fuelCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Insurance:</span>
                  <span className="text-foreground font-medium">{formatPrice(car.insuranceCost)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Repairs:</span>
                  <span className="text-foreground font-medium">{formatPrice(totalRepairCost)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-foreground">Total Costs:</span>
                    <span className="text-foreground">{formatPrice(totalCost)}</span>
                  </div>
                  
                  {/* Listed price (if applicable) */}
                  {car.status === 'listed' && (
                    <>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-warning">Listed Price:</span>
                        <span className="text-foreground font-medium">{formatPrice(car.salePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t">
                        <span className={potentialProfit && potentialProfit >= 0 ? "text-success" : "text-destructive"}>
                          Potential Profit:
                        </span>
                        <span className={potentialProfit && potentialProfit >= 0 ? "text-success" : "text-destructive"}>
                          {formatPrice(potentialProfit)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {/* Sold details (if applicable) */}
                  {car.status === 'sold' && car.soldPrice && (
                    <>
                      <div className="flex justify-between text-xs pt-1">
                        <span className="text-muted-foreground">Sold Price:</span>
                        <span className="text-foreground font-medium">{formatPrice(car.soldPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-2 mt-2 border-t">
                        <span className={calculatedProfit && calculatedProfit >= 0 ? "text-success" : "text-destructive"}>
                          Actual Profit:
                        </span>
                        <span className={calculatedProfit && calculatedProfit >= 0 ? "text-success" : "text-destructive"}>
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