'use client'
import React, { useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { useBooking } from '../../context/BookingContext'
import { paymentData } from '../../../../lib/appdata'

type PaymentMethod = 'credit' | 'google' | 'apple'

interface CreditCardFormData {
  nameOnCard: string
  cardNumber: string
  expiryDate: string
  cvv: string
}

interface PaymentFormData {
  paymentMethod: PaymentMethod
  creditCard: CreditCardFormData
}

// Get payment methods from centralized data
const PAYMENT_METHODS = {
  CREDIT: paymentData.paymentMethods[0].value,
  GOOGLE: paymentData.paymentMethods[1].value,
  APPLE: paymentData.paymentMethods[2].value,
} as const

export default function Payment() {
  const { formData, updateFormData, clearBookingData } = useBooking()
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Storage key for payment form data
  const STORAGE_KEY = paymentData.storage.key
  
  // Helper functions for localStorage
  const saveToStorage = useCallback((data: PaymentFormData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log('💾 Payment data saved to localStorage:', data)
    } catch (error) {
      console.error('Error saving payment data to localStorage:', error)
    }
  }, [STORAGE_KEY])
  
  const loadFromStorage = useCallback((): PaymentFormData | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('📂 Payment data loaded from localStorage:', parsed)
        return parsed
      }
      return null
    } catch (error) {
      console.error('Error loading payment data from localStorage:', error)
      return null
    }
  }, [STORAGE_KEY])
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { },
    clearErrors,
  } = useForm<PaymentFormData>({
    defaultValues: loadFromStorage() || {
      paymentMethod: PAYMENT_METHODS.CREDIT,
      creditCard: {
        nameOnCard: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
      },
    },
    mode: 'onChange',
  })

  const selectedPayment = watch('paymentMethod')
  const creditCardData = watch('creditCard')
  
  // Auto-save to localStorage whenever form values change
  React.useEffect(() => {
    const currentValues = {
      paymentMethod: selectedPayment,
      creditCard: creditCardData
    }
    saveToStorage(currentValues)
  }, [selectedPayment, creditCardData, saveToStorage])

  // Input formatting utilities using centralized functions
  const formatCardNumber = useCallback((value: string): string => {
    return paymentData.formatCardNumber(value)
  }, [])

  const formatExpiryDate = useCallback((value: string): string => {
    return paymentData.formatExpiryDate(value)
  }, [])

  const formatCvv = useCallback((value: string): string => {
    return paymentData.formatCvv(value)
  }, [])

  // Input handlers
  const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setValue('creditCard.cardNumber', formatted, { shouldValidate: true })
  }, [formatCardNumber, setValue])

  const handleExpiryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    setValue('creditCard.expiryDate', formatted, { shouldValidate: true })
  }, [formatExpiryDate, setValue])

  const handleCvvChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCvv(e.target.value)
    setValue('creditCard.cvv', formatted, { shouldValidate: true })
  }, [formatCvv, setValue])

  const handlePaymentMethodChange = useCallback((method: PaymentMethod) => {
    setValue('paymentMethod', method)
    if (method !== PAYMENT_METHODS.CREDIT) {
      clearErrors('creditCard')
    }
  }, [setValue, clearErrors])

  // Validation logic using centralized validation
  const isCreditCardValid = useMemo(() => {
    if (selectedPayment !== PAYMENT_METHODS.CREDIT) return true
    
    const validation = paymentData.validateCreditCard(creditCardData)
    return validation.isValid
  }, [selectedPayment, creditCardData])

  const isFormValid = useMemo(() => {
    return selectedPayment !== PAYMENT_METHODS.CREDIT ? true : isCreditCardValid
  }, [selectedPayment, isCreditCardValid])

  // Form submission
  const onSubmit = useCallback(async (data: PaymentFormData) => {
    if (!isFormValid) {
      console.log('❌ Form validation failed:', {
        selectedPayment,
        creditCardData,
        isCreditCardValid,
        formData: data
      })
      return
    }

    setIsProcessing(true)
    
    try {
      // Update booking context with payment info
      if (data.paymentMethod === PAYMENT_METHODS.CREDIT) {
        updateFormData({
          paymentInfo: {
            cardNumber: data.creditCard.cardNumber,
            expiryDate: data.creditCard.expiryDate,
            cvv: data.creditCard.cvv,
            cardholderName: data.creditCard.nameOnCard
          }
        })
      }

      // Process payment using centralized function
      const paymentResult = await paymentData.processPayment({
        method: data.paymentMethod,
        creditCard: data.paymentMethod === PAYMENT_METHODS.CREDIT ? data.creditCard : undefined,
        amount: formData.calculatedTotals?.totalCost || 0,
        currency: 'EUR',
        bookingId: `BK_${Date.now()}`
      })
      
      console.log('💳 Payment processed successfully:', paymentResult)
      
      // Helper function to convert minutes to time format
      const minutesToTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60) % 24
        const mins = minutes % 60
        const nextDay = minutes >= 1440 ? '(+1)' : ''
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}${nextDay}`
      }
      
      // Log complete booking data in detailed format
      const completeBookingData = {
        // Step 1: Sports Preference
        selectedSport: formData.selectedSport,
        
        // Step 2: Package Type
        selectedPackage: formData.selectedPackage,
        
        // Step 3: Departure City
        selectedCity: formData.selectedCity,
        
        // Step 4: People Count
        peopleCount: {
          adults: formData.peopleCount.adults,
          kids: formData.peopleCount.kids,
          babies: formData.peopleCount.babies,
          total: formData.peopleCount.adults + formData.peopleCount.kids + formData.peopleCount.babies
        },
        
        // Step 5: League Selection
        selectedLeague: formData.selectedLeague,
        
        // Step 5.5: Removed Leagues (if European Competition was selected)
        removedLeagues: {
          count: formData.removedLeagues?.length || 0,
          leagues: formData.removedLeagues || [],
          hasRemovedLeagues: (formData.removedLeagues?.length || 0) > 0
        },
        
        // Step 6: Date Selection
        travelDates: {
          departureDate: formData.departureDate ? new Date(formData.departureDate).toLocaleDateString() : 'Not selected',
          returnDate: formData.returnDate ? new Date(formData.returnDate).toLocaleDateString() : 'Not selected',
          departureDateRaw: formData.departureDate,
          returnDateRaw: formData.returnDate
        },
        
        // Step 7: Flight Schedule
        flightSchedule: formData.flightSchedule ? {
          departure: {
            startTime: minutesToTime(formData.flightSchedule.departure.start),
            endTime: minutesToTime(formData.flightSchedule.departure.end),
            startMinutes: formData.flightSchedule.departure.start,
            endMinutes: formData.flightSchedule.departure.end
          },
          arrival: {
            startTime: minutesToTime(formData.flightSchedule.arrival.start),
            endTime: minutesToTime(formData.flightSchedule.arrival.end),
            startMinutes: formData.flightSchedule.arrival.start,
            endMinutes: formData.flightSchedule.arrival.end
          }
        } : 'Not selected',
        
        // Step 8: Extras
        extras: {
          allExtras: formData.extras,
          selectedExtras: formData.extras.filter(extra => extra.isSelected),
          selectedExtrasCount: formData.extras.filter(extra => extra.isSelected).length,
          totalExtrasCost: formData.extras
            .filter(extra => extra.isSelected && !extra.isIncluded)
            .reduce((total, extra) => total + (extra.price * extra.quantity), 0)
        },
        
        // Step 9: Personal Information
        personalInfo: {
          firstName: formData.personalInfo.firstName,
          lastName: formData.personalInfo.lastName,
          email: formData.personalInfo.email,
          phone: formData.personalInfo.phone
        },
        
        // Step 10: Payment Information
        paymentMethod: data.paymentMethod,
        paymentInfo: data.paymentMethod === PAYMENT_METHODS.CREDIT ? {
          cardNumber: data.creditCard.cardNumber,
          expiryDate: data.creditCard.expiryDate,
          cvv: data.creditCard.cvv,
          cardholderName: data.creditCard.nameOnCard
        } : 'Alternative payment method selected',
        
        // Summary Information
        summary: {
          totalPeople: formData.peopleCount.adults + formData.peopleCount.kids + formData.peopleCount.babies,
          totalExtrasSelected: formData.extras.filter(extra => extra.isSelected).length,
          totalExtrasCost: formData.extras
            .filter(extra => extra.isSelected && !extra.isIncluded)
            .reduce((total, extra) => total + (extra.price * extra.quantity), 0),
          bookingComplete: true,
          timestamp: new Date().toISOString()
        }
      }

      
      console.log('=== FINAL BOOKING SUBMISSION ===')
      console.log('🎯 COMPLETE BOOKING DATA (ALL STEPS):')
      console.log(completeBookingData)
      console.log('')
      console.log('📋 STEP-BY-STEP BREAKDOWN:')
      console.log('📍 Step 1 - Selected Sport:', completeBookingData.selectedSport)
      console.log('📦 Step 2 - Package Type:', completeBookingData.selectedPackage)
      console.log('🏙️ Step 3 - Departure City:', completeBookingData.selectedCity)
      console.log('👥 Step 4 - People Count:', completeBookingData.peopleCount)
      console.log('🏆 Step 5 - Selected League:', completeBookingData.selectedLeague)
      if (completeBookingData.removedLeagues.hasRemovedLeagues) {
        console.log('🚫 Step 5.5 - Removed Leagues:', completeBookingData.removedLeagues)
      }
      console.log('📅 Step 6 - Travel Dates:', completeBookingData.travelDates)
      console.log('✈️ Step 7 - Flight Schedule:', completeBookingData.flightSchedule)
      console.log('🛍️ Step 8 - Extras:', completeBookingData.extras)
      console.log('👤 Step 9 - Personal Info:', completeBookingData.personalInfo)
      console.log('💳 Step 10 - Payment Method:', completeBookingData.paymentMethod)
      if (data.paymentMethod === PAYMENT_METHODS.CREDIT) {
        console.log('💳 Payment Details:', completeBookingData.paymentInfo)
      }
      console.log('')
      console.log('📊 BOOKING SUMMARY:', completeBookingData.summary)
      console.log('================================')
      
      // ========================================
      // SINGLE COMPREHENSIVE OBJECT FOR DATABASE
      // ========================================
      const singleFormDataObject = {
        // Basic Information
        selectedSport: formData.selectedSport,
        selectedPackage: formData.selectedPackage,
        selectedCity: formData.selectedCity,
        selectedLeague: formData.selectedLeague,
        
        // People Count
        adults: formData.peopleCount.adults,
        kids: formData.peopleCount.kids,
        babies: formData.peopleCount.babies,
        totalPeople: formData.peopleCount.adults + formData.peopleCount.kids + formData.peopleCount.babies,
        
        // Dates (both formatted and raw)
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        departureDateFormatted: formData.departureDate ? new Date(formData.departureDate).toLocaleDateString() : null,
        returnDateFormatted: formData.returnDate ? new Date(formData.returnDate).toLocaleDateString() : null,
        
        // Flight Schedule
        departureTimeStart: formData.flightSchedule?.departure.start || null,
        departureTimeEnd: formData.flightSchedule?.departure.end || null,
        arrivalTimeStart: formData.flightSchedule?.arrival.start || null,
        arrivalTimeEnd: formData.flightSchedule?.arrival.end || null,
        departureTimeRange: formData.flightSchedule ? `${minutesToTime(formData.flightSchedule.departure.start)} - ${minutesToTime(formData.flightSchedule.departure.end)}` : null,
        arrivalTimeRange: formData.flightSchedule ? `${minutesToTime(formData.flightSchedule.arrival.start)} - ${minutesToTime(formData.flightSchedule.arrival.end)}` : null,
        
        // Removed Leagues
        removedLeagues: formData.removedLeagues || [],
        removedLeaguesCount: formData.removedLeagues?.length || 0,
        hasRemovedLeagues: (formData.removedLeagues?.length || 0) > 0,
        
        // Extras
        allExtras: formData.extras,
        selectedExtras: formData.extras.filter(extra => extra.isSelected),
        selectedExtrasNames: formData.extras.filter(extra => extra.isSelected).map(extra => extra.name),
        totalExtrasCost: formData.extras
          .filter(extra => extra.isSelected && !extra.isIncluded)
          .reduce((total, extra) => total + (extra.price * extra.quantity), 0),
        extrasCount: formData.extras.filter(extra => extra.isSelected).length,
        
        // Personal Information
        firstName: formData.personalInfo.firstName,
        lastName: formData.personalInfo.lastName,
        fullName: `${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`.trim(),
        email: formData.personalInfo.email,
        phone: formData.personalInfo.phone,
        
        // Payment Information
        paymentMethod: data.paymentMethod,
        cardNumber: data.paymentMethod === PAYMENT_METHODS.CREDIT ? data.creditCard.cardNumber : null,
        expiryDate: data.paymentMethod === PAYMENT_METHODS.CREDIT ? data.creditCard.expiryDate : null,
        cvv: data.paymentMethod === PAYMENT_METHODS.CREDIT ? data.creditCard.cvv : null,
        cardholderName: data.paymentMethod === PAYMENT_METHODS.CREDIT ? data.creditCard.nameOnCard : null,
        
        // Metadata
        bookingTimestamp: new Date().toISOString(),
        bookingDate: new Date().toLocaleDateString(),
        bookingTime: new Date().toLocaleTimeString(),
        isBookingComplete: true,
        
        // Calculated Fields
        travelDuration: formData.departureDate && formData.returnDate ? 
          Math.ceil((new Date(formData.returnDate).getTime() - new Date(formData.departureDate).getTime()) / (1000 * 60 * 60 * 24)) + 1 : null,
        hasFlightPreferences: formData.flightSchedule !== null,
        requiresEuropeanLeagueHandling: formData.selectedLeague === 'european'
      }
      
      console.log('')
      console.log('🎯 ===== SINGLE COMPREHENSIVE DATA OBJECT =====')
      console.log('📦 Ready for Database/API - All form data in one object:')
      console.log(singleFormDataObject)
      console.log('===============================================')
      console.log('')
      
      // Also create a JSON string version for easy copy-paste
      console.log('📋 JSON STRING VERSION (for API calls):')
      console.log(JSON.stringify(singleFormDataObject, null, 2))
      console.log('===============================================')
      
      if (data.paymentMethod === PAYMENT_METHODS.CREDIT) {
        console.log('Processing credit card payment...', data.creditCard)
      } else {
        console.log(`Processing ${data.paymentMethod} payment...`)
      }
      
      console.log('')
      console.log('🎉 ===== PAYMENT SUCCESSFUL =====')
      console.log('✅ Booking completed with ALL collected data:')
      console.log(`✅ ${completeBookingData.selectedSport} sport`)
      console.log(`✅ ${completeBookingData.selectedPackage} package`)  
      console.log(`✅ ${completeBookingData.selectedCity} departure`)
      console.log(`✅ ${completeBookingData.peopleCount.total} people total`)
      console.log(`✅ ${completeBookingData.selectedLeague} league`)
      if (completeBookingData.removedLeagues.hasRemovedLeagues) {
        console.log(`🚫 ${completeBookingData.removedLeagues.count} leagues removed`)
      }
      console.log('✅ Flight times and extras selected')
      console.log('✅ Complete personal & payment info')
      console.log('')
      console.log('📊 Check console above for COMPLETE booking details!')
      console.log('🧹 All booking data will be cleared from storage automatically.')
      console.log('===============================================')
      console.log('')
      
      // ========================================
      // SAVE BOOKING DATA TO APPDATA BEFORE CLEANUP
      // ========================================
      
      console.log('💾 Saving booking data to AppData...')
      
      try {
        // Import AppData dynamically to avoid SSR issues
        const { default: AppData } = await import('../../../../lib/appdata')
        
        // Create booking object with status using the correct data structure
        const newBooking = {
          status: "pending" as const,
          selectedSport: singleFormDataObject.selectedSport,
          selectedPackage: singleFormDataObject.selectedPackage,
          selectedCity: singleFormDataObject.selectedCity,
          selectedLeague: singleFormDataObject.selectedLeague,
          adults: singleFormDataObject.adults,
          kids: singleFormDataObject.kids,
          babies: singleFormDataObject.babies,
          totalPeople: singleFormDataObject.totalPeople,
          departureDate: singleFormDataObject.departureDate || "",
          returnDate: singleFormDataObject.returnDate || "",
          departureDateFormatted: singleFormDataObject.departureDateFormatted || "",
          returnDateFormatted: singleFormDataObject.returnDateFormatted || "",
          departureTimeStart: singleFormDataObject.departureTimeStart || 0,
          departureTimeEnd: singleFormDataObject.departureTimeEnd || 0,
          arrivalTimeStart: singleFormDataObject.arrivalTimeStart || 0,
          arrivalTimeEnd: singleFormDataObject.arrivalTimeEnd || 0,
          departureTimeRange: singleFormDataObject.departureTimeRange || "",
          arrivalTimeRange: singleFormDataObject.arrivalTimeRange || "",
          removedLeagues: Array.isArray(singleFormDataObject.removedLeagues) ? 
            singleFormDataObject.removedLeagues.map(league => league.id || league.name || "") : [],
          removedLeaguesCount: singleFormDataObject.removedLeaguesCount || 0,
          hasRemovedLeagues: singleFormDataObject.hasRemovedLeagues || false,
          allExtras: singleFormDataObject.allExtras.map(extra => ({
            ...extra,
            currency: "EUR"
          })),
          selectedExtras: singleFormDataObject.selectedExtras.map(extra => ({
            ...extra,
            currency: "EUR"
          })),
          selectedExtrasNames: singleFormDataObject.selectedExtrasNames,
          totalExtrasCost: singleFormDataObject.totalExtrasCost,
          extrasCount: singleFormDataObject.extrasCount,
          firstName: singleFormDataObject.firstName,
          lastName: singleFormDataObject.lastName,
          fullName: singleFormDataObject.fullName,
          email: singleFormDataObject.email,
          phone: singleFormDataObject.phone,
          paymentMethod: selectedPayment,
          cardNumber: singleFormDataObject.cardNumber,
          expiryDate: singleFormDataObject.expiryDate,
          cvv: singleFormDataObject.cvv,
          cardholderName: singleFormDataObject.cardholderName,
          bookingTimestamp: new Date().toISOString(),
          bookingDate: new Date().toLocaleDateString('en-US'),
          bookingTime: new Date().toLocaleTimeString('en-US'),
          isBookingComplete: true,
          travelDuration: singleFormDataObject.travelDuration || 0,
          hasFlightPreferences: singleFormDataObject.hasFlightPreferences || false,
          requiresEuropeanLeagueHandling: singleFormDataObject.requiresEuropeanLeagueHandling || false
        }
        
        // Add to AppData
        const savedBooking = AppData.bookings.add(newBooking)
        console.log('✅ Booking saved to AppData:', savedBooking)
        
      } catch (error) {
        console.error('❌ Error saving booking to AppData:', error)
      }
      
      // ========================================
      // COMPLETE DATA CLEANUP AFTER SUCCESSFUL BOOKING
      // ========================================
      
      console.log('🧹 Starting complete data cleanup...')
      
      // 1. Clear localStorage completely
      if (typeof window !== 'undefined') {
        // Remove specific booking keys
        localStorage.removeItem('gogame_booking_data')
        localStorage.removeItem('gogame_booking_step')
        localStorage.removeItem(STORAGE_KEY) // Clear payment data
        
        // Remove any other potential booking-related keys (if any exist)
        const bookingKeys = Object.keys(localStorage).filter(key => 
          key.toLowerCase().includes('booking') || 
          key.toLowerCase().includes('gogame') ||
          key.toLowerCase().includes('form')
        )
        
        bookingKeys.forEach(key => {
          localStorage.removeItem(key)
        })
        
        console.log('✅ localStorage cleared:', ['gogame_booking_data', 'gogame_booking_step', STORAGE_KEY, ...bookingKeys])
      }
      
      // 2. Clear BookingContext state
      clearBookingData()
      console.log('✅ BookingContext state cleared')
      
      // 3. Reset to step 1 for next booking
      console.log('✅ Stepper reset to Step 1')
      
      console.log('🎉 Complete cleanup finished! Ready for next booking.')
      
      // Small delay to ensure all cleanup is processed
      setTimeout(() => {
        console.log('🔄 System ready for new booking!')
      }, 1000)
      
    } catch (error) {
      console.error('❌ Payment processing failed:', error)
      console.log('💥 Payment Error Details:', {
        error: error,
        errorMessage: paymentData.text.errorMessage,
        formData: data,
        selectedPayment,
        creditCardData
      })
    } finally {
      setIsProcessing(false)
    }
  }, [isFormValid, updateFormData, formData, clearBookingData, STORAGE_KEY, selectedPayment, creditCardData, isCreditCardValid])

  // Payment method option component
  const PaymentMethodOption = useCallback(({ 
    method, 
    label, 
    icon 
  }: { 
    method: PaymentMethod
    label: string
    icon: React.ReactNode
  }) => {
    const isSelected = selectedPayment === method
    
    return (
      <div 
        className={`self-stretch p-3 md:p-4 rounded outline-1 outline-offset-[-1px] ${
          isSelected ? 'outline-[#76C043] bg-lime-50' : 'outline-gray-200'
        } flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 cursor-pointer transition-all duration-200`}
        onClick={() => handlePaymentMethodChange(method)}
      >
        <div className="flex justify-start items-center gap-2.5">
          <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 ${
            isSelected ? 'border-[#76C043] bg-[#76C043]' : 'border-gray-300'
          } flex items-center justify-center`}>
            {isSelected && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />}
          </div>
          <div className="justify-center text-black text-base md:text-lg font-medium font-['Poppins'] leading-loose">
            {label}
          </div>
        </div>
        <div className="ml-7 md:ml-0">
          {icon}
        </div>
      </div>
    )
  }, [selectedPayment, handlePaymentMethodChange])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full xl:w-[894px] px-4 md:px-5 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-4 md:gap-6 min-h-[600px] xl:min-h-0">
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
            <div className="justify-center text-neutral-800 text-xl md:text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-7 md:leading-8 xl:leading-10">
              {paymentData.text.title}
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-6">
            <div className="self-stretch px-4 md:px-5 py-5 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <div className="justify-start text-neutral-800 text-base md:text-lg font-semibold font-['Poppins'] leading-loose">
                  {paymentData.text.paymentMethodTitle}
                </div>
              </div>
              
              {/* Credit Card Option */}
              <div 
                className={`self-stretch p-3 md:p-4 rounded-lg outline-1 outline-offset-[-1px] ${
                  selectedPayment === PAYMENT_METHODS.CREDIT ? 'outline-[#76C043] bg-lime-50' : 'outline-gray-200'
                } flex flex-col justify-start items-start gap-4 md:gap-5 cursor-pointer transition-all duration-200`}
                onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.CREDIT)}
              >
                <div className="self-stretch py-3 md:py-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                  <div className="flex justify-start items-center gap-2.5">
                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 ${
                      selectedPayment === PAYMENT_METHODS.CREDIT ? 'border-[#6AAD3C] bg-[#6AAD3C]' : 'border-gray-300'
                    } flex items-center justify-center`}>
                      {selectedPayment === PAYMENT_METHODS.CREDIT && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />}
                    </div>
                    <div className="justify-center text-black text-base md:text-lg font-medium font-['Poppins'] leading-loose">
                      {paymentData.text.creditCardTitle}
                    </div>
                  </div>
                  <div className="flex justify-start items-center gap-2 md:gap-3 ml-7 md:ml-0">
                    <div className="w-14 md:w-16 p-1.5 md:p-2 bg-white rounded-[2.92px] outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                      <Image src="/stepper/icon/visa.png" alt="Visa" className="h-auto w-full" width={55} height={17} />
                    </div>
                    <div className="w-14 md:w-16 h-7 md:h-8 p-1.5 md:p-2 bg-white rounded-[2.91px] outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                      <Image src="/stepper/icon/mastercard.png" alt="Mastercard" className="h-5 md:h-6 w-auto" width={40} height={25} />
                    </div>
                  </div>
                </div>
                
                {/* Credit Card Form - Only show when credit card is selected */}
                {selectedPayment === PAYMENT_METHODS.CREDIT && (
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-5">
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                      {/* Name on Card - Full width on mobile, split on desktop */}
                      <div className="self-stretch flex flex-col md:flex-row justify-start items-start gap-4 md:gap-6">
                        <div className="w-full md:flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            {paymentData.text.nameOnCardLabel}
                          </div>
                          <input
                            {...register('creditCard.nameOnCard', {
                              required: selectedPayment === PAYMENT_METHODS.CREDIT,
                              minLength: 1
                            })}
                            type="text"
                            placeholder={paymentData.text.nameOnCardPlaceholder}
                            className="self-stretch h-12 md:h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C]"
                          />
                        </div>
                        <div className="w-full md:flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            {paymentData.text.expiryLabel}
                          </div>
                          <input
                            type="text"
                            value={creditCardData.expiryDate}
                            onChange={handleExpiryChange}
                            placeholder={paymentData.text.expiryPlaceholder}
                            maxLength={paymentData.creditCard.validation.expiryFormat.length}
                            className="self-stretch h-12 md:h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#76C043]"
                          />
                        </div>
                      </div>
                      {/* Card Number - Full width on mobile, split with CVV on desktop */}
                      <div className="self-stretch flex flex-col md:flex-row justify-start items-start gap-4">
                        <div className="w-full md:flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            {paymentData.text.cardNumberLabel}
                          </div>
                          <input
                            type="text"
                            value={creditCardData.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder={paymentData.text.cardNumberPlaceholder}
                            maxLength={19}
                            className="self-stretch h-12 md:h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C]"
                          />
                        </div>
                        <div className="w-full md:w-32 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-relaxed">
                            {paymentData.text.cvvLabel}
                          </div>
                          <input
                            type="text"
                            value={creditCardData.cvv}
                            onChange={handleCvvChange}
                            placeholder={paymentData.text.cvvPlaceholder}
                            maxLength={paymentData.creditCard.validation.cvvMaxLength}
                            className="self-stretch h-12 md:h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Google Pay Option */}
              <PaymentMethodOption
                method={PAYMENT_METHODS.GOOGLE}
                label={paymentData.paymentMethods[1].label}
                icon={
                  <div className="flex justify-start items-center gap-2.5">
                    <div className="p-1.5 md:p-2 rounded inline-flex flex-col justify-start items-start gap-2  mr-2">
                      <Image src="/stepper/icon/gpay.png" alt="Google Pay" className="h-4 md:h-6 w-auto scale-250" width={91} height={17} />
                    </div>
                  </div>
                }
              />
              
              {/* Apple Pay Option */}
              <PaymentMethodOption
                method={PAYMENT_METHODS.APPLE}
                label={paymentData.paymentMethods[2].label}
                icon={
                  <div className="w-16 md:w-20 flex justify-start items-center gap-2.5">
                    <div className="flex-1 p-1.5 md:p-2 rounded inline-flex flex-col justify-center items-center gap-2">
                      <Image src="/stepper/icon/apay.png" alt="Apple Pay" className="h-4 md:h-6 w-auto" width={41} height={17} />
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
        
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch flex flex-col justify-start items-start gap-4 md:gap-6">
            <button 
              type="submit"
              disabled={isProcessing || !isFormValid}
              className={`w-full md:w-44 h-12 md:h-11 px-4 md:px-3.5 py-3 md:py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all duration-200 ${
                isProcessing || !isFormValid 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-[#6AAD3C] hover:bg-lime-600 cursor-pointer'
              }`}
            >
              <div className="text-center justify-start text-white text-sm md:text-base font-medium md:font-normal font-['Inter']">
                {isProcessing ? paymentData.text.processingButton : paymentData.text.confirmButton}
              </div>
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
