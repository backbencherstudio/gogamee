'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface ExtraService {
  id: string
  name: string
  description: string
  price: number
  icon: string
  isSelected: boolean
  quantity: number
  maxQuantity?: number
  isIncluded?: boolean
}

interface HeroData {
  selectedSport: string
  selectedPackage: string
  selectedCity: string
  peopleCount: {
    adults: number
    kids: number
    babies: number
  }
  fromHero: boolean
  startFromStep: number
}

// Create context for sharing state between components
export interface BookingContextType {
  currentStep: number
  formData: {
    selectedSport: string
    selectedPackage: string
    selectedCity: string
    peopleCount: {
      adults: number
      kids: number
      babies: number
    }
    selectedLeague: string
    removedLeagues: Array<{
      id: string
      name: string
      country: string
    }>
    departureDate: string
    returnDate: string
    flightSchedule: {
      departure: {
        start: number
        end: number
      }
      arrival: {
        start: number
        end: number
      }
    } | null
    extras: ExtraService[]
    personalInfo: {
      firstName: string
      lastName: string
      email: string
      phone: string
    }
    paymentInfo: {
      cardNumber: string
      expiryDate: string
      cvv: string
      cardholderName: string
    }
    fromHero?: boolean
  }
  updateFormData: (stepData: Partial<BookingContextType['formData']>) => void
  updateExtras: (extras: ExtraService[]) => void
  calculateTotalCost: () => number
  getSelectedExtras: () => ExtraService[]
  getTotalPeople: () => number
  clearBookingData: () => void
  nextStep: (immediateData?: Partial<BookingContextType['formData']>) => void
  previousStep: () => void
  goToStep: (step: number) => void
  isHydrated: boolean
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined)

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default data that's consistent between server and client
  const getDefaultFormData = (): BookingContextType['formData'] => ({
    selectedSport: 'football',
    selectedPackage: 'standard',
    selectedCity: '',
    peopleCount: {
      adults: 1,
      kids: 0,
      babies: 0
    },
    selectedLeague: '',
    removedLeagues: [],
    departureDate: '',
    returnDate: '',
    flightSchedule: null,
    extras: [],
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: ''
    },
    paymentInfo: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    },
    fromHero: false
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<BookingContextType['formData']>(getDefaultFormData)
  const [isHydrated, setIsHydrated] = useState(false)
  
  // Debug effect to monitor currentStep changes
  useEffect(() => {
    console.log('🎯 currentStep changed to:', currentStep)
  }, [currentStep])

  // Load data from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true)
    
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      // 🎯 PRIORITY 1: Check for hero data first
      const heroData = localStorage.getItem('gogame_hero_data')
      if (heroData) {
        try {
          const parsedHeroData = JSON.parse(heroData)
          console.log('🎯 Found hero data, pre-populating stepper:', parsedHeroData)
          
          // Map hero data to stepper format
          const mapHeroDataToStepper = (heroData: HeroData) => {
            // Handle sport mapping - keep "both" as is
            const mappedSport = heroData.selectedSport
            
            // Handle city mapping (remove accents if needed)
            let mappedCity = heroData.selectedCity
            if (mappedCity === 'málaga') {
              mappedCity = 'malaga'
            }
            
            return {
              selectedSport: mappedSport,
              selectedPackage: heroData.selectedPackage,
              selectedCity: mappedCity,
              peopleCount: heroData.peopleCount
            }
          }
          
          const mappedHeroData = mapHeroDataToStepper(parsedHeroData)
          
          // Pre-populate form data with mapped hero data
          const heroFormData = {
            ...getDefaultFormData(),
            ...mappedHeroData,
            fromHero: true
          }
          
          setFormData(heroFormData)
          setCurrentStep(parsedHeroData.startFromStep) // Start from step 5 (0-indexed = 4)
          console.log('🎯 Setting current step to:', parsedHeroData.startFromStep, 'for hero data')
          
          // Clear hero data so it doesn't interfere with normal flow
          localStorage.removeItem('gogame_hero_data')
          // Also clear any existing booking step to ensure hero step takes priority
          localStorage.removeItem('gogame_booking_step')
          console.log('✅ Hero data applied and cleared. Starting from step', parsedHeroData.startFromStep + 1)
          
          // Force a re-render to ensure the step change is applied
          setTimeout(() => {
            console.log('🔄 Forcing step update to:', parsedHeroData.startFromStep)
            setCurrentStep(parsedHeroData.startFromStep)
          }, 100)
          
          // Additional safety check - ensure step is set correctly
          setTimeout(() => {
            console.log('🔍 Final step check - current step should be:', parsedHeroData.startFromStep)
            if (currentStep !== parsedHeroData.startFromStep) {
              console.log('⚠️ Step mismatch detected, correcting...')
              setCurrentStep(parsedHeroData.startFromStep)
            }
          }, 200)
          
          return // Exit early - don't load normal localStorage data
        } catch (error) {
          console.error('Error parsing hero data:', error)
          localStorage.removeItem('gogame_hero_data') // Clean up invalid data
        }
      }
      
      // 📦 PRIORITY 2: Load normal booking data from localStorage (only if no hero data)
      const savedData = localStorage.getItem('gogame_booking_data')
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setFormData(parsedData)
          console.log('📦 Loaded existing booking data from localStorage')
        } catch (error) {
          console.error('Error parsing localStorage data:', error)
        }
      }
      
      // Load currentStep from localStorage (only if no hero data was processed)
      const savedStep = localStorage.getItem('gogame_booking_step')
      if (savedStep) {
        try {
          const step = parseFloat(savedStep)
          setCurrentStep(step)
          console.log('📍 Loaded current step from localStorage:', step + 1)
        } catch (error) {
          console.error('Error parsing localStorage step:', error)
        }
      }
    }
  }, [])

  // Save formData to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem('gogame_booking_data', JSON.stringify(formData))
    }
  }, [formData, isHydrated])

  // Save currentStep to localStorage whenever it changes (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      // Don't save step immediately if we're processing hero data
      const heroData = localStorage.getItem('gogame_hero_data')
      if (!heroData) {
        localStorage.setItem('gogame_booking_step', currentStep.toString())
        console.log('💾 Saved current step to localStorage:', currentStep)
      }
    }
  }, [currentStep, isHydrated])

  const updateFormData = (stepData: Partial<BookingContextType['formData']>) => {
    setFormData(prev => {
      const newData = { ...prev, ...stepData }
      return newData
    })
  }

  const updateExtras = (extras: ExtraService[]) => {
    setFormData(prev => ({ ...prev, extras }))
  }

  const calculateTotalCost = () => {
    const selectedExtras = formData.extras.filter(extra => extra.isSelected && !extra.isIncluded)
    return selectedExtras.reduce((total, extra) => total + (extra.price * extra.quantity), 0)
  }

  const getSelectedExtras = () => {
    return formData.extras.filter(extra => extra.isSelected)
  }

  const getTotalPeople = () => {
    return formData.peopleCount.adults + formData.peopleCount.kids + formData.peopleCount.babies
  }

  const clearBookingData = () => {
    setFormData({
      selectedSport: 'football',
      selectedPackage: 'standard',
      selectedCity: '',
      peopleCount: {
        adults: 1,
        kids: 0,
        babies: 0
      },
      selectedLeague: '',
      removedLeagues: [],
      departureDate: '',
      returnDate: '',
      flightSchedule: null,
      extras: [],
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
      },
      paymentInfo: {
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      },
      fromHero: false
    })
    setCurrentStep(0) // Reset to step 1
    localStorage.removeItem('gogame_booking_data')
    localStorage.removeItem('gogame_booking_step')
    console.log('Booking data cleared.')
  }

  const nextStep = (immediateData?: Partial<BookingContextType['formData']>) => {
    // Get the current data with any immediate updates
    const currentData = { ...formData, ...immediateData }
    
    // Special logic for step 5 (league selection)
    if (currentStep === 4) { // Step 5 (0-indexed)
      if (currentData.selectedLeague === 'national') {
        // Go to remove league step for National Leagues
        setCurrentStep(4.5) // We'll use 4.5 to represent step 5.5
      } else {
        // Go directly to date selection (step 6) for European Competition
        setCurrentStep(5)
      }
    } else if (currentStep === 4.5) {
      // From remove league, go to date selection
      setCurrentStep(5)
    } else {
      // Normal progression
      setCurrentStep(prev => Math.min(prev + 1, 9)) // 10 steps total (0-9)
    }
  }

  const previousStep = () => {
    if (currentStep === 4.5) {
      // From remove league, go back to league selection
      setCurrentStep(4)
    } else if (currentStep === 5 && formData.selectedLeague === 'national') {
      // If coming from date selection and had national selected, go to remove league
      setCurrentStep(4.5)
    } else {
      // Normal progression
      setCurrentStep(prev => Math.max(prev - 1, 0))
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
  }

  const value: BookingContextType = {
    currentStep,
    formData,
    updateFormData,
    updateExtras,
    calculateTotalCost,
    getSelectedExtras,
    getTotalPeople,
    clearBookingData,
    nextStep,
    previousStep,
    goToStep,
    isHydrated
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider')
  }
  return context
} 