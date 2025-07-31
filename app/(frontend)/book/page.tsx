'use client'

import React, { useState, useEffect } from 'react'
import SportsYouPreffer from './components/step1/sportsyoupreffer'
import PackageType from './components/step2/packagetype'
import DepartureCity from './components/step3/departurecity'
import Stepper from './components/stepper/stepper'
import { BookingContext, useBooking, BookingContextType } from './context/BookingContext'

// Component that uses the context (needs to be inside provider)
function BookingContent() {
  const { currentStep } = useBooking()

  const steps = [
    { id: 1, title: 'Sports Preference' },
    { id: 2, title: 'Package Type' },
    { id: 3, title: 'Departure City' },
    { id: 4, title: 'Total People' },
    { id: 5, title: 'Leagues' },
    { id: 6, title: 'Date Selection' },
    { id: 7, title: 'Flight Schedule' },
    { id: 8, title: 'Extras' },
    { id: 9, title: 'Personal Info' },
    { id: 10, title: 'Payment' }
  ]

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <SportsYouPreffer />
      case 1:
        return <PackageType />
      case 2:
        return <DepartureCity />
      default:
        return <SportsYouPreffer />
    }
  }

  return (
    <div className='flex'>
      {/* Fixed Sidebar */}
      <div className='sticky top-5 h-full w-[282px] mr-6'>
        <Stepper steps={steps} currentStep={currentStep} />
      </div>
      
      {/* Main Content */}
      <div className='flex-1'>
        {renderCurrentStep()}
      </div>
    </div>
  )
}

export default function BookPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    selectedSport: 'football',
    selectedPackage: 'standard',
    selectedCity: ''
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('bookingFormData')
    const savedStep = localStorage.getItem('bookingCurrentStep')
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setFormData(parsedData)
      } catch (error) {
        console.error('Error parsing saved form data:', error)
      }
    }
    
    if (savedStep) {
      try {
        const step = parseInt(savedStep, 10)
        if (step >= 0 && step <= 2) { // Only allow valid steps
          setCurrentStep(step)
        }
      } catch (error) {
        console.error('Error parsing saved step:', error)
      }
    }
  }, [])

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('bookingFormData', JSON.stringify(formData))
  }, [formData])

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bookingCurrentStep', currentStep.toString())
  }, [currentStep])

  const updateFormData = (stepData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
  }

  const nextStep = () => {
    if (currentStep < 2) { // Only allow up to step 2 (index 2 = step 3)
      setCurrentStep(prev => prev + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const contextValue: BookingContextType = {
    currentStep,
    formData,
    updateFormData,
    nextStep,
    previousStep
  }

  return (
    <BookingContext.Provider value={contextValue}>
      <BookingContent />
    </BookingContext.Provider>
  )
}
