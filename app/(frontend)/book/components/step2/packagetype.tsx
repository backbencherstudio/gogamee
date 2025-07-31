'use client'

import React, { useState, useEffect } from 'react'
import { IoChevronDown } from 'react-icons/io5'
import { useBooking } from '../../context/BookingContext'

const packageOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'deluxe', label: 'Deluxe' },
  { value: 'vip', label: 'VIP Experience' },
  { value: 'luxury', label: 'Luxury Package' },
]

export default function PackageType() {
  const { formData, updateFormData, nextStep } = useBooking()
  const [selectedPackage, setSelectedPackage] = useState<string>(formData.selectedPackage)
  const [isOpen, setIsOpen] = useState(false)

  // Update local state when context data changes
  useEffect(() => {
    setSelectedPackage(formData.selectedPackage)
  }, [formData.selectedPackage])

  const handlePackageSelect = (value: string) => {
    setSelectedPackage(value)
    setIsOpen(false)
    // Save to context and localStorage immediately on change
    updateFormData({ selectedPackage: value })
  }

  const handleNext = () => {
    console.log('Selected package:', selectedPackage)
    nextStep()
  }

  const selectedLabel = packageOptions.find(pkg => pkg.value === selectedPackage)?.label || 'Select a package'

  return (
    <div className="w-full max-w-[894px] h-[638px] p-6 bg-[#F1F9EC] rounded-xl border border-lime-500/20 mb-10">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-10">
          How do you want to experience it?
        </h1>
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-between h-[calc(100%-80px)]">
        {/* Dropdown Section */}
        <div className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full max-w-96 h-11 px-5 py-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all"
          >
            <span className="text-sm text-zinc-950 font-['Poppins']">
              {selectedLabel}
            </span>
            <IoChevronDown 
              className={`w-5 h-5 text-zinc-950 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>

          {/* Dropdown Options */}
          {isOpen && (
            <div className="absolute top-12 left-0 w-full max-w-96 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
              {packageOptions.map((pkg) => (
                <div
                  key={pkg.value}
                  onClick={() => handlePackageSelect(pkg.value)}
                  className={`
                    px-5 py-3 cursor-pointer hover:bg-gray-50 transition-all
                    ${selectedPackage === pkg.value ? 'bg-lime-50 text-lime-700' : 'text-zinc-950'}
                    ${pkg.value === packageOptions[0].value ? 'rounded-t-lg' : ''}
                    ${pkg.value === packageOptions[packageOptions.length - 1].value ? 'rounded-b-lg' : ''}
                  `}
                >
                  <span className="text-sm font-['Poppins']">
                    {pkg.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-44 h-11 px-3.5 py-1.5 bg-[#76C043] hover:bg-lime-600 rounded backdrop-blur-[5px] flex justify-center items-center transition-all"
        >
          <span className="text-base text-white font-['Inter']">Next</span>
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
