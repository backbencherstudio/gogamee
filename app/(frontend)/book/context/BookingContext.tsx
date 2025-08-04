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
    }
  })

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<BookingContextType['formData']>(getDefaultFormData)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load data from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true)
    
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      // Load formData from localStorage
      const savedData = localStorage.getItem('gogame_booking_data')
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setFormData(parsedData)
        } catch (error) {
          console.error('Error parsing localStorage data:', error)
        }
      }
      
      // Load currentStep from localStorage
      const savedStep = localStorage.getItem('gogame_booking_step')
      if (savedStep) {
        try {
          const step = parseFloat(savedStep)
          setCurrentStep(step)
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
      localStorage.setItem('gogame_booking_step', currentStep.toString())
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
      }
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
      if (currentData.selectedLeague === 'european') {
        // Go to remove league step
        setCurrentStep(4.5) // We'll use 4.5 to represent step 5.5
      } else {
        // Go directly to date selection (step 6)
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
    } else if (currentStep === 5 && formData.selectedLeague === 'european') {
      // If coming from date selection and had european selected, go to remove league
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