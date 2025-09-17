'use client'
import React, { useState } from 'react'
import { Save, X } from 'lucide-react'

interface PackageData {
  sport: 'football' | 'basketball';
  category: string;
  standard: string;
  premium: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
}

interface AddPackageProps {
  onSubmit: (packageData: PackageData) => void;
  onCancel: () => void;
  initialData?: PackageData;
  submitLabel?: string;
  showSport?: boolean;
}

export default function AddPackage({ onSubmit, onCancel, initialData, submitLabel, showSport }: AddPackageProps) {
  const [formData, setFormData] = useState<PackageData>(
    initialData || {
      sport: 'football',
      category: '',
      standard: '',
      premium: '',
      standardPrice: 0,
      premiumPrice: 0,
      currency: 'EUR'
    }
  );

  const [errors, setErrors] = useState<Partial<PackageData>>({});

  const handleInputChange = (field: keyof PackageData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PackageData> = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!formData.standard.trim()) {
      newErrors.standard = 'Standard package description is required';
    }
    if (!formData.premium.trim()) {
      newErrors.premium = 'Premium package description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sport Selection (optional) */}
      {showSport !== false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
            Sport *
          </label>
          <div className="flex gap-4">
            {[
              { value: 'football', label: 'Football' },
              { value: 'basketball', label: 'Basketball' }
            ].map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="sport"
                  value={option.value}
                  checked={formData.sport === option.value}
                  onChange={(e) => handleInputChange('sport', e.target.value as 'football' | 'basketball')}
                  className="mr-2 text-[#76C043] focus:ring-[#76C043]"
                />
                <span className="text-gray-700 font-['Poppins']">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Category *
        </label>
        <input
          type="text"
          id="category"
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          placeholder="e.g., Match Ticket, Hotel, Flights..."
          className={`w-full px-4 py-3 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors ${
            errors.category ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.category && (
          <p className="mt-1 text-sm text-red-600 font-['Poppins']">{errors.category}</p>
        )}
      </div>

      {/* Standard Package */}
      <div>
        <label htmlFor="standard" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Standard Package Description *
        </label>
        <textarea
          id="standard"
          value={formData.standard}
          onChange={(e) => handleInputChange('standard', e.target.value)}
          placeholder="Describe what's included in the standard package..."
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors resize-vertical ${
            errors.standard ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.standard && (
          <p className="mt-1 text-sm text-red-600 font-['Poppins']">{errors.standard}</p>
        )}
      </div>

      {/* Premium Package */}
      <div>
        <label htmlFor="premium" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Premium Package Description *
        </label>
        <textarea
          id="premium"
          value={formData.premium}
          onChange={(e) => handleInputChange('premium', e.target.value)}
          placeholder="Describe what's included in the premium package..."
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors resize-vertical ${
            errors.premium ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.premium && (
          <p className="mt-1 text-sm text-red-600 font-['Poppins']">{errors.premium}</p>
        )}
      </div>

      {/* Currency Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Currency *
        </label>
        <select
          value={formData.currency}
          onChange={(e) => handleInputChange('currency', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors"
        >
          <option value="EUR">EUR (€)</option>
          <option value="USD">USD ($)</option>
          <option value="GBP">GBP (£)</option>
        </select>
      </div>

      {/* Standard Price */}
      <div>
        <label htmlFor="standardPrice" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Standard Package Price *
        </label>
        <div className="relative">
          <input
            type="number"
            id="standardPrice"
            min="0"
            step="0.01"
            value={formData.standardPrice}
            onChange={(e) => handleInputChange('standardPrice', parseFloat(e.target.value) || 0)}
            placeholder="Enter standard package price"
            className={`w-full px-4 py-3 pr-12 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors ${
              errors.standardPrice ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-['Poppins']">
            {formData.currency === 'EUR' ? '€' : formData.currency === 'USD' ? '$' : '£'}
          </span>
        </div>
        {errors.standardPrice && (
          <p className="mt-1 text-sm text-red-600 font-['Poppins']">{errors.standardPrice}</p>
        )}
      </div>

      {/* Premium Price */}
      <div>
        <label htmlFor="premiumPrice" className="block text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
          Premium Package Price *
        </label>
        <div className="relative">
          <input
            type="number"
            id="premiumPrice"
            min="0"
            step="0.01"
            value={formData.premiumPrice}
            onChange={(e) => handleInputChange('premiumPrice', parseFloat(e.target.value) || 0)}
            placeholder="Enter premium package price"
            className={`w-full px-4 py-3 pr-12 border rounded-lg font-['Poppins'] focus:outline-none focus:ring-2 focus:ring-[#76C043]/20 focus:border-[#76C043] transition-colors ${
              errors.premiumPrice ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-['Poppins']">
            {formData.currency === 'EUR' ? '€' : formData.currency === 'USD' ? '$' : '£'}
          </span>
        </div>
        {errors.premiumPrice && (
          <p className="mt-1 text-sm text-red-600 font-['Poppins']">{errors.premiumPrice}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Save className="w-4 h-4" />
          {submitLabel || 'Add Package'}
        </button>
      </div>
    </form>
  );
}
