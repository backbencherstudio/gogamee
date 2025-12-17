'use client'

import React, { useCallback, useMemo, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useBooking } from '../../context/BookingContext'
import { sportsPreferenceData } from '../../../../lib/appdata'
import { TranslatedText } from '../../../_components/TranslatedText'

// Types
interface FormData {
  selectedSport: string
}

interface SportOption {
  value: string
  label: string
  gradient: string
  accent: string
}

// Sport card gradients
const SPORT_GRADIENTS: Record<string, { gradient: string; accent: string }> = {
  football: {
    gradient: 'from-green-500',
    accent: 'to-green-600'
  },
  basketball: {
    gradient: 'from-orange-500',
    accent: 'to-orange-600'
  },
  both: {
    gradient: 'from-purple-500',
    accent: 'to-purple-600'
  }
}

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

interface SportCardProps {
  sportOption: SportOption
  isSelected: boolean
  onSelect: (value: string) => void
}

const SportCard: React.FC<SportCardProps> = React.memo(({ sportOption, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(sportOption.value)
  }, [sportOption.value, onSelect])

  const cardClassName = useMemo(() => `
    relative h-[120px] xl:h-[140px] rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105
    bg-gradient-to-br ${sportOption.gradient} ${sportOption.accent}
    ${isSelected 
      ? 'ring-4 ring-lime-400 ring-opacity-60 shadow-lg shadow-lime-200' 
      : 'hover:shadow-xl'
    }
  `, [sportOption.gradient, sportOption.accent, isSelected])

  const sportLabel = useMemo(() => {
    if (sportOption.value === 'football') {
      return { es: 'Fútbol', en: 'Football' }
    } else if (sportOption.value === 'basketball') {
      return { es: 'Basket', en: 'Basketball' }
    } else if (sportOption.value === 'both') {
      return { es: 'Ambos', en: 'Both' }
    }
    return { es: sportOption.label, en: sportOption.label }
  }, [sportOption.value, sportOption.label])

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
      aria-label={`Select ${sportOption.label}`}
    >
      {/* Sport Name Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h3 className="text-white text-base xl:text-lg font-semibold font-['Poppins'] text-center drop-shadow-lg">
          <TranslatedText
            text={sportLabel.es}
            english={sportLabel.en}
            as="span"
          />
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

SportCard.displayName = 'SportCard'

export default function SportsYouPreffer() {
  const { formData, updateFormData, nextStep } = useBooking()
  
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

  // Get sport options with gradients
  const sportOptions = useMemo(() => {
    return sportsPreferenceData.getAllSports().map(sport => ({
      value: sport.value,
      label: sport.label,
      ...SPORT_GRADIENTS[sport.value] || { gradient: 'from-gray-500', accent: 'to-gray-600' }
    }))
  }, [])

  // Event handlers
  const handleSportSelect = useCallback((value: string) => {
    setValue('selectedSport', value)
    // Save to context immediately on change
    updateFormData({ selectedSport: value })
  }, [setValue, updateFormData])

  // Form submission handler
  const onSubmit = useCallback((data: FormData) => {
    console.log('Selected sport:', data.selectedSport)
    updateFormData({ selectedSport: data.selectedSport })
    nextStep()
  }, [updateFormData, nextStep])

  const buttonClassName = useMemo(() => `
    w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] flex justify-center items-center transition-all
    ${selectedSport 
      ? 'bg-[#76C043] hover:bg-lime-600 cursor-pointer' 
      : 'bg-gray-300 cursor-not-allowed'
    }
  `, [selectedSport])

  const buttonTextClassName = useMemo(() => 
    `text-base font-['Inter'] ${selectedSport ? 'text-white' : 'text-gray-500'}`,
    [selectedSport]
  )

  return (
    <div className="w-full xl:max-w-[894px] xl:h-[638px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl border border-[#76C043]/20 mb-10 min-h-[500px] xl:min-h-0">
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
        {/* Sport Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:gap-4 mb-6 xl:mb-8" role="group" aria-label="Sport selection">
          <Controller
            name="selectedSport"
            control={control}
            rules={{ required: 'Please select a sport' }}
            render={({ field }) => (
              <>
                {sportOptions.map((sport) => (
                  <SportCard
                    key={sport.value}
                    sportOption={sport}
                    isSelected={field.value === sport.value}
                    onSelect={(value) => {
                      field.onChange(value)
                      handleSportSelect(value)
                    }}
                  />
                ))}
              </>
            )}
          />
        </div>

        {/* Next Button */}
        <button
          type="submit"
          disabled={!selectedSport}
          className={buttonClassName}
          aria-label="Proceed to next step"
        >
          <span className={buttonTextClassName}>
            <TranslatedText text="Siguiente" english="Next" />
          </span>
        </button>
      </form>
    </div>
  )
}
