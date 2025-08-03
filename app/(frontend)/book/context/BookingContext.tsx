'use client'

import React, { createContext, useContext, useState } from 'react'

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
    totalPeople: number
    selectedLeague: string
    departureDate: string
    returnDate: string
    flightSchedule: string
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
  nextStep: () => void
  previousStep: () => void
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined)

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<BookingContextType['formData']>({
    selectedSport: '',
    selectedPackage: '',
    selectedCity: '',
    totalPeople: 1,
    selectedLeague: '',
    departureDate: '',
    returnDate: '',
    flightSchedule: '',
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

  const updateFormData = (stepData: Partial<BookingContextType['formData']>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
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

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 10)) // Assuming 10 steps max
  }

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const value: BookingContextType = {
    currentStep,
    formData,
    updateFormData,
    updateExtras,
    calculateTotalCost,
    getSelectedExtras,
    nextStep,
    previousStep
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