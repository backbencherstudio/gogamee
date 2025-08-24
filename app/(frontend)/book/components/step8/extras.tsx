'use client'

import React, { useMemo, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import { useBooking } from '../../context/BookingContext'
import { extrasData } from '../../../../lib/appdata'

// Types
interface ExtraService {
  readonly id: string
  name: string
  description: string
  readonly price: number
  readonly icon: string
  isSelected: boolean
  quantity: number
  readonly maxQuantity?: number
  readonly isIncluded?: boolean
  readonly isGroupOption?: boolean // New field to identify group-only options
  currency?: string
}

interface FormData {
  extras: ExtraService[]
}

// Initial data factory
const createInitialExtras = (): ExtraService[] => {
  return extrasData.initialExtras.map(extra => ({
    ...extra,
    // Use the centralized data as is
    isSelected: extra.isSelected,
    quantity: extra.quantity,
    isGroupOption: extra.isGroupOption || false
  }))
}

export default function Extras() {
  const { formData, updateExtras, nextStep, getTotalPeople } = useBooking()
  
  // Get initial extras from BookingContext or create defaults
  const getInitialExtras = (): ExtraService[] => {
    if (formData.extras && formData.extras.length > 0) {
      console.log('Loading existing extras from BookingContext:', formData.extras)
      return formData.extras
    } else {
      console.log('Creating default extras')
      return createInitialExtras()
    }
  }
  
  const { control, watch, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      extras: getInitialExtras()
    }
  })

  const watchedValues = watch()
  const { extras } = watchedValues

  // Get total number of travelers
  const totalTravelers = getTotalPeople()

  // Update quantities for group options when total travelers changes
  useEffect(() => {
    const updatedExtras = extras.map(extra => {
      if (extra.isGroupOption && extra.isSelected) {
        return { ...extra, quantity: totalTravelers }
      }
      return extra
    })
    setValue('extras', updatedExtras)
  }, [totalTravelers, setValue, extras])

  // Memoized calculations
  const totalExtrasCost = useMemo(() => {
    return extras
      .filter(extra => extra.isSelected && !extra.isIncluded)
      .reduce((total, extra) => {
        if (extra.isGroupOption) {
          // For group options, multiply by total travelers
          return total + (extra.price * totalTravelers)
        } else {
          // For individual options, use the quantity
          return total + (extra.price * extra.quantity)
        }
      }, 0)
  }, [extras, totalTravelers])

  // Event handlers
  const handleToggleExtra = useCallback((id: string) => {
    const updatedExtras = extras.map(extra => {
      if (extra.id === id && !extra.isIncluded) {
        const newIsSelected = !extra.isSelected
        
        if (extra.isGroupOption) {
          // For group options, when selected, quantity should be total travelers
          // When deselected, quantity should be 0
          return { 
            ...extra, 
            isSelected: newIsSelected, 
            quantity: newIsSelected ? totalTravelers : 0 
          }
        }
        
        // For individual options, keep current quantity
        return { ...extra, isSelected: newIsSelected }
      }
      
      return extra
    })
    setValue('extras', updatedExtras)
  }, [extras, setValue, totalTravelers])

  const handleQuantityChange = useCallback((id: string, change: number) => {
    const updatedExtras = extras.map(extra => {
      if (extra.id === id && !extra.isIncluded) {
        // For group options, quantity should always be total travelers when selected
        if (extra.isGroupOption) {
          return extra
        }
        
        // For individual options (like extra luggage), allow quantity changes
        const newQuantity = Math.max(
          0, // Allow 0 for extra luggage
          Math.min(extra.maxQuantity || extrasData.constants.defaultMaxQuantity, extra.quantity + change)
        )
        return { ...extra, quantity: newQuantity }
      }
      return extra
    })
    setValue('extras', updatedExtras)
  }, [extras, setValue])

  const onSubmit = useCallback((data: FormData) => {
    const selectedExtras = data.extras.filter(extra => extra.isSelected)
    console.log('Selected extras:', selectedExtras)
    
    // Calculate total cost
    const totalCost = selectedExtras.reduce((total, extra) => {
      if (!extra.isIncluded) {
        if (extra.isGroupOption) {
          return total + (extra.price * totalTravelers)
        } else {
          return total + (extra.price * extra.quantity)
        }
      }
      return total
    }, 0)
    
    console.log('Total extra cost:', totalCost)
    
    // Update booking context with selected extras
    updateExtras(data.extras)
    
    // Navigate to next step
    nextStep()
  }, [updateExtras, nextStep, totalTravelers])

  const renderQuantityControls = (extra: ExtraService) => {
    // For group options, show quantity but don't allow individual changes
    if (extra.isGroupOption) {
      return (
        <div className="flex items-center gap-2">
          <div className="justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none min-w-[20px] text-center">
            x{extra.isSelected ? totalTravelers : 0}
          </div>
        </div>
      )
    }
    
    // For individual options (like extra luggage), allow quantity changes
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleQuantityChange(extra.id, -1)}
          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors opacity-60 hover:opacity-80"
          disabled={extra.quantity <= 0}
        >
          -
        </button>
        <div className="justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none min-w-[20px] text-center">
          x{extra.quantity}
        </div>
        <button
          type="button"
          onClick={() => handleQuantityChange(extra.id, 1)}
          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors opacity-60 hover:opacity-80"
          disabled={extra.quantity >= (extra.maxQuantity || extrasData.constants.defaultMaxQuantity)}
        >
          +
        </button>
      </div>
    )
  }

  const renderToggleButton = (extra: ExtraService) => (
    <button
      type="button"
      onClick={() => handleToggleExtra(extra.id)}
      className={`w-28 sm:w-32 h-10 px-4 sm:px-6 py-2.5 rounded outline-1 outline-offset-[-1px] flex justify-center items-center gap-2.5 transition-all ${
        extra.isSelected
          ? 'bg-red-500 outline-red-500 hover:bg-red-600'
          : 'bg-[#6AAD3C] outline-[#6AAD3C] hover:bg-lime-600'
      }`}
    >
      <div className="text-center justify-start text-white text-sm sm:text-lg font-normal font-['Inter'] leading-5 sm:leading-7">
        {extra.isSelected ? 'Remove' : 'Add'}
      </div>
    </button>
  )

  const renderExtraService = (extra: ExtraService) => (
    <div 
      key={extra.id} 
      className={`self-stretch p-4 bg-white rounded-lg transition-all ${
        extra.isSelected ? 'ring-2 ring-[#6AAD3C] shadow-lg' : 'hover:shadow-md'
      }`}
    >
      {/* Mobile Layout */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* Header with icon, name and price */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 p-2 bg-[#F1F9EC] rounded-[5.14px] flex justify-center items-center shrink-0">
              <Image src={extra.icon} alt={`${extra.name} icon`} width={32} height={32} />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="text-neutral-800 text-base font-medium font-['Poppins'] leading-tight">
                {extra.name}
              </div>
              <div className="text-[#6AAD3C] text-base font-semibold font-['Poppins']">
                {extra.isIncluded ? 'Included' : `+${extra.currency}${extra.price}`}
              </div>
              {!extra.isIncluded && (
                <div className="text-neutral-600 text-sm font-normal font-['Poppins']">
                  {extra.isGroupOption ? extrasData.text.perPerson : extrasData.text.perPerson}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="text-neutral-600 text-sm font-normal font-['Poppins'] leading-5">
          {extra.description}
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          {!extra.isIncluded ? (
            <>
              <div className="flex items-center gap-3">
                {renderQuantityControls(extra)}
              </div>
              {renderToggleButton(extra)}
            </>
          ) : (
            <div className="flex justify-between items-center w-full">
              <div className="text-neutral-800 text-base font-normal font-['Poppins']">
                x{extra.quantity}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout - unchanged */}
      <div className="hidden md:flex justify-between items-start">
        <div className="flex justify-start items-start gap-3 flex-1">
          <div className="w-16 h-16 p-3 bg-[#F1F9EC] rounded-[5.14px] inline-flex flex-col justify-center items-center gap-3 overflow-hidden">
            <Image src={extra.icon} alt={`${extra.name} icon`} width={40} height={40} />
          </div>
          <div className="inline-flex flex-col justify-start items-start gap-1 flex-1">
            <div className="self-stretch justify-start text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">
              {extra.name}
            </div>
            <div className="self-stretch justify-start text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              {extra.description}
            </div>
          </div>
        </div>
        <div className="inline-flex flex-col justify-center items-end gap-4">
          <div className="flex flex-col justify-start items-end gap-1">
            <div className="self-stretch text-right justify-start text-[#6AAD3C] text-lg font-semibold font-['Poppins'] leading-loose">
              {extra.isIncluded ? 'Included' : `+${extra.currency}${extra.price}`}
            </div>
            {!extra.isIncluded && (
              <div className="self-stretch text-right justify-start text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
                {extra.isGroupOption ? extrasData.text.perPerson : extrasData.text.perPerson}
              </div>
            )}
          </div>
          <div className="inline-flex justify-start items-center gap-4">
            {!extra.isIncluded ? (
              <>
                {renderQuantityControls(extra)}
                {renderToggleButton(extra)}
              </>
            ) : (
              <div className="justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                x{extra.quantity}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full xl:w-[894px] px-3 sm:px-4 xl:px-6 py-4 sm:py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-4 sm:gap-6 min-h-[400px] sm:min-h-[500px] xl:min-h-0">
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
            <div className="justify-center text-neutral-800 text-xl sm:text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-7 sm:leading-8 xl:leading-10">
              {extrasData.text.title}
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <Controller
                name="extras"
                control={control}
                render={() => (
                  <>
                    {extras.map(renderExtraService)}
                  </>
                )}
              />
            </div>

            {/* Total Cost Display */}
            {totalExtrasCost > 0 && (
              <div className="self-stretch p-3 sm:p-4 bg-lime-50 rounded-lg border border-lime-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0">
                  <div className="text-neutral-800 text-base sm:text-lg font-medium font-['Poppins']">
                    {extrasData.text.totalCost}
                  </div>
                  <div className="text-lime-600 text-lg sm:text-xl font-semibold font-['Poppins']">
                    +{extrasData.constants.currencySymbol}{totalExtrasCost}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-44 h-11 px-3.5 py-1.5 bg-[#6AAD3C] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
            >
              <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
                {extrasData.text.confirm}
              </div>
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
