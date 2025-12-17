'use client'

import React, { useEffect, useMemo, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useBooking } from '../../context/BookingContext'
import { packageTypeData } from '../../../../lib/appdata'
import { TranslatedText } from '../../../_components/TranslatedText'

// Types
interface PackageFormData {
  selectedPackage: string
}

interface PackageOption {
  value: string
  label: string
  gradient: string
  accent: string
}

// Package card gradients
const PACKAGE_GRADIENTS: Record<string, { gradient: string; accent: string }> = {
  standard: {
    gradient: 'from-blue-500',
    accent: 'to-blue-600'
  },
  premium: {
    gradient: 'from-amber-500',
    accent: 'to-amber-600'
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

interface PackageCardProps {
  packageOption: PackageOption
  isSelected: boolean
  onSelect: (value: string) => void
}

const PackageCard: React.FC<PackageCardProps> = React.memo(({ packageOption, isSelected, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(packageOption.value)
  }, [packageOption.value, onSelect])

  const cardClassName = useMemo(() => `
    relative h-[120px] xl:h-[140px] rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105
    bg-gradient-to-br ${packageOption.gradient} ${packageOption.accent}
    ${isSelected 
      ? 'ring-4 ring-lime-400 ring-opacity-60 shadow-lg shadow-lime-200' 
      : 'hover:shadow-xl'
    }
  `, [packageOption.gradient, packageOption.accent, isSelected])

  const packageLabel = useMemo(() => {
    if (packageOption.value === 'standard') {
      return { es: 'Estándar', en: 'Standard' }
    } else if (packageOption.value === 'premium') {
      return { es: 'Premium', en: 'Premium' }
    }
    return { es: packageOption.label, en: packageOption.label }
  }, [packageOption.value, packageOption.label])

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
      aria-label={`Select ${packageOption.label} package`}
    >
      {/* Package Name Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h3 className="text-white text-base xl:text-lg font-semibold font-['Poppins'] text-center drop-shadow-lg">
          <TranslatedText
            text={packageLabel.es}
            english={packageLabel.en}
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

PackageCard.displayName = 'PackageCard'

const PackageType: React.FC = () => {
  // Context
  const { formData, updateFormData, nextStep } = useBooking()
  
  // React Hook Form
  const { control, handleSubmit, watch, setValue } = useForm<PackageFormData>({
    defaultValues: {
      selectedPackage: formData.selectedPackage || ''
    }
  })
  
  const selectedPackage = watch('selectedPackage')
  
  // Sync with context when context data changes (especially for hero data)
  useEffect(() => {
    if (formData.selectedPackage && formData.selectedPackage !== selectedPackage) {
      setValue('selectedPackage', formData.selectedPackage)
      console.log('🎯 PackageType - synced with context:', formData.selectedPackage)
    }
  }, [formData.selectedPackage, selectedPackage, setValue])
  
  // Get package options with gradients
  const packageOptions = useMemo(() => {
    return packageTypeData.getAllPackages().map(pkg => ({
      value: pkg.value,
      label: pkg.label,
      ...PACKAGE_GRADIENTS[pkg.value] || { gradient: 'from-gray-500', accent: 'to-gray-600' }
    }))
  }, [])
  
  // Event handlers
  const handlePackageSelect = useCallback((value: string) => {
    setValue('selectedPackage', value)
    updateFormData({ selectedPackage: value })
  }, [setValue, updateFormData])
  
  const onSubmit = useCallback((data: PackageFormData) => {
    updateFormData({ selectedPackage: data.selectedPackage })
    nextStep()
  }, [updateFormData, nextStep])

  const buttonClassName = useMemo(() => `
    w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] flex justify-center items-center transition-all
    ${selectedPackage 
      ? 'bg-[#76C043] hover:bg-lime-600 cursor-pointer' 
      : 'bg-gray-300 cursor-not-allowed'
    }
  `, [selectedPackage])

  const buttonTextClassName = useMemo(() => 
    `text-base font-['Inter'] ${selectedPackage ? 'text-white' : 'text-gray-500'}`,
    [selectedPackage]
  )
  
  return (
    <div className="w-full xl:max-w-[894px] xl:h-[638px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl border border-[#6AAD3C]/20 mb-10 min-h-[500px] xl:min-h-0">
      {/* Header Section */}
      <header className="mb-6 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-8 xl:leading-10">
          <TranslatedText text="¿Cómo quieres que sea tu experiencia?" english="How do you want to experience it?" />
        </h1>
      </header>

      {/* Content Section */}
      <form id="package-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-between xl:h-[calc(100%-80px)] h-auto gap-8 xl:gap-0">
        {/* Package Cards Grid */}
        <div className="grid grid-cols-2 xl:grid-cols-2 gap-3 xl:gap-4 mb-6 xl:mb-8" role="group" aria-label="Package selection">
          <Controller
            name="selectedPackage"
            control={control}
            render={({ field }) => (
              <>
                {packageOptions.map((pkg) => (
                  <PackageCard
                    key={pkg.value}
                    packageOption={pkg}
                    isSelected={field.value === pkg.value}
                    onSelect={(value) => {
                      field.onChange(value)
                      handlePackageSelect(value)
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
          form="package-form"
          disabled={!selectedPackage}
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

export default PackageType
