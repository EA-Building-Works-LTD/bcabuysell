'use client';

import { ICar } from '@/models/Car';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import Image from 'next/image';
import { authFetch } from '@/lib/fetch-utils';

interface CarEditModalProps {
  car: ICar;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCar: ICar) => void;
}

// Define a simpler type for the form data
interface CarFormData {
  _id?: string;
  makeModel: string;
  auctionSource: string;
  regNumber?: string;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  color?: string;
  mot?: string;
  purchasePrice: number;
  recoveryPrice: number;
  fuelCost: number;
  insuranceCost: number;
  salePrice: number;
  soldPrice?: number;
  notes?: string;
  purchaseDate: Date | string;
  soldDate?: Date | string;
  status: 'purchased' | 'listed' | 'sold';
  imageUrl?: string;
  repairs: Array<{
    type: string;
    cost: number;
    description?: string;
  }>;
}

export default function CarEditModal({ car, isOpen, onClose, onSave }: CarEditModalProps) {
  // Create a simplified version of the car for the form
  const simplifyCarData = (car: ICar): CarFormData => {
    return {
      _id: car._id?.toString(),
      makeModel: car.makeModel,
      auctionSource: car.auctionSource,
      regNumber: car.regNumber,
      mileage: car.mileage,
      fuelType: car.fuelType,
      transmission: car.transmission,
      color: car.color,
      mot: car.mot,
      purchasePrice: car.purchasePrice,
      recoveryPrice: car.recoveryPrice,
      fuelCost: car.fuelCost,
      insuranceCost: car.insuranceCost,
      salePrice: car.salePrice,
      soldPrice: car.soldPrice,
      notes: car.notes,
      purchaseDate: car.purchaseDate,
      soldDate: car.soldDate,
      status: car.status,
      imageUrl: car.imageUrl,
      repairs: car.repairs?.map(repair => ({
        type: repair.type,
        cost: repair.cost,
        description: repair.description
      })) || []
    };
  };

  const [formData, setFormData] = useState<CarFormData>(simplifyCarData(car));
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Update form data when car changes
  useEffect(() => {
    setFormData(simplifyCarData(car));
    // Set image preview if there's an image URL
    setImagePreview(car.imageUrl || null);
    // Reset selected file when car changes
    setSelectedFile(null);
  }, [car]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (['purchasePrice', 'recoveryPrice', 'fuelCost', 'insuranceCost', 'salePrice', 'soldPrice', 'mileage'].includes(name)) {
      setFormData({
        ...formData,
        [name]: value ? parseFloat(value) : 0,
      });
    } 
    // Auto-capitalize registration number
    else if (name === 'regNumber') {
      setFormData({
        ...formData,
        [name]: value.toUpperCase(),
      });
    }
    else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('File selected:', file.name, file.type, file.size);
    setSelectedFile(file);

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const preview = reader.result as string;
      console.log('Preview created, length:', preview.length);
      setImagePreview(preview);
    };
    reader.readAsDataURL(file);
  };

  // Handle file removal
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Form submission started');
      // Handle image upload if there's a new image
      let imageUrl = formData.imageUrl;
      if (imagePreview && imagePreview.startsWith('data:') && selectedFile) {
        console.log('New image detected, preparing to upload');
        // Create form data for the image
        const imageFormData = new FormData();
        
        // Use the saved selectedFile instead of trying to access through fileInputRef
        console.log('Uploading file:', selectedFile.name, selectedFile.type, selectedFile.size);
        imageFormData.append('file', selectedFile);
        
        // Upload the image - debug approach
        console.log('Sending upload request to /api/upload');
        console.log('FormData details:', {
          hasFile: imageFormData.has('file'),
          entries: Array.from(imageFormData.entries()).map(([key, value]) => 
            [key, value instanceof File ? `File: ${value.name}` : value]
          )
        });
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
        });
        
        console.log('Upload response status:', uploadResponse.status);
        
        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          console.error('Upload error:', errorData);
          throw new Error('Failed to upload image: ' + (errorData.error || 'Unknown error'));
        }
        
        const uploadData = await uploadResponse.json();
        console.log('Upload successful, image URL:', uploadData.url);
        imageUrl = uploadData.url;
      } else {
        console.log('No new image to upload, using existing URL:', imageUrl);
      }
      
      // Prepare data with the image URL
      const carToSubmit = {
        ...formData,
        imageUrl
      };
      
      console.log('Submitting car data with imageUrl:', imageUrl);
      
      const response = await authFetch(`/api/cars/${car._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carToSubmit),
      });
      
      console.log('Car update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Car update error:', errorData);
        throw new Error('Failed to update car: ' + (errorData.message || 'Unknown error'));
      }
      
      const responseData = await response.json();
      console.log('Car update successful, response:', responseData);
      
      toast.success('Car updated successfully');
      onSave(responseData.car || responseData.data);
    } catch (error) {
      console.error('Error updating car:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update car');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit {car.makeModel}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Image Upload Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium pb-1 border-b border-gray-200 dark:border-gray-700">Car Image</h3>
            
            <div className="space-y-2">
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                  <Image 
                    src={imagePreview} 
                    alt="Car preview" 
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                    unoptimized={true}
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    onClick={handleRemoveImage}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Upload a car image
                    </p>
                  </div>
                  <input
                    type="file"
                    className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/20 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30 mt-2"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Basic Info Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium pb-1 border-b border-gray-200 dark:border-gray-700">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="makeModel">Make & Model</Label>
                <Input
                  id="makeModel"
                  name="makeModel"
                  value={formData.makeModel || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="regNumber">Registration</Label>
                <Input
                  id="regNumber"
                  name="regNumber"
                  value={formData.regNumber || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="mileage">Mileage</Label>
                <Input
                  id="mileage"
                  name="mileage"
                  type="number"
                  value={formData.mileage || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="auctionSource">Source</Label>
                <Input
                  id="auctionSource"
                  name="auctionSource"
                  value={formData.auctionSource || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          {/* Features Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium pb-1 border-b border-gray-200 dark:border-gray-700">Features</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="transmission">Transmission</Label>
                <Select 
                  value={formData.transmission || ''} 
                  onValueChange={(value: string) => handleSelectChange('transmission', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manual">Manual</SelectItem>
                    <SelectItem value="Automatic">Automatic</SelectItem>
                    <SelectItem value="Semi-Auto">Semi-Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select 
                  value={formData.fuelType || ''} 
                  onValueChange={(value: string) => handleSelectChange('fuelType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Petrol">Petrol</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="mot">MOT</Label>
                <Input
                  id="mot"
                  name="mot"
                  value={formData.mot || ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          {/* Financial Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium pb-1 border-b border-gray-200 dark:border-gray-700">Financial Details</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="purchasePrice">Purchase Price (£)</Label>
                <Input
                  id="purchasePrice"
                  name="purchasePrice"
                  type="number"
                  value={formData.purchasePrice || 0}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="recoveryPrice">Recovery Cost (£)</Label>
                <Input
                  id="recoveryPrice"
                  name="recoveryPrice"
                  type="number"
                  value={formData.recoveryPrice || 0}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="fuelCost">Fuel Cost (£)</Label>
                <Input
                  id="fuelCost"
                  name="fuelCost"
                  type="number"
                  value={formData.fuelCost || 0}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="insuranceCost">Insurance Cost (£)</Label>
                <Input
                  id="insuranceCost"
                  name="insuranceCost"
                  type="number"
                  value={formData.insuranceCost || 0}
                  onChange={handleInputChange}
                />
              </div>
              
              {formData.status === 'listed' && (
                <div className="space-y-1">
                  <Label htmlFor="salePrice">Listed Price (£)</Label>
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    value={formData.salePrice || 0}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              
              {formData.status === 'sold' && (
                <div className="space-y-1">
                  <Label htmlFor="soldPrice">Sold Price (£)</Label>
                  <Input
                    id="soldPrice"
                    name="soldPrice"
                    type="number"
                    value={formData.soldPrice || 0}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Status Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium pb-1 border-b border-gray-200 dark:border-gray-700">Status</h3>
            
            <div className="space-y-1">
              <Label htmlFor="status">Current Status</Label>
              <Select 
                value={formData.status || 'purchased'} 
                onValueChange={(value: string) => handleSelectChange('status', value as 'purchased' | 'listed' | 'sold')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchased">Recently Purchased</SelectItem>
                  <SelectItem value="listed">Listed for Sale</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button variant="outline" type="button" onClick={onClose} className="mr-2">Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 