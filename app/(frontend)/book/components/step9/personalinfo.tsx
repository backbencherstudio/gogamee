'use client'

import Image from 'next/image'
import React, { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FaPlane } from 'react-icons/fa'
import { useBooking } from '../../context/BookingContext'
import { personalInfoData, pricing, flightScheduleData, leaguePricingData } from '../../../../lib/appdata'

// Utility functions for dynamic data calculation
const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const nextDay = minutes >= 1440 ? '(+1)' : ''
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}${nextDay}`
}

const calculateDuration = (departureDate: string, returnDate: string): number => {
  if (!departureDate || !returnDate) return 0
  const start = new Date(departureDate)
  const end = new Date(returnDate)
  const diffTime = end.getTime() - start.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

const calculateBasePrice = (sport: string, packageType: string, nights: number): number => {
  if (!sport || !packageType || !nights) return 0
  
  const validSport = sport as 'football' | 'basketball'
  const validPackage = packageType as 'standard' | 'premium'
  
  return pricing.getPrice(validSport, validPackage, nights)
}

const calculateExtrasCost = (extras: Array<{
  isSelected: boolean
  isIncluded?: boolean
  price: number
  quantity: number
}>): number => {
  if (!extras || !Array.isArray(extras)) return 0
  
  return extras
    .filter(extra => extra.isSelected && !extra.isIncluded)
    .reduce((total, extra) => total + (extra.price * extra.quantity), 0)
}

const calculateFlightScheduleCost = (flightSchedule: {
  departure: { start: number; end: number }
  arrival: { start: number; end: number }
} | null): number => {
  if (!flightSchedule) return 0
  
  const departureCost = flightScheduleData.calculatePriceFromDefault(
    flightSchedule.departure, 
    true
  )
  const arrivalCost = flightScheduleData.calculatePriceFromDefault(
    flightSchedule.arrival, 
    false
  )
  
  return departureCost + arrivalCost
}

const calculateLeagueCost = (selectedLeague: string): number => {
  if (!selectedLeague) return 0
  return leaguePricingData.getLeagueAdditionalCost(selectedLeague)
}

interface TravelerInfo {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  documentType: 'ID' | 'Passport'
  documentNumber: string
}

interface PersonalInfoFormData {
  primaryTraveler: TravelerInfo
  extraTraveler: TravelerInfo
  paymentMethod: 'credit' | 'google' | 'apple'
}

const defaultTravelerInfo: TravelerInfo = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  documentType: 'ID',
  documentNumber: ''
}

const PaymentMethodCard: React.FC<{
  value: 'credit' | 'google' | 'apple'
  selectedValue: 'credit' | 'google' | 'apple'
  onChange: (value: 'credit' | 'google' | 'apple') => void
  label: string
  children: React.ReactNode
}> = ({ value, selectedValue, onChange, label, children }) => {
  const isSelected = selectedValue === value
  
  return (
    <div 
      className={`self-stretch p-3 md:p-4 rounded outline-1 outline-offset-[-1px] ${
        isSelected ? 'outline-[#6AAD3C] bg-lime-50' : 'outline-gray-200'
      } flex flex-col md:inline-flex md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 cursor-pointer`}
      onClick={() => onChange(value)}
    >
      <div className="flex justify-start items-center gap-2.5">
        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 ${
          isSelected ? 'border-[#6AAD3C] bg-[#6AAD3C]' : 'border-gray-300'
        } flex items-center justify-center`}>
          {isSelected && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />}
        </div>
        <div className="justify-center text-black text-base md:text-lg font-medium font-['Poppins'] leading-loose">
          {label}
        </div>
      </div>
      <div className="ml-7 md:ml-0">
        {children}
      </div>
    </div>
  )
}

const FormInput: React.FC<{
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  error?: string
}> = ({ label, type = 'text', placeholder, value, onChange, className = '', error }) => (
  <div className={`flex-1 inline-flex flex-col justify-start items-start gap-2 ${className}`}>
    <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
      {label}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`self-stretch h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 w-full ${
        error ? 'outline-red-500' : 'outline-zinc-200 focus:outline-[#6AAD3C]'
      }`}
    />
    {error && (
      <div className="text-red-500 text-sm font-normal font-['Poppins']">
        {error}
      </div>
    )}
  </div>
)

const DocumentTypeRadio: React.FC<{
  id: string
  name: string
  value: 'ID' | 'Passport'
  selectedValue: 'ID' | 'Passport'
  onChange: (value: 'ID' | 'Passport') => void
  label: string
}> = ({ id, name, value, selectedValue, onChange, label }) => (
  <div className="inline-flex justify-start items-center gap-2">
    <input
      type="radio"
      id={id}
      name={name}
      checked={selectedValue === value}
      onChange={() => onChange(value)}
      className="w-5 h-5"
    />
    <label htmlFor={id} className="justify-start text-neutral-800 text-base font-normal font-['Poppins'] leading-relaxed cursor-pointer">
      {label}
    </label>
  </div>
)

const STORAGE_KEY = personalInfoData.storage.key

// Helper functions for localStorage
const saveToStorage = (data: PersonalInfoFormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    console.log('💾 Saved to localStorage:', data)
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

const loadFromStorage = (): PersonalInfoFormData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      console.log('📂 Loaded from localStorage:', parsed)
      return parsed
    }
    return null
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}

export default function Personalinfo() {
  const { updateFormData, nextStep, formData } = useBooking()
  
  // Check if we have people count data from howmanytotal page
  const hasMultipleTravelers = formData.peopleCount && 
    (formData.peopleCount.adults > 1 || formData.peopleCount.kids > 0 || formData.peopleCount.babies > 0)
  
  // Calculate dynamic reservation data from all previous steps
  const reservationData = useMemo(() => {
    const totalPeople = formData.peopleCount ? 
      formData.peopleCount.adults + formData.peopleCount.kids + formData.peopleCount.babies : 0
    
    const duration = calculateDuration(formData.departureDate || '', formData.returnDate || '')
    const nights = Math.max(0, duration - 1)
    
    const basePrice = calculateBasePrice(
      formData.selectedSport || '', 
      formData.selectedPackage || '', 
      nights
    )
    
    const extrasCost = calculateExtrasCost(formData.extras || [])
    const flightScheduleCost = calculateFlightScheduleCost(formData.flightSchedule)
    const leagueCost = calculateLeagueCost(formData.selectedLeague || '')
    
    // Calculate package total (base price × total people)
    const packageTotal = basePrice * totalPeople
    
    // Calculate extras total (extras cost is fixed for the entire group, not per person)
    const extrasTotal = extrasCost
    
    // Calculate flight schedule total (flight schedule cost × total people)
    const flightScheduleTotal = flightScheduleCost * totalPeople
    
    // Calculate league total (league cost × total people)
    const leagueTotal = leagueCost * totalPeople
    
    // Calculate grand total
    const grandTotal = packageTotal + extrasTotal + flightScheduleTotal + leagueTotal
    
    return {
      departureCity: formData.selectedCity || 'Barcelona',
      departureDate: formatDate(formData.departureDate || ''),
      returnDate: formatDate(formData.returnDate || ''),
      duration,
      nights,
      basePrice,
      extrasCost,
      flightScheduleCost,
      leagueCost,
      packageTotal,
      extrasTotal,
      flightScheduleTotal,
      leagueTotal,
      grandTotal,
      totalPeople,
      departureTimeRange: formData.flightSchedule ? 
        `${formatTime(formData.flightSchedule.departure.start)} - ${formatTime(formData.flightSchedule.departure.end)}` : '',
      arrivalTimeRange: formData.flightSchedule ? 
        `${formatTime(formData.flightSchedule.arrival.start)} - ${formatTime(formData.flightSchedule.arrival.end)}` : ''
    }
  }, [formData])
  
  // Debug: Log the reservation data
  useEffect(() => {
    console.log('🎯 PersonalInfo - People Count Data:', formData.peopleCount)
    console.log('🎯 PersonalInfo - Has Multiple Travelers:', hasMultipleTravelers)
    console.log('🎯 PersonalInfo - Reservation Data:', reservationData)
    
    // Debug calculation breakdown
    if (formData.extras && formData.extras.length > 0) {
      console.log('🔍 Extras Breakdown:')
      formData.extras.forEach((extra, index) => {
        if (extra.isSelected && !extra.isIncluded) {
          console.log(`  - ${extra.name}: ${extra.price}€ × ${extra.quantity} = ${(extra.price * extra.quantity).toFixed(2)}€`)
        }
      })
      console.log(`  Total Extras Cost: ${reservationData.extrasCost.toFixed(2)}€`)
      console.log(`  Extras Total (×${reservationData.totalPeople}): ${reservationData.extrasTotal.toFixed(2)}€`)
    }
    
         console.log(`💰 Final Calculation:`)
     console.log(`  Package: ${reservationData.basePrice}€ × ${reservationData.totalPeople} = ${reservationData.packageTotal.toFixed(2)}€`)
     console.log(`  Extras: ${reservationData.extrasCost}€ (fixed for group) = ${reservationData.extrasTotal.toFixed(2)}€`)
     console.log(`  Flight Schedule: ${reservationData.flightScheduleCost}€ × ${reservationData.totalPeople} = ${reservationData.flightScheduleTotal.toFixed(2)}€`)
     console.log(`  League: ${reservationData.leagueCost}€ × ${reservationData.totalPeople} = ${reservationData.leagueTotal.toFixed(2)}€`)
     console.log(`  Grand Total: ${reservationData.grandTotal.toFixed(2)}€`)
  }, [formData.peopleCount, hasMultipleTravelers, reservationData, formData.extras])
  
  // Load initial data from localStorage or use defaults
  const getInitialValues = (): PersonalInfoFormData => {
    const savedData = loadFromStorage()
    const initialValues = savedData || {
      primaryTraveler: defaultTravelerInfo,
      extraTraveler: hasMultipleTravelers ? defaultTravelerInfo : { ...defaultTravelerInfo, name: '', email: '', phone: '', dateOfBirth: '', documentType: 'ID', documentNumber: '' },
      paymentMethod: 'credit'
    }
    console.log('🎯 Initial form values:', initialValues)
    return initialValues
  }
  
  const { control, handleSubmit, watch, getValues, formState: { errors } } = useForm<PersonalInfoFormData>({
    defaultValues: getInitialValues(),
    mode: 'onBlur'
  })

  // Watch all form values for auto-save
  const watchedValues = watch()

  // Auto-save to localStorage whenever form values change
  useEffect(() => {
    const currentValues = getValues()
    saveToStorage(currentValues)
  }, [watchedValues, getValues])

  // Also save when form data changes to ensure all updates are captured
  useEffect(() => {
    const currentValues = getValues()
    if (currentValues.primaryTraveler.name || 
        currentValues.primaryTraveler.email || 
        currentValues.primaryTraveler.phone || 
        currentValues.primaryTraveler.dateOfBirth || 
        currentValues.primaryTraveler.documentType || 
        currentValues.primaryTraveler.documentNumber) {
      saveToStorage(currentValues)
    }
  }, [formData, getValues])


  const onSubmit = (data: PersonalInfoFormData) => {
    console.log('Form Data:', data)
    console.log('Reservation Data:', reservationData)
    
    // Update booking context with personal info and calculated totals
    updateFormData({
      personalInfo: {
        firstName: data.primaryTraveler.name.split(' ')[0] || '',
        lastName: data.primaryTraveler.name.split(' ').slice(1).join(' ') || '',
        email: data.primaryTraveler.email,
        phone: data.primaryTraveler.phone
      },
             // Add calculated totals for the next step
       calculatedTotals: {
         basePrice: reservationData.basePrice,
         extrasCost: reservationData.extrasCost,
         flightScheduleCost: reservationData.flightScheduleCost,
         leagueCost: reservationData.leagueCost,
         totalCost: reservationData.grandTotal,
         totalPeople: reservationData.totalPeople,
         duration: reservationData.duration,
         nights: reservationData.nights
       }
    })
    
    // Clear localStorage after successful submission
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
    
    // Move to next step
    nextStep()
  }





  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full max-w-[894px] px-3 md:px-4 xl:px-6 py-4 md:py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-4 md:gap-6 min-h-[600px] xl:min-h-0">
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
                         <div className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
               {personalInfoData.text.title}
             </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              
              {/* Primary Traveler Information */}
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex flex-col justify-start items-start gap-5">
                  <div className="self-stretch inline-flex justify-start items-center gap-2">
                                         <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                       {personalInfoData.text.primaryTravelerTitle}
                     </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                                             <Controller
                         name="primaryTraveler.name"
                         control={control}
                         rules={{ required: 'Traveler name is required' }}
                         render={({ field }) => (
                                                      <FormInput
                              label={personalInfoData.formFields.travelerName.label}
                              placeholder={personalInfoData.formFields.travelerName.placeholder}
                              value={field.value}
                              onChange={field.onChange}
                              error={errors.primaryTraveler?.name?.message}
                            />
                         )}
                       />
                                             <Controller
                         name="primaryTraveler.email"
                         control={control}
                         rules={{ 
                           required: 'Email is required',
                           pattern: {
                             value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                             message: 'Invalid email address'
                           }
                         }}
                         render={({ field }) => (
                                                      <FormInput
                              label={personalInfoData.formFields.email.label}
                              type="email"
                              placeholder={personalInfoData.formFields.email.placeholder}
                              value={field.value}
                              onChange={field.onChange}
                              error={errors.primaryTraveler?.email?.message}
                            />
                         )}
                       />
                    </div>
                    <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                                             <Controller
                         name="primaryTraveler.phone"
                         control={control}
                         rules={{ required: 'Phone number is required' }}
                         render={({ field }) => (
                                                      <FormInput
                              label={personalInfoData.formFields.phone.label}
                              type="tel"
                              placeholder={personalInfoData.formFields.phone.placeholder}
                              value={field.value}
                              onChange={field.onChange}
                              error={errors.primaryTraveler?.phone?.message}
                            />
                         )}
                       />
                                             <Controller
                         name="primaryTraveler.dateOfBirth"
                         control={control}
                         rules={{ required: 'Date of birth is required' }}
                         render={({ field }) => (
                           <FormInput
                             label={personalInfoData.formFields.dateOfBirth.label}
                             type="date"
                             value={field.value}
                             onChange={field.onChange}
                             error={errors.primaryTraveler?.dateOfBirth?.message}
                           />
                         )}
                       />
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch flex flex-col justify-center items-start gap-4">
                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                          <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                            {personalInfoData.formFields.documentType.label}
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                                     <Controller
                             name="primaryTraveler.documentType"
                             control={control}
                             rules={{ required: 'Document type is required' }}
                             render={({ field }) => (
                               <>
                                 <DocumentTypeRadio
                                   id="primaryID"
                                   name="primaryDocType"
                                   value="ID"
                                   selectedValue={field.value}
                                   onChange={field.onChange}
                                   label={personalInfoData.formFields.documentType.id}
                                 />
                                 <DocumentTypeRadio
                                   id="primaryPassport"
                                   name="primaryDocType"
                                   value="Passport"
                                   selectedValue={field.value}
                                   onChange={field.onChange}
                                   label={personalInfoData.formFields.documentType.passport}
                                 />
                               </>
                             )}
                           />
                           {errors.primaryTraveler?.documentType && (
                             <div className="text-red-500 text-sm font-normal font-['Poppins']">
                               {errors.primaryTraveler.documentType.message}
                             </div>
                           )}
                        </div>
                        <div className="self-stretch flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                            {personalInfoData.formFields.documentNumber.label}
                          </div>
                                                     <Controller
                                                     name="primaryTraveler.documentNumber"
                         control={control}
                         rules={{ required: 'Document number is required' }}
                         render={({ field }) => (
                           <>
                             <input
                               type="text"
                               value={field.value}
                               onChange={field.onChange}
                               placeholder={personalInfoData.formFields.documentNumber.placeholder}
                               className={`self-stretch h-14 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 w-full ${
                                 errors.primaryTraveler?.documentNumber ? 'outline-red-500' : 'outline-zinc-200 focus:outline-[#6AAD3C]'
                               }`}
                             />
                             {errors.primaryTraveler?.documentNumber && (
                               <div className="text-red-500 text-sm font-normal font-['Poppins']">
                                 {errors.primaryTraveler.documentNumber.message}
                               </div>
                             )}
                           </>
                         )}
                       />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Traveler Information - Only show if multiple travelers */}
              {hasMultipleTravelers && (
                <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                  <div className="self-stretch inline-flex justify-start items-center gap-2">
                    <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                      {personalInfoData.text.extraTravelerTitle}
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                      <Controller
                        name="extraTraveler.name"
                        control={control}
                        render={({ field }) => (
                          <FormInput
                            label={personalInfoData.formFields.travelerName.label}
                            placeholder={personalInfoData.formFields.travelerName.placeholder}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        name="extraTraveler.dateOfBirth"
                        control={control}
                        render={({ field }) => (
                          <FormInput
                            label={personalInfoData.formFields.dateOfBirth.label}
                            type="date"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch flex flex-col justify-center items-start gap-4">
                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                          <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                            {personalInfoData.formFields.documentType.label}
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch flex flex-col justify-start items-start gap-4">
                          <Controller
                            name="extraTraveler.documentType"
                            control={control}
                            render={({ field }) => (
                              <>
                                <DocumentTypeRadio
                                  id="extraID"
                                  name="extraDocType"
                                  value="ID"
                                  selectedValue={field.value}
                                  onChange={field.onChange}
                                  label={personalInfoData.formFields.documentType.id}
                                />
                                <DocumentTypeRadio
                                  id="extraPassport"
                                  name="extraDocType"
                                  value="Passport"
                                  selectedValue={field.value}
                                  onChange={field.onChange}
                                  label={personalInfoData.formFields.documentType.passport}
                                />
                              </>
                            )}
                          />
                        </div>
                        <div className="self-stretch flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                            {personalInfoData.formFields.documentNumber.label}
                          </div>
                          <Controller
                            name="extraTraveler.documentNumber"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder={personalInfoData.formFields.documentNumber.placeholder}
                                className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C]"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              

              {/* Reservation Summary */}
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                    {personalInfoData.text.reservationTitle}
                  </div>
                </div>
                                 <div className="w-full p-3 md:p-6 bg-white rounded-xl outline-1 outline-offset-[-1px] outline-green-50 flex flex-col justify-start items-start gap-3 md:gap-5">
                  <div className="self-stretch inline-flex justify-start items-center gap-20">
                    <div className="flex-1 flex justify-start items-center gap-4">
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                                                 <div className="justify-center text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">
                           {personalInfoData.text.flightHotel}
                         </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch py-3 md:py-5 border-t border-b border-gray-200 flex flex-col md:inline-flex md:flex-row justify-start items-start gap-6 md:gap-12">
                      <div className="flex-1 md:w-96 md:border-r md:border-gray-200 inline-flex flex-col justify-center items-center gap-4 md:gap-8">
                        <div className="self-stretch inline-flex justify-start items-center gap-4 md:gap-20">
                          <div className="flex justify-start items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 p-3 md:p-4 bg-[#F1F9EC] rounded-[5.14px] flex justify-start items-center gap-3">
                              <FaPlane className="w-6 h-6 md:w-8 md:h-8 text-[#6AAD3C]" />
                            </div>
                            <div className="flex-1 md:w-32 inline-flex flex-col justify-start items-start gap-1.5">
                              <div className="justify-center text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-none whitespace-nowrap">
                                Departure: {reservationData.departureCity}
                              </div>
                              <div className="self-stretch justify-center text-zinc-500 text-xs md:text-sm font-normal font-['Poppins'] leading-relaxed">
                                {reservationData.departureDate}
                              </div>
                              {reservationData.departureTimeRange && (
                                <div className="self-stretch justify-center text-zinc-400 text-xs font-normal font-['Poppins'] leading-relaxed">
                                  {reservationData.departureTimeRange}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 inline-flex flex-col justify-center items-center gap-4 md:gap-8">
                        <div className="self-stretch inline-flex justify-start items-center gap-4 md:gap-20">
                          <div className="flex justify-start items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 p-3 md:p-4 bg-[#F1F9EC] rounded-[5.14px] flex justify-start items-center gap-3">
                              <FaPlane className="w-6 h-6 md:w-8 md:h-8 text-[#6AAD3C] transform rotate-180" />
                            </div>
                            <div className="flex-1 md:w-32 inline-flex flex-col justify-start items-start gap-1.5">
                              <div className="justify-center text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-none whitespace-nowrap">
                                Return: Back to {reservationData.departureCity}
                              </div>
                              <div className="self-stretch justify-center text-zinc-500 text-xs md:text-sm font-normal font-['Poppins'] leading-relaxed">
                                {reservationData.returnDate}
                              </div>
                              {reservationData.arrivalTimeRange && (
                                <div className="self-stretch justify-center text-zinc-400 text-xs font-normal font-['Poppins'] leading-relaxed">
                                  {reservationData.arrivalTimeRange}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch pb-3 md:pb-5 border-b border-gray-200 flex flex-col justify-start items-start gap-2.5">
                      {/* Mobile View */}
                      <div className="block md:hidden w-full space-y-3">
                                                 {/* Package Row */}
                         <div className="flex justify-between items-center py-2 border-b border-gray-100">
                           <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                             {pricing.getPackageName(
                               formData.selectedSport as 'football' | 'basketball', 
                               formData.selectedPackage as 'standard' | 'premium'
                             ) || 'Package'}
                           </span>
                           <div className="text-right">
                             <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                               {reservationData.basePrice}€ x{reservationData.totalPeople}
                             </div>
                             <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                               {reservationData.packageTotal.toFixed(2)}€
                             </div>
                           </div>
                         </div>
                        
                                                 {/* Individual Extras Rows - Group costs, not per person */}
                         {formData.extras && formData.extras.filter(extra => extra.isSelected && !extra.isIncluded).map((extra, index) => (
                           <div key={extra.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                             <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                               {extra.name} x{extra.quantity}
                             </span>
                             <div className="text-right">
                               <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                                 {extra.price}€
                               </div>
                               <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                 {(extra.price * extra.quantity).toFixed(2)}€
                               </div>
                             </div>
                           </div>
                         ))}
                        
                                                 {/* Flight Schedule Row */}
                         {reservationData.flightScheduleTotal > 0 && (
                           <div className="flex justify-between items-center py-2 border-b border-gray-100">
                             <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                               Flight Schedule Adjustments
                             </span>
                             <div className="text-right">
                               <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                                 {reservationData.flightScheduleCost}€ x{reservationData.totalPeople}
                               </div>
                               <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                 {reservationData.flightScheduleTotal.toFixed(2)}€
                               </div>
                             </div>
                           </div>
                         )}
                        
                                                 {/* League Additional Cost Row */}
                         {reservationData.leagueTotal > 0 && (
                           <div className="flex justify-between items-center py-2 border-b border-gray-100">
                             <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                               European Competition
                             </span>
                             <div className="text-right">
                               <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                                 {reservationData.leagueCost}€ x{reservationData.totalPeople}
                               </div>
                               <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                 {reservationData.leagueTotal.toFixed(2)}€
                               </div>
                             </div>
                           </div>
                         )}
                        
                                                 {/* Subtotal Row */}
                         <div className="flex justify-between items-center py-4 border-t-2 border-lime-400 bg-lime-50 rounded-lg px-3">
                           <span className="text-neutral-800 text-lg font-bold font-['Poppins'] text-gray-800">
                             {personalInfoData.text.totalCost}
                           </span>
                           <div className="text-right">
                             <div className="text-neutral-800 text-xl font-bold font-['Poppins'] text-lime-700">
                               {reservationData.grandTotal.toFixed(2)}€
                             </div>
                           </div>
                         </div>
                      </div>
                      
                                            {/* Desktop View */}
                      <div className="hidden md:block w-full">
                        <div className="w-full grid grid-cols-4 gap-4 border-b-2 border-gray-300 pb-4 mb-2">
                          <div className="text-center text-neutral-800 text-base font-bold font-['Poppins'] leading-none text-gray-700">
                            Concept
                          </div>
                          <div className="text-center text-neutral-800 text-base font-bold font-['Poppins'] leading-none text-gray-700">
                            Price
                          </div>
                          <div className="text-center text-neutral-800 text-base font-bold font-['Poppins'] leading-none text-gray-700">
                            Qty
                          </div>
                          <div className="text-right text-neutral-800 text-base font-bold font-['Poppins'] leading-none text-gray-700">
                            Total
                          </div>
                        </div>
                        
                                                 {/* Package Row */}
                         <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                           <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                             {pricing.getPackageName(
                               formData.selectedSport as 'football' | 'basketball', 
                               formData.selectedPackage as 'standard' | 'premium'
                             ) || 'Package'}
                           </div>
                           <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                             {reservationData.basePrice}€
                           </div>
                           <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                             x{reservationData.totalPeople}
                           </div>
                           <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                             {reservationData.packageTotal.toFixed(2)}€
                           </div>
                         </div>
                        
                                                 {/* Extras Rows - Group costs, not per person */}
                         {formData.extras && formData.extras.filter(extra => extra.isSelected && !extra.isIncluded).map((extra, index) => (
                           <div key={extra.id} className="w-full grid grid-cols-4 gap-4 py-2 border-b border-gray-100">
                             <div className="text-left text-neutral-800 text-sm font-medium font-['Poppins'] leading-none">
                               {extra.name}
                             </div>
                             <div className="text-center text-neutral-800 text-sm font-normal font-['Poppins'] leading-none">
                               {extra.price}€
                             </div>
                             <div className="text-center text-neutral-800 text-sm font-normal font-['Poppins'] leading-none">
                               x{extra.quantity}
                             </div>
                             <div className="text-right text-neutral-800 text-sm font-medium font-['Poppins'] leading-none">
                               {(extra.price * extra.quantity).toFixed(2)}€
                             </div>
                           </div>
                         ))}
                        
                                                 {/* Flight Schedule Row */}
                         {reservationData.flightScheduleTotal > 0 && (
                           <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                             <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                               Flight Schedule Adjustments
                             </div>
                             <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                               {reservationData.flightScheduleCost}€
                             </div>
                             <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                               x{reservationData.totalPeople}
                             </div>
                             <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                               {reservationData.flightScheduleTotal.toFixed(2)}€
                             </div>
                           </div>
                         )}
                        
                                                 {/* League Additional Cost Row */}
                         {reservationData.leagueTotal > 0 && (
                           <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                             <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                               European Competition
                             </div>
                             <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                               {reservationData.leagueCost}€
                             </div>
                             <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                               x{reservationData.totalPeople}
                             </div>
                             <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                               {reservationData.leagueTotal.toFixed(2)}€
                             </div>
                           </div>
                         )}
                        
                                                 {/* Subtotal Row */}
                         <div className="w-full grid grid-cols-4 gap-4 py-3 border-t-2 border-gray-300">
                           <div className="text-left text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                             Subtotal
                           </div>
                           <div className="text-center text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                             -
                           </div>
                           <div className="text-center text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                             -
                           </div>
                           <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                             {reservationData.grandTotal.toFixed(2)}€
                           </div>
                         </div>
                      </div>
                    </div>
                                         {/* Total Cost Summary */}
                    <div className="w-full bg-gradient-to-r from-lime-50 to-green-50 rounded-xl p-6 mt-6 border-2 border-lime-200 shadow-sm">
                      <div className="space-y-3">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-gray-800 font-['Poppins']">
                            Booking Summary
                          </h3>
                        </div>
                        
                                                 <div className="space-y-2">
                           <div className="flex justify-between items-center py-2 border-b border-lime-200">
                             <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                               Package Total:
                             </span>
                             <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                               {reservationData.packageTotal.toFixed(2)}€
                             </span>
                           </div>
                           
                           {reservationData.extrasTotal > 0 && (
                             <div className="flex justify-between items-center py-2 border-b border-lime-200">
                               <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                 Extras Total:
                               </span>
                               <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                                 {reservationData.extrasTotal.toFixed(2)}€
                               </span>
                             </div>
                           )}
                           
                           {reservationData.flightScheduleTotal > 0 && (
                             <div className="flex justify-between items-center py-2 border-b border-lime-200">
                               <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                 Flight Schedule Total:
                               </span>
                               <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                                 {reservationData.flightScheduleTotal.toFixed(2)}€
                               </span>
                             </div>
                           )}
                           
                           {reservationData.leagueTotal > 0 && (
                             <div className="flex justify-between items-center py-2 border-b border-lime-200">
                               <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                 European Competition:
                               </span>
                               <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                                 {reservationData.leagueTotal.toFixed(2)}€
                               </span>
                             </div>
                           )}
                         </div>
                        
                                                 <div className="border-t-2 border-lime-400 pt-4 mt-4">
                           <div className="flex justify-between items-center">
                             <span className="text-neutral-800 text-xl font-bold font-['Poppins'] text-gray-800">
                               {personalInfoData.text.totalCost}
                             </span>
                             <span className="text-neutral-800 text-2xl font-bold font-['Poppins'] text-lime-700">
                               {reservationData.grandTotal.toFixed(2)}€
                             </span>
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                    {personalInfoData.text.paymentMethodTitle}
                  </div>
                </div>
                
                                 <Controller
                   name="paymentMethod"
                   control={control}
                   rules={{ required: 'Payment method is required' }}
                   render={({ field }) => (
                    <>
                      {/* Credit Card Option */}
                                             <PaymentMethodCard
                         value="credit"
                         selectedValue={field.value}
                         onChange={field.onChange}
                         label={personalInfoData.paymentMethods[0].label}
                       >
                        <div className="flex justify-start items-center gap-3">
                          <div className="w-16 p-2 rounded-[2.92px] outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <Image src="/stepper/icon/visa.png" alt="Visa" width={64} height={32} className="h-auto w-full" />
                          </div>
                          <div className="w-16 h-8 p-2 rounded-[2.91px] outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <Image src="/stepper/icon/mastercard.png" alt="Mastercard" width={64} height={32} className="h-6 w-auto" />
                          </div>
                        </div>
                      </PaymentMethodCard>

                      {/* Google Pay Option */}
                                             <PaymentMethodCard
                         value="google"
                         selectedValue={field.value}
                         onChange={field.onChange}
                         label={personalInfoData.paymentMethods[1].label}
                       >
                        <div className="flex justify-start items-center gap-2.5">
                          <div className="p-2 mr-8 rounded outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <Image 
                              src="/stepper/icon/gpay.png" 
                              alt="Google Pay" 
                              className="h-6 w-auto scale-300" 
                              width={100} 
                              height={100} 
                              quality={100}   
                            />
                          </div>
                        </div>
                      </PaymentMethodCard>

                      {/* Apple Pay Option */}
                                             <PaymentMethodCard
                         value="apple"
                         selectedValue={field.value}
                         onChange={field.onChange}
                         label={personalInfoData.paymentMethods[2].label}
                       >
                        <div className="w-20 flex justify-start items-center gap-2.5">
                          <div className="flex-1 p-2 rounded outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <Image 
                              src="/stepper/icon/apay.png" 
                              alt="Apple Pay" 
                              className="h-6 w-auto" 
                              width={100} 
                              height={100} 
                              quality={100}   
                            />
                          </div>
                        </div>
                      </PaymentMethodCard>
                    </>
                  )}
                />
                {errors.paymentMethod && (
                  <div className="text-red-500 text-sm font-normal font-['Poppins']">
                    {errors.paymentMethod.message}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
              <button 
                type="submit"
                className="w-full md:w-44 h-12 md:h-11 px-4 md:px-3.5 py-2 md:py-1.5 bg-[#6AAD3C] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors"
              >
                                 <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
                   {personalInfoData.text.confirm}
                 </div>
              </button>
              

            </div>
          </div>
        </div>
      </div>
    </form>
  )
}



