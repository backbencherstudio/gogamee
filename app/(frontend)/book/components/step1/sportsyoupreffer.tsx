'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { IoChevronDown } from 'react-icons/io5'
import { useBooking } from '../../context/BookingContext'

// Types
interface SportOption {
  value: string
  label: string
}

interface FormData {
  selectedSport: string
}

// Constants
const SPORTS_OPTIONS: readonly SportOption[] = [
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'golf', label: 'Golf' },
] as const

export default function SportsYouPreffer() {
  const { formData, updateFormData, nextStep } = useBooking()
  const [isOpen, setIsOpen] = useState(false)

  // Initialize form with react-hook-form
  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      selectedSport: formData.selectedSport || ''
    },
    mode: 'onChange'
  })

  const selectedSport = watch('selectedSport')

  // Memoized selected label for better performance
  const selectedLabel = useMemo(() => {
    return SPORTS_OPTIONS.find(sport => sport.value === selectedSport)?.label || 'Select a sport'
  }, [selectedSport])

  // Callbacks for better performance
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const closeDropdown = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleSportSelect = useCallback((value: string, onChange: (value: string) => void) => {
    onChange(value)
    setIsOpen(false)
    // Save to context immediately on change
    updateFormData({ selectedSport: value })
  }, [updateFormData])

  // Form submission handler
  const onSubmit = useCallback((data: FormData) => {
    console.log('Selected sport:', data.selectedSport)
    nextStep()
  }, [nextStep])

  return (
    <div className="w-full max-w-[894px] h-[638px] p-6 bg-[#F1F9EC] rounded-xl border border-[#76C043]/20 mb-10">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-10 mb-3">
          What sport do you prefer?
        </h1>
        <p className="text-base text-neutral-600 font-['Poppins'] leading-7">
          We always try to maximize the time at the destination
        </p>
      </div>

      {/* Content Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-between h-[calc(100%-120px)]">
        {/* Dropdown Section */}
        <div className="relative">
          <Controller
            name="selectedSport"
            control={control}
            rules={{ required: 'Please select a sport' }}
            render={({ field: { onChange, value } }) => (
              <>
                <div
                  onClick={toggleDropdown}
                  className="w-full max-w-96 h-11 px-5 py-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleDropdown()
                    }
                  }}
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
                    {SPORTS_OPTIONS.map((sport, index) => (
                      <div
                        key={sport.value}
                        onClick={() => handleSportSelect(sport.value, onChange)}
                        className={`
                          px-5 py-3 cursor-pointer hover:bg-gray-50 transition-all
                          ${value === sport.value ? 'bg-lime-50 text-lime-700' : 'text-zinc-950'}
                          ${index === 0 ? 'rounded-t-lg' : ''}
                          ${index === SPORTS_OPTIONS.length - 1 ? 'rounded-b-lg' : ''}
                        `}
                        role="option"
                        aria-selected={value === sport.value}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleSportSelect(sport.value, onChange)
                          }
                        }}
                      >
                        <span className="text-sm font-['Poppins']">
                          {sport.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          />
        </div>

        {/* Next Button */}
        <button
          type="submit"
          className="w-44 h-11 px-3.5 py-1.5 bg-[#76C043] hover:bg-lime-600 rounded backdrop-blur-[5px] flex justify-center items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedSport}
        >
          <span className="text-base text-white font-['Inter']">Next</span>
        </button>
      </form>

      {/* Click outside to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={closeDropdown}
        />
      )}
    </div>
  )
}
