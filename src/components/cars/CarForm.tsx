'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ICar } from '@/models/Car';
import Image from 'next/image';
import { FIXED_USERS } from '@/types/users';

interface RepairField {
  type: string;
  cost: number;
  description?: string;
}

interface CarFormProps {
  carData?: Partial<ICar>;
  isEdit?: boolean;
  isInModal?: boolean;
  onSuccess?: () => void;
}

// Update the input field class throughout the form
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";

export default function CarForm({ carData, isEdit = false, isInModal = false, onSuccess }: CarFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repairs, setRepairs] = useState<RepairField[]>([{ type: '', cost: 0 }]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    makeModel: '',
    auctionSource: '',
    regNumber: '',
    mileage: 0,
    fuelType: '',
    transmission: '',
    color: '',
    mot: '',
    purchasePrice: 0,
    recoveryPrice: 0,
    fuelCost: 0,
    insuranceCost: 0,
    salePrice: 0,
    soldPrice: 0,
    notes: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    soldDate: '',
    imageUrl: '',
    status: 'purchased',
    owner: 'Ehsaan', // Default owner
  });

  // If editing, load the car data
  useEffect(() => {
    if (carData) {
      setFormData({
        makeModel: carData.makeModel || '',
        auctionSource: carData.auctionSource || '',
        regNumber: carData.regNumber || '',
        mileage: carData.mileage || 0,
        fuelType: carData.fuelType || '',
        transmission: carData.transmission || '',
        color: carData.color || '',
        mot: carData.mot || '',
        purchasePrice: carData.purchasePrice || 0,
        recoveryPrice: carData.recoveryPrice || 0,
        fuelCost: carData.fuelCost || 0,
        insuranceCost: carData.insuranceCost || 0,
        salePrice: carData.salePrice || 0,
        soldPrice: carData.soldPrice || 0,
        notes: carData.notes || '',
        purchaseDate: carData.purchaseDate ? new Date(carData.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        soldDate: carData.soldDate ? new Date(carData.soldDate).toISOString().split('T')[0] : '',
        imageUrl: carData.imageUrl || '',
        status: carData.status || 'purchased',
        owner: carData.owner || 'Ehsaan',
      });
      
      // Set image preview if there's an image URL
      if (carData.imageUrl) {
        setImagePreview(carData.imageUrl);
      }
      
      if (carData.repairs && carData.repairs.length > 0) {
        setRepairs(carData.repairs.map(repair => ({
          type: repair.type,
          cost: repair.cost,
          description: repair.description
        })));
      }
    }
  }, [carData]);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: ['purchasePrice', 'recoveryPrice', 'fuelCost', 'insuranceCost', 'salePrice', 'soldPrice', 'mileage'].includes(name)
        ? parseFloat(value) || 0
        : name === 'regNumber' 
          ? value.toUpperCase() 
          : value
    }));
  };
  
  // Handle repair field changes
  const handleRepairChange = (index: number, field: string, value: string) => {
    const updatedRepairs = [...repairs];
    
    if (field === 'cost') {
      updatedRepairs[index] = {
        ...updatedRepairs[index],
        [field]: parseFloat(value) || 0
      };
    } else {
      updatedRepairs[index] = {
        ...updatedRepairs[index],
        [field]: value
      };
    }
    
    setRepairs(updatedRepairs);
  };
  
  // Add a new repair field
  const addRepairField = () => {
    setRepairs([...repairs, { type: '', cost: 0 }]);
  };
  
  // Remove a repair field
  const removeRepairField = (index: number) => {
    if (repairs.length > 1) {
      const updatedRepairs = [...repairs];
      updatedRepairs.splice(index, 1);
      setRepairs(updatedRepairs);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle file removal
  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    // Validate form
    if (!formData.makeModel || !formData.auctionSource || !formData.purchaseDate) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    // Validate repairs
    const validRepairs = repairs.filter(repair => repair.type && repair.cost > 0);
    
    try {
      // Handle image upload if there's a new image
      let imageUrl = formData.imageUrl;
      if (imagePreview && imagePreview.startsWith('data:')) {
        // Create form data for the image
        const imageFormData = new FormData();
        const fileInput = fileInputRef.current;
        
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
          imageFormData.append('file', fileInput.files[0]);
          
          // Upload the image
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: imageFormData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
          }
          
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        }
      }
      
      // Prepare the data
      const carToSubmit = {
        ...formData,
        imageUrl,
        repairs: validRepairs,
      };
      
      // API request configuration
      const url = isEdit && carData?._id 
        ? `/api/cars/${carData._id}` 
        : '/api/cars';
      
      const method = isEdit ? 'PUT' : 'POST';
      
      // Make the API request
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carToSubmit),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save car');
      }
      
      // Call onSuccess if provided (for modal)
      if (onSuccess) {
        onSuccess();
      } else {
        // Otherwise, redirect to the cars listing page
        router.push('/cars');
        router.refresh();
      }
    } catch (err: any) {
      console.error('Error saving car:', err);
      setError(err.message || 'An error occurred while saving the car');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Car Details Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">Car Details</h2>
          
          {/* Car Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Car Image
            </label>
            <div className="space-y-2">
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                  <Image 
                    src={imagePreview} 
                    alt="Car preview" 
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
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
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Upload a car image (PNG, JPG, JPEG)
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
          
          {/* Owner Selection */}
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Owner <span className="text-red-500">*</span>
            </label>
            <select
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              required
              className={inputClass}
            >
              {FIXED_USERS.map((user) => (
                <option key={user} value={user}>
                  {user}
                </option>
              ))}
            </select>
          </div>
          
          {/* Make/Model */}
          <div>
            <label htmlFor="makeModel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Make/Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="makeModel"
              name="makeModel"
              value={formData.makeModel}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          
          {/* Registration Number */}
          <div>
            <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Registration Number
            </label>
            <input
              type="text"
              id="regNumber"
              name="regNumber"
              value={formData.regNumber}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          
          {/* Mileage */}
          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Mileage
            </label>
            <input
              type="number"
              id="mileage"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          
          {/* Fuel Type */}
          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fuel Type
            </label>
            <select
              id="fuelType"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select fuel type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
              <option value="LPG">LPG</option>
            </select>
          </div>
          
          {/* Transmission */}
          <div>
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Transmission
            </label>
            <select
              id="transmission"
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Select transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
              <option value="Semi-Automatic">Semi-Automatic</option>
              <option value="CVT">CVT</option>
            </select>
          </div>
          
          {/* Color */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color
            </label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          
          {/* MOT */}
          <div>
            <label htmlFor="mot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              MOT Expiry
            </label>
            <input
              type="text"
              id="mot"
              name="mot"
              value={formData.mot}
              onChange={handleChange}
              placeholder="e.g. 04/2025"
              className={inputClass}
            />
          </div>
          
          {/* Auction Source */}
          <div>
            <label htmlFor="auctionSource" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Auction Source <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="auctionSource"
              name="auctionSource"
              value={formData.auctionSource}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          
          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="purchased">Purchased</option>
              <option value="listed">Listed</option>
              <option value="sold">Sold</option>
            </select>
          </div>
          
          {/* Purchase Date */}
          <div>
            <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purchase Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          
          {/* Sold Date (conditionally rendered) */}
          {formData.status === 'sold' && (
            <div>
              <label htmlFor="soldDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sold Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="soldDate"
                name="soldDate"
                value={formData.soldDate}
                onChange={handleChange}
                required={formData.status === 'sold'}
                className={inputClass}
              />
            </div>
          )}
        </div>
        
        {/* Costs Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-700 pb-2">Costs</h2>
          
          {/* Purchase Price */}
          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Purchase Price (£) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="purchasePrice"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          
          {/* Recovery Price */}
          <div>
            <label htmlFor="recoveryPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Recovery Cost (£) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="recoveryPrice"
              name="recoveryPrice"
              value={formData.recoveryPrice}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          
          {/* Fuel Cost */}
          <div>
            <label htmlFor="fuelCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fuel Cost (£) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="fuelCost"
              name="fuelCost"
              value={formData.fuelCost}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          
          {/* Insurance Cost */}
          <div>
            <label htmlFor="insuranceCost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Insurance Cost (£) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="insuranceCost"
              name="insuranceCost"
              value={formData.insuranceCost}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          
          {/* Sale Price */}
          <div>
            <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Sale Price (Listed) (£) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              id="salePrice"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>
          
          {/* Sold Price (conditionally rendered) */}
          {formData.status === 'sold' && (
            <div>
              <label htmlFor="soldPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sold Price (Final) (£) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id="soldPrice"
                name="soldPrice"
                value={formData.soldPrice}
                onChange={handleChange}
                required={formData.status === 'sold'}
                className={inputClass}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Repairs Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Repair Costs</h2>
          <button
            type="button"
            onClick={addRepairField}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded-md flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Repair
          </button>
        </div>
        
        {repairs.map((repair, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md mb-4">
            {/* Repair Type */}
            <div className="md:col-span-5">
              <label htmlFor={`repair-type-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Repair Type
              </label>
              <input
                type="text"
                id={`repair-type-${index}`}
                value={repair.type}
                onChange={(e) => handleRepairChange(index, 'type', e.target.value)}
                className={inputClass}
              />
            </div>
            
            {/* Repair Cost */}
            <div className="md:col-span-3">
              <label htmlFor={`repair-cost-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost (£)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                id={`repair-cost-${index}`}
                value={repair.cost}
                onChange={(e) => handleRepairChange(index, 'cost', e.target.value)}
                className={inputClass}
              />
            </div>
            
            {/* Description */}
            <div className="md:col-span-3">
              <label htmlFor={`repair-description-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                id={`repair-description-${index}`}
                value={repair.description || ''}
                onChange={(e) => handleRepairChange(index, 'description', e.target.value)}
                className={inputClass}
              />
            </div>
            
            {/* Remove Button */}
            <div className="md:col-span-1 flex items-end justify-center">
              <button
                type="button"
                onClick={() => removeRepairField(index)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2"
                disabled={repairs.length <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Notes Section */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className={inputClass}
        />
      </div>
      
      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            `${isEdit ? 'Update' : 'Add'} Car`
          )}
        </button>
      </div>
    </form>
  );
} 