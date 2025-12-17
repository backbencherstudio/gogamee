'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { IoChevronDown } from 'react-icons/io5'
import { useBooking } from '../../context/BookingContext'
import { sportsPreferenceData } from '../../../../lib/appdata'
import { TranslatedText } from '../../../_components/TranslatedText'

// Types
interface FormData {
  selectedSport: string
}

export default function SportsYouPreffer() {
  const { formData, updateFormData, nextStep } = useBooking()
  const [isOpen, setIsOpen] = useState(false)
  
  // Debug logging
  console.log('🎯 SportsYouPreffer - formData.selectedSport:', formData.selectedSport, 'fromHero:', formData.fromHero)

  // Initialize form with react-hook-form
  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      selectedSport: formData.selectedSport || ''
    },
    mode: 'onChange'
  })

  const selectedSport = watch('selectedSport')

  // Sync with context when context data changes (especially for hero data)
  useEffect(() => {
    if (formData.selectedSport && formData.selectedSport !== selectedSport) {
      setValue('selectedSport', formData.selectedSport)
      console.log('🎯 SportsYouPreffer - synced with context:', formData.selectedSport)
    }
  }, [formData.selectedSport, selectedSport, setValue])

  // Memoized selected label for better performance
  const selectedLabel = useMemo(() => {
    return sportsPreferenceData.getSportByValue(selectedSport)?.label || 'Select a sport'
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
    <div className="w-full xl:max-w-[894px] xl:h-[638px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl border border-[#76C043]/20 mb-10 min-h-[500px] xl:min-h-0 relative">
      {/* Header Section */}
      <div className="mb-6 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-8 xl:leading-10 mb-3">
          <TranslatedText text="¿Qué deporte prefieres?" english="What sport do you prefer?" />
        </h1>
        <p className="text-sm xl:text-base text-neutral-600 font-['Poppins'] leading-6 xl:leading-7">
          <TranslatedText
            text="Siempre intentamos que puedas maximizar tu tiempo en el destino."
            english={sportsPreferenceData.getSportByValue(selectedSport)?.description || 'We always try to maximize the time at the destination'}
          />
        </p>
      </div>

      {/* Content Section */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-between xl:h-[calc(100%-120px)] h-auto gap-8 xl:gap-0">
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
                  className="w-full xl:max-w-96 h-11 px-5 py-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all"
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
                  <div className="absolute top-12 left-0 w-full xl:max-w-96 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                    {sportsPreferenceData.getAllSports().map((sport, index) => (
                      <div
                        key={sport.value}
                        onClick={() => handleSportSelect(sport.value, onChange)}
                        className={`
                          px-5 py-3 cursor-pointer hover:bg-gray-50 transition-all
                          ${value === sport.value ? 'bg-lime-50 text-lime-700' : 'text-zinc-950'}
                          ${index === 0 ? 'rounded-t-lg' : ''}
                          ${index === sportsPreferenceData.getAllSports().length - 1 ? 'rounded-b-lg' : ''}
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

        {/* Next Button - Positioned at bottom left */}
        <button
          type="submit"
          className="w-44 h-11 px-3.5 py-1.5 bg-[#76C043] hover:bg-lime-600 rounded backdrop-blur-[5px] flex justify-center items-center transition-all disabled:opacity-50 disabled:cursor-not-allowed absolute bottom-4 left-4 xl:bottom-6 xl:left-6"
          disabled={!selectedSport}
        >
          <span className="text-base text-white font-['Inter']">
            <TranslatedText text="Siguiente" english="Next" />
          </span>
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
