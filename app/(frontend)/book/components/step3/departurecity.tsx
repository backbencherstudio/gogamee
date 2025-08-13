'use client'

import React, { useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useBooking } from '../../context/BookingContext'

// Types
interface CityOption {
  value: string
  label: string
  gradient: string
  accent: string
}

interface FormData {
  selectedCity: string
}

// Constants
const CITY_OPTIONS: readonly CityOption[] = [
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
] as const

// Components
const CheckIcon: React.FC = React.memo(() => (
  <svg 
    className="w-4 h-4 text-white" 
    fill="currentColor" 
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path 
      fillRule="evenodd" 
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
      clipRule="evenodd" 
    />
  </svg>
))

CheckIcon.displayName = 'CheckIcon'

const DecorativePattern: React.FC = React.memo(() => (
  <div className="absolute inset-0 opacity-20" aria-hidden="true">
    <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full" />
    <div className="absolute top-8 right-6 w-1 h-1 bg-white rounded-full" />
    <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white rounded-full" />
    <div className="absolute bottom-4 right-4 w-1 h-1 bg-white rounded-full" />
  </div>
))

DecorativePattern.displayName = 'DecorativePattern'

interface CityCardProps {
  city: CityOption
  isSelected: boolean
  onSelect: (value: string) => void
}

const CityCard: React.FC<CityCardProps> = React.memo(({ city, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(city.value)
  }, [city.value, onSelect])

  const cardClassName = useMemo(() => `
    relative h-[120px] xl:h-[140px] rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105
    bg-gradient-to-br ${city.gradient} ${city.accent}
    ${isSelected 
      ? 'ring-4 ring-lime-400 ring-opacity-60 shadow-lg shadow-lime-200' 
      : 'hover:shadow-xl'
    }
  `, [city.gradient, city.accent, isSelected])

  return (
    <div
      onClick={handleClick}
      className={cardClassName}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${city.label} as departure city`}
    >
      {/* City Name Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h3 className="text-white text-base xl:text-lg font-semibold font-['Poppins'] text-center drop-shadow-lg">
          {city.label}
        </h3>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center">
          <CheckIcon />
        </div>
      )}

      {/* Decorative Pattern Overlay */}
      <DecorativePattern />
    </div>
  )
})

CityCard.displayName = 'CityCard'

const DepartureCity: React.FC = () => {
  const { formData, updateFormData, nextStep } = useBooking()
  
  const { control, watch, handleSubmit } = useForm<FormData>({
    defaultValues: {
      selectedCity: formData.selectedCity || ''
    }
  })

  const selectedCity = watch('selectedCity')

  const handleCitySelect = useCallback((value: string) => {
    updateFormData({ selectedCity: value })
  }, [updateFormData])

  const onSubmit = useCallback(() => {
    if (selectedCity) {
      console.log('Selected city:', selectedCity)
      nextStep()
    }
  }, [selectedCity, nextStep])

  const buttonClassName = useMemo(() => `
    w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] flex justify-center items-center transition-all
    ${selectedCity 
      ? 'bg-[#76C043] hover:bg-lime-600 cursor-pointer' 
      : 'bg-gray-300 cursor-not-allowed'
    }
  `, [selectedCity])

  const buttonTextClassName = useMemo(() => 
    `text-base font-['Inter'] ${selectedCity ? 'text-white' : 'text-gray-500'}`,
    [selectedCity]
  )

  return (
    <div className="w-full xl:max-w-[894px] xl:h-[638px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl border border-[#6AAD3C]/20 mb-10 min-h-[600px] xl:min-h-0">
      {/* Header Section */}
      <header className="mb-6 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-8 xl:leading-10">
          Departure city
        </h1>
      </header>

      {/* Content Section */}
      <div className="flex flex-col justify-between xl:h-[calc(100%-80px)] h-auto gap-8 xl:gap-0">
        {/* Cities Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 xl:gap-4 mb-6 xl:mb-8" role="group" aria-label="City selection">
          <Controller
            name="selectedCity"
            control={control}
            render={({ field }) => (
              <>
                {CITY_OPTIONS.map((city) => (
                  <CityCard
                    key={city.value}
                    city={city}
                    isSelected={field.value === city.value}
                    onSelect={(value) => {
                      field.onChange(value)
                      handleCitySelect(value)
                    }}
                  />
                ))}
              </>
            )}
          />
        </div>

        {/* Next Button */}
        <button
          onClick={handleSubmit(onSubmit)}
          disabled={!selectedCity}
          className={buttonClassName}
          type="button"
          aria-label="Proceed to next step"
        >
          <span className={buttonTextClassName}>
            Next
          </span>
        </button>
      </div>
    </div>
  )
}

export default React.memo(DepartureCity)
