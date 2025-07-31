'use client'

import React, { useState, useEffect } from 'react'
import { useBooking } from '../../context/BookingContext'

const cityOptions = [
  { 
    value: 'madrid', 
    label: 'Madrid',
    gradient: 'from-slate-700 via-slate-600 to-slate-800',
    accent: 'hover:from-slate-600 hover:via-slate-500 hover:to-slate-700'
  },
  { 
    value: 'barcelona', 
    label: 'Barcelona',
    gradient: 'from-emerald-600 via-emerald-500 to-emerald-700',
    accent: 'hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-600'
  },
  { 
    value: 'malaga', 
    label: 'Málaga',
    gradient: 'from-amber-600 via-amber-500 to-amber-700',
    accent: 'hover:from-amber-500 hover:via-amber-400 hover:to-amber-600'
  },
  { 
    value: 'valencia', 
    label: 'Valencia',
    gradient: 'from-blue-600 via-blue-500 to-blue-700',
    accent: 'hover:from-blue-500 hover:via-blue-400 hover:to-blue-600'
  },
  { 
    value: 'alicante', 
    label: 'Alicante',
    gradient: 'from-orange-600 via-orange-500 to-orange-700',
    accent: 'hover:from-orange-500 hover:via-orange-400 hover:to-orange-600'
  },
  { 
    value: 'bilbao', 
    label: 'Bilbao',
    gradient: 'from-red-600 via-red-500 to-red-700',
    accent: 'hover:from-red-500 hover:via-red-400 hover:to-red-600'
  },
]

export default function DepartureCity() {
  const { formData, updateFormData, nextStep } = useBooking()
  const [selectedCity, setSelectedCity] = useState<string>(formData.selectedCity)

  // Update local state when context data changes
  useEffect(() => {
    setSelectedCity(formData.selectedCity)
  }, [formData.selectedCity])

  const handleCitySelect = (value: string) => {
    setSelectedCity(value)
    // Save to context and localStorage immediately on change
    updateFormData({ selectedCity: value })
  }

  const handleNext = () => {
    if (selectedCity) {
      console.log('Selected city:', selectedCity)
      nextStep()
    }
  }

  return (
    <div className="w-full max-w-[894px] h-[638px] p-6 bg-[#F1F9EC] rounded-xl border border-lime-500/20 mb-10">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-10">
          Departure city
        </h1>
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-between h-[calc(100%-80px)]">
        {/* Cities Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {cityOptions.map((city) => (
            <div
              key={city.value}
              onClick={() => handleCitySelect(city.value)}
              className={`
                relative h-[140px] rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105
                bg-gradient-to-br ${city.gradient} ${city.accent}
                ${selectedCity === city.value 
                  ? 'ring-4 ring-lime-400 ring-opacity-60 shadow-lg shadow-lime-200' 
                  : 'hover:shadow-xl'
                }
              `}
            >
              {/* City Name Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-white text-lg font-semibold font-['Poppins'] text-center drop-shadow-lg">
                  {city.label}
                </h3>
              </div>

              {/* Selected Indicator */}
              {selectedCity === city.value && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-4 h-4 text-white" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              )}

              {/* Decorative Pattern Overlay */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute top-8 right-6 w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="absolute bottom-4 right-4 w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!selectedCity}
          className={`
            w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] flex justify-center items-center transition-all
            ${selectedCity 
              ? 'bg-[#76C043] hover:bg-lime-600 cursor-pointer' 
              : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          <span className={`text-base font-['Inter'] ${selectedCity ? 'text-white' : 'text-gray-500'}`}>
            Next
          </span>
        </button>
      </div>
    </div>
  )
}
