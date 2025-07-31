'use client'

import React, { createContext, useContext } from 'react'

// Create context for sharing state between components
export interface BookingContextType {
  currentStep: number
  formData: {
    selectedSport: string
    selectedPackage: string
    selectedCity: string
  }
  updateFormData: (stepData: Partial<BookingContextType['formData']>) => void
  nextStep: () => void
  previousStep: () => void
}

export const BookingContext = createContext<BookingContextType | undefined>(undefined)

export const useBooking = () => {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider')
  }
  return context
} 