'use client'

import React, { useMemo, useCallback } from 'react'
import Image from 'next/image'
import { useForm, Controller } from 'react-hook-form'
import { useBooking } from '../../context/BookingContext'

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
  currency?: string
}

interface FormData {
  language: 'en' | 'es'
  currency: 'EUR' | 'USD' | 'GBP'
  extras: ExtraService[]
}

// Constants
const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£'
} as const

const CURRENCY_RATES = {
  EUR: 1,
  USD: 1.1,
  GBP: 0.85
} as const

const DEFAULT_MAX_QUANTITY = 10
const MIN_QUANTITY = 1

// Translations
const TRANSLATIONS = {
  en: {
    title: "Do you want to add extra services?",
    perPerson: "Per person",
    included: "Included",
    add: "Add",
    remove: "Remove",
    confirm: "Confirm",
    totalCost: "Total Extra Services Cost:",
    breakfast: {
      name: "Breakfast",
      description: "Start your day full of energy with breakfast for only 10 euros per person"
    },
    travelInsurance: {
      name: "Travel Insurance", 
      description: "Cover yourself for delays or strikes as well as medical insurance in the country you are going to."
    },
    underseatBag: {
      name: "Underseat bag",
      description: "Check the measurements accepted by the airline you are flying with."
    },
    extraLuggage: {
      name: "Extra luggage",
      description: "Extra luggage (8kg- 10kg)"
    },
    seatsTogether: {
      name: "Seats together",
      description: "Do you want to sit together on the flight? Otherwise the seats will be chosen randomly."
    }
  },
  es: {
    title: "¿Quieres añadir servicios extra?",
    perPerson: "Por persona",
    included: "Incluido",
    add: "Añadir",
    remove: "Quitar",
    confirm: "Confirmar",
    totalCost: "Coste Total de Servicios Extra:",
    breakfast: {
      name: "Desayuno",
      description: "Comienza tu día lleno de energía con desayuno por solo 10 euros por persona"
    },
    travelInsurance: {
      name: "Seguro de Viaje",
      description: "Cúbrete por retrasos o huelgas así como seguro médico en el país al que vas."
    },
    underseatBag: {
      name: "Bolsa bajo asiento",
      description: "Verifica las medidas aceptadas por la aerolínea con la que vuelas."
    },
    extraLuggage: {
      name: "Equipaje extra",
      description: "Equipaje extra (8kg- 10kg)"
    },
    seatsTogether: {
      name: "Asientos juntos",
      description: "¿Quieres sentarte juntos en el vuelo? De lo contrario los asientos se elegirán aleatoriamente."
    }
  }
} as const

// Initial data factory
const createInitialExtras = (
  language: 'en' | 'es', 
  currency: 'EUR' | 'USD' | 'GBP'
): ExtraService[] => {
  const t = TRANSLATIONS[language]
  
  return [
    {
      id: 'breakfast',
      name: t.breakfast.name,
      description: t.breakfast.description,
      price: 10,
      icon: '/stepper/icon/icon1.svg',
      isSelected: false,
      quantity: 1,
      maxQuantity: DEFAULT_MAX_QUANTITY,
      currency
    },
    {
      id: 'travel-insurance',
      name: t.travelInsurance.name,
      description: t.travelInsurance.description,
      price: 20,
      icon: '/stepper/icon/icon2.svg',
      isSelected: false,
      quantity: 1,
      maxQuantity: DEFAULT_MAX_QUANTITY,
      currency
    },
    {
      id: 'underseat-bag',
      name: t.underseatBag.name,
      description: t.underseatBag.description,
      price: 0,
      icon: '/stepper/icon/icon3.svg',
      isSelected: true,
      quantity: 3,
      isIncluded: true,
      currency
    },
    {
      id: 'extra-luggage',
      name: t.extraLuggage.name,
      description: t.extraLuggage.description,
      price: 40,
      icon: '/stepper/icon/icon4.svg',
      isSelected: false,
      quantity: 2,
      maxQuantity: 5,
      currency
    },
    {
      id: 'seats-together',
      name: t.seatsTogether.name,
      description: t.seatsTogether.description,
      price: 20,
      icon: '/stepper/icon/icon5.svg',
      isSelected: false,
      quantity: 2,
      maxQuantity: DEFAULT_MAX_QUANTITY,
      currency
    }
  ]
}

export default function Extras() {
  const { formData, updateExtras, nextStep } = useBooking()
  
  // Get initial extras from BookingContext or create defaults
  const getInitialExtras = (): ExtraService[] => {
    if (formData.extras && formData.extras.length > 0) {
      console.log('Loading existing extras from BookingContext:', formData.extras)
      return formData.extras
    } else {
      console.log('Creating default extras')
      return createInitialExtras('en', 'EUR')
    }
  }
  
  const { control, watch, setValue, handleSubmit } = useForm<FormData>({
    defaultValues: {
      language: 'en',
      currency: 'EUR',
      extras: getInitialExtras()
    }
  })

  const watchedValues = watch()
  const { language, currency, extras } = watchedValues
  const t = TRANSLATIONS[language]

  // Memoized calculations
  const convertPrice = useCallback((price: number): number => {
    return Math.round(price * CURRENCY_RATES[currency])
  }, [currency])

  const totalExtrasCost = useMemo(() => {
    return extras
      .filter(extra => extra.isSelected && !extra.isIncluded)
      .reduce((total, extra) => total + (convertPrice(extra.price) * extra.quantity), 0)
  }, [extras, convertPrice])

  // Event handlers
  const handleToggleExtra = useCallback((id: string) => {
    const updatedExtras = extras.map(extra => {
      if (extra.id === id && !extra.isIncluded) {
        return { ...extra, isSelected: !extra.isSelected }
      }
      return extra
    })
    setValue('extras', updatedExtras)
  }, [extras, setValue])

  const handleQuantityChange = useCallback((id: string, change: number) => {
    const updatedExtras = extras.map(extra => {
      if (extra.id === id && !extra.isIncluded) {
        const newQuantity = Math.max(
          MIN_QUANTITY, 
          Math.min(extra.maxQuantity || DEFAULT_MAX_QUANTITY, extra.quantity + change)
        )
        return { ...extra, quantity: newQuantity }
      }
      return extra
    })
    setValue('extras', updatedExtras)
  }, [extras, setValue])

  const handleLanguageChange = useCallback((newLanguage: 'en' | 'es') => {
    const newTranslations = TRANSLATIONS[newLanguage]
    const updatedExtras = extras.map(extra => {
      const translationKey = extra.id.replace('-', '') as keyof typeof newTranslations
      if (translationKey in newTranslations && typeof newTranslations[translationKey] === 'object') {
        const translation = newTranslations[translationKey] as { name: string; description: string }
        return { 
          ...extra, 
          name: translation.name, 
          description: translation.description 
        }
      }
      return extra
    })
    
    setValue('language', newLanguage)
    setValue('extras', updatedExtras)
  }, [extras, setValue])

  const handleCurrencyChange = useCallback((newCurrency: 'EUR' | 'USD' | 'GBP') => {
    const updatedExtras = extras.map(extra => ({
      ...extra,
      currency: newCurrency
    }))
    
    setValue('currency', newCurrency)
    setValue('extras', updatedExtras)
  }, [extras, setValue])

  const onSubmit = useCallback((data: FormData) => {
    const selectedExtras = data.extras.filter(extra => extra.isSelected)
    console.log('Selected extras:', selectedExtras)
    
    // Calculate total cost
    const totalCost = selectedExtras.reduce((total, extra) => {
      if (!extra.isIncluded) {
        return total + (convertPrice(extra.price) * extra.quantity)
      }
      return total
    }, 0)
    
    console.log('Total extra cost:', totalCost)
    
    // Update booking context with selected extras
    updateExtras(data.extras)
    
    // Navigate to next step
    nextStep()
  }, [convertPrice, updateExtras, nextStep])

  // Render functions
  const renderLanguageButtons = () => (
    <div className="flex gap-2">
      {(['en', 'es'] as const).map((lang) => (
        <button 
          key={lang}
          type="button"
          onClick={() => handleLanguageChange(lang)}
          className={`px-3 py-1 rounded ${language === lang ? 'bg-lime-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  )

  const renderCurrencyButtons = () => (
    <div className="flex gap-2">
      {(Object.keys(CURRENCY_SYMBOLS) as Array<keyof typeof CURRENCY_SYMBOLS>).map((curr) => (
        <button 
          key={curr}
          type="button"
          onClick={() => handleCurrencyChange(curr)}
          className={`px-3 py-1 rounded ${currency === curr ? 'bg-lime-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          {curr}
        </button>
      ))}
    </div>
  )

  const renderQuantityControls = (extra: ExtraService) => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => handleQuantityChange(extra.id, -1)}
        className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors opacity-60 hover:opacity-80"
        disabled={extra.quantity <= MIN_QUANTITY}
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
        disabled={extra.quantity >= (extra.maxQuantity || DEFAULT_MAX_QUANTITY)}
      >
        +
      </button>
    </div>
  )

  const renderToggleButton = (extra: ExtraService) => (
    <button
      type="button"
      onClick={() => handleToggleExtra(extra.id)}
      className={`w-28 sm:w-32 h-10 px-4 sm:px-6 py-2.5 rounded outline-1 outline-offset-[-1px] flex justify-center items-center gap-2.5 transition-all ${
        extra.isSelected
          ? 'bg-red-500 outline-red-500 hover:bg-red-600'
          : 'bg-lime-500 outline-lime-500 hover:bg-lime-600'
      }`}
    >
      <div className="text-center justify-start text-white text-sm sm:text-lg font-normal font-['Inter'] leading-5 sm:leading-7">
        {extra.isSelected ? t.remove : t.add}
      </div>
    </button>
  )

  const renderExtraService = (extra: ExtraService) => (
    <div 
      key={extra.id} 
      className={`self-stretch p-4 bg-white rounded-lg transition-all ${
        extra.isSelected ? 'ring-2 ring-lime-500 shadow-lg' : 'hover:shadow-md'
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
              <div className="text-lime-500 text-base font-semibold font-['Poppins']">
                {extra.isIncluded ? t.included : `+${CURRENCY_SYMBOLS[currency]}${convertPrice(extra.price)}`}
              </div>
              {!extra.isIncluded && (
                <div className="text-neutral-600 text-sm font-normal font-['Poppins']">
                  {t.perPerson}
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
            <div className="self-stretch text-right justify-start text-lime-500 text-lg font-semibold font-['Poppins'] leading-loose">
              {extra.isIncluded ? t.included : `+${CURRENCY_SYMBOLS[currency]}${convertPrice(extra.price)}`}
            </div>
            {!extra.isIncluded && (
              <div className="self-stretch text-right justify-start text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
                {t.perPerson}
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
      <div className="w-full xl:w-[894px] px-3 sm:px-4 xl:px-6 py-4 sm:py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-4 sm:gap-6 min-h-[400px] sm:min-h-[500px] xl:min-h-0">
        {/* Language and Currency Controls */}
        <div className="self-stretch flex flex-col sm:flex-row xl:flex-row justify-between items-start sm:items-center xl:items-center mb-2 sm:mb-4 gap-3 sm:gap-4 xl:gap-0">
          <div className="flex flex-col sm:flex-row xl:flex-row gap-3 xl:gap-4 w-full sm:w-auto">
            {renderLanguageButtons()}
            {renderCurrencyButtons()}
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
            <div className="justify-center text-neutral-800 text-xl sm:text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-7 sm:leading-8 xl:leading-10">
              {t.title}
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
                    {t.totalCost}
                  </div>
                  <div className="text-lime-600 text-lg sm:text-xl font-semibold font-['Poppins']">
                    +{CURRENCY_SYMBOLS[currency]}{totalExtrasCost}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-44 h-11 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
            >
              <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
                {t.confirm}
              </div>
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
