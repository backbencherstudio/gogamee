'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { IoChevronDown } from 'react-icons/io5'
import { useBooking } from '../../context/BookingContext'

// Types
interface PackageOption {
  readonly value: string
  readonly label: string
}

interface PackageFormData {
  selectedPackage: string
}

// Constants
const PACKAGE_OPTIONS: readonly PackageOption[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'vip', label: 'VIP Experience' },
  { value: 'luxury', label: 'Luxury Package' },
] as const

const PackageType: React.FC = () => {
  // Context
  const { formData, updateFormData, nextStep } = useBooking()
  
  // Local state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)
  
  // React Hook Form
  const { control, handleSubmit, watch, setValue } = useForm<PackageFormData>({
    defaultValues: {
      selectedPackage: formData.selectedPackage || ''
    }
  })
  
  const selectedPackage = watch('selectedPackage')
  
  // Sync with context when context data changes
  useEffect(() => {
    if (formData.selectedPackage !== selectedPackage) {
      setValue('selectedPackage', formData.selectedPackage)
    }
  }, [formData.selectedPackage, selectedPackage, setValue])
  
  // Memoized values
  const selectedLabel = useMemo(() => 
    PACKAGE_OPTIONS.find(pkg => pkg.value === selectedPackage)?.label || 'Select a package',
    [selectedPackage]
  )
  
  // Event handlers
  const handleDropdownToggle = useCallback(() => {
    setIsDropdownOpen(prev => !prev)
  }, [])
  
  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false)
  }, [])
  
  const handlePackageSelect = useCallback((value: string) => {
    setValue('selectedPackage', value)
    updateFormData({ selectedPackage: value })
    setIsDropdownOpen(false)
  }, [setValue, updateFormData])
  
  const onSubmit = useCallback((data: PackageFormData) => {
    updateFormData({ selectedPackage: data.selectedPackage })
    nextStep()
  }, [updateFormData, nextStep])
  
  const renderDropdownOption = useCallback((pkg: PackageOption, index: number) => {
    const isFirst = index === 0
    const isLast = index === PACKAGE_OPTIONS.length - 1
    const isSelected = selectedPackage === pkg.value
    
    return (
      <div
        key={pkg.value}
        onClick={() => handlePackageSelect(pkg.value)}
        className={`
          px-5 py-3 cursor-pointer hover:bg-gray-50 transition-all
          ${isSelected ? 'bg-lime-50 text-lime-700' : 'text-zinc-950'}
          ${isFirst ? 'rounded-t-lg' : ''}
          ${isLast ? 'rounded-b-lg' : ''}
        `}
        role="option"
        aria-selected={isSelected}
      >
        <span className="text-sm font-['Poppins']">
          {pkg.label}
        </span>
      </div>
    )
  }, [selectedPackage, handlePackageSelect])
  
  return (
    <div className="w-full max-w-[894px] h-[638px] p-6 bg-[#F1F9EC] rounded-xl border border-lime-500/20 mb-10">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-10">
          How do you want to experience it?
        </h1>
      </header>

      {/* Content Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-between h-[calc(100%-80px)]">
        {/* Dropdown Section */}
        <div className="relative">
          <Controller
            name="selectedPackage"
            control={control}
            render={({ field }) => (
              <div
                {...field}
                onClick={handleDropdownToggle}
                className="w-full max-w-96 h-11 px-5 py-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all"
                role="combobox"
                aria-expanded={isDropdownOpen}
                aria-controls="package-listbox"
                aria-haspopup="listbox"
                aria-label="Package selection"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleDropdownToggle()
                  }
                }}
              >
                <span className="text-sm text-zinc-950 font-['Poppins']">
                  {selectedLabel}
                </span>
                <IoChevronDown 
                  className={`w-5 h-5 text-zinc-950 transition-transform duration-200 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  aria-hidden="true"
                />
              </div>
            )}
          />

          {/* Dropdown Options */}
          {isDropdownOpen && (
            <div 
              id="package-listbox"
              className="absolute top-12 left-0 w-full max-w-96 bg-white rounded-lg border border-gray-200 shadow-lg z-10"
              role="listbox"
              aria-label="Package options"
            >
              {PACKAGE_OPTIONS.map(renderDropdownOption)}
            </div>
          )}
        </div>

        {/* Next Button */}
        <button
          type="submit"
          className="w-44 h-11 px-3.5 py-1.5 bg-[#76C043] hover:bg-lime-600 rounded backdrop-blur-[5px] flex justify-center items-center transition-all focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2"
          aria-label="Proceed to next step"
        >
          <span className="text-base text-white font-['Inter']">Next</span>
        </button>
      </form>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={handleDropdownClose}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

export default PackageType
