'use client'

import Image from 'next/image'
import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FaPlane } from 'react-icons/fa'
import { useBooking } from '../../context/BookingContext'

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
}> = ({ label, type = 'text', placeholder, value, onChange, className = '' }) => (
  <div className={`flex-1 inline-flex flex-col justify-start items-start gap-2 ${className}`}>
    <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
      {label}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="self-stretch h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C] w-full"
    />
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

const STORAGE_KEY = 'personalinfo_form_data'

// Helper functions for localStorage
const saveToStorage = (data: PersonalInfoFormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

const loadFromStorage = (): PersonalInfoFormData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return null
  }
}

export default function Personalinfo() {
  const { updateFormData, nextStep } = useBooking()
  
  // Load initial data from localStorage or use defaults
  const getInitialValues = (): PersonalInfoFormData => {
    const savedData = loadFromStorage()
    return savedData || {
      primaryTraveler: defaultTravelerInfo,
      extraTraveler: defaultTravelerInfo,
      paymentMethod: 'credit'
    }
  }
  
  const { control, handleSubmit, watch, getValues, reset } = useForm<PersonalInfoFormData>({
    defaultValues: getInitialValues()
  })

  // Watch all form values for auto-save
  const watchedValues = watch()

  // Auto-save to localStorage whenever form values change
  useEffect(() => {
    const currentValues = getValues()
    saveToStorage(currentValues)
  }, [watchedValues, getValues])


  const onSubmit = (data: PersonalInfoFormData) => {
    console.log('Form Data:', data)
    
    // Update booking context with personal info
    updateFormData({
      personalInfo: {
        firstName: data.primaryTraveler.name.split(' ')[0] || '',
        lastName: data.primaryTraveler.name.split(' ').slice(1).join(' ') || '',
        email: data.primaryTraveler.email,
        phone: data.primaryTraveler.phone
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

  // Function to clear form and localStorage
  const clearForm = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
      reset({
        primaryTraveler: defaultTravelerInfo,
        extraTraveler: defaultTravelerInfo,
        paymentMethod: 'credit'
      })
    } catch (error) {
      console.error('Error clearing form:', error)
    }
  }



  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full max-w-[894px] px-3 md:px-4 xl:px-6 py-4 md:py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-4 md:gap-6 min-h-[600px] xl:min-h-0">
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
            <div className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
              Personal Informations
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              
              {/* Primary Traveler Information */}
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex flex-col justify-start items-start gap-5">
                  <div className="self-stretch inline-flex justify-start items-center gap-2">
                    <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                      Primary traveler informations
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                      <Controller
                        name="primaryTraveler.name"
                        control={control}
                        render={({ field }) => (
                          <FormInput
                            label="Traveler's name (as on ID/ passport)"
                            placeholder="Enter your name"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        name="primaryTraveler.email"
                        control={control}
                        render={({ field }) => (
                          <FormInput
                            label="Traveler's email"
                            type="email"
                            placeholder="Enter your email"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                      <Controller
                        name="primaryTraveler.phone"
                        control={control}
                        render={({ field }) => (
                          <FormInput
                            label="Phone number"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <Controller
                        name="primaryTraveler.dateOfBirth"
                        control={control}
                        render={({ field }) => (
                          <FormInput
                            label="Date of birth"
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
                            Document type
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch flex flex-col justify-start items-start gap-4">
                          <Controller
                            name="primaryTraveler.documentType"
                            control={control}
                            render={({ field }) => (
                              <>
                                <DocumentTypeRadio
                                  id="primaryID"
                                  name="primaryDocType"
                                  value="ID"
                                  selectedValue={field.value}
                                  onChange={field.onChange}
                                  label="ID"
                                />
                                <DocumentTypeRadio
                                  id="primaryPassport"
                                  name="primaryDocType"
                                  value="Passport"
                                  selectedValue={field.value}
                                  onChange={field.onChange}
                                  label="Passport"
                                />
                              </>
                            )}
                          />
                        </div>
                        <div className="self-stretch flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                            Documents number
                          </div>
                          <Controller
                            name="primaryTraveler.documentNumber"
                            control={control}
                            render={({ field }) => (
                              <input
                                type="text"
                                value={field.value}
                                onChange={field.onChange}
                                placeholder="Enter your documents number"
                                className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C]"
                              />
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Traveler Information */}
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                    Extra travelers info
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                    <Controller
                      name="extraTraveler.name"
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          label="Name (as on ID/ passport)"
                          placeholder="Enter your name"
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
                          label="Date of birth"
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
                          Document type
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
                                label="ID"
                              />
                              <DocumentTypeRadio
                                id="extraPassport"
                                name="extraDocType"
                                value="Passport"
                                selectedValue={field.value}
                                onChange={field.onChange}
                                label="Passport"
                              />
                            </>
                          )}
                        />
                      </div>
                      <div className="self-stretch flex flex-col justify-start items-start gap-2">
                        <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                          Documents number
                        </div>
                        <Controller
                          name="extraTraveler.documentNumber"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="text"
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Enter your documents number"
                              className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C]"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Summary */}
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                    Your Reservation
                  </div>
                </div>
                <div className="w-full max-w-[811px] p-3 md:p-6 bg-white rounded-xl outline-1 outline-offset-[-1px] outline-green-50 flex flex-col justify-start items-start gap-3 md:gap-5">
                  <div className="self-stretch inline-flex justify-start items-center gap-20">
                    <div className="flex-1 flex justify-start items-center gap-4">
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                        <div className="justify-center text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">
                          Flight + Hotel
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
                              <div className="justify-center text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-none">
                                Departure: Barcelona
                              </div>
                              <div className="self-stretch justify-center text-zinc-500 text-xs md:text-sm font-normal font-['Poppins'] leading-relaxed">
                                20 July 2025
                              </div>
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
                              <div className="justify-center text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-none">
                                Return: Back to Barcelona
                              </div>
                              <div className="self-stretch justify-center text-zinc-500 text-xs md:text-sm font-normal font-['Poppins'] leading-relaxed">
                                23 July 2025
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch pb-3 md:pb-5 border-b border-gray-200 flex flex-col justify-start items-start gap-2.5">
                      {/* Mobile View */}
                      <div className="block md:hidden w-full space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-neutral-800 text-sm font-medium font-['Poppins']">Barcelona</span>
                          <div className="text-right">
                            <div className="text-neutral-800 text-sm font-normal font-['Poppins']">150.00€ x2</div>
                            <div className="text-neutral-800 text-sm font-medium font-['Poppins']">300.00€</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-neutral-800 text-sm font-medium font-['Poppins']">Barcelona</span>
                          <div className="text-right">
                            <div className="text-neutral-800 text-sm font-normal font-['Poppins']">00.00€ x2</div>
                            <div className="text-neutral-800 text-sm font-medium font-['Poppins']">00.00€</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Desktop View */}
                      <div className="hidden md:block self-stretch">
                        <div className="self-stretch inline-flex justify-between items-center">
                          <div className="w-20 inline-flex flex-col justify-start items-start gap-3">
                            <div className="self-stretch justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                              Concept
                            </div>
                            <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              Barcelona
                            </div>
                            <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              Barcelona
                            </div>
                          </div>
                          <div className="w-20 inline-flex flex-col justify-start items-start gap-3">
                            <div className="self-stretch justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                              Price
                            </div>
                            <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              150.00€
                            </div>
                            <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              00.00€
                            </div>
                          </div>
                          <div className="w-20 inline-flex flex-col justify-start items-start gap-3">
                            <div className="self-stretch justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                              Qty
                            </div>
                            <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              x2
                            </div>
                            <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              x2
                            </div>
                          </div>
                          <div className="w-20 inline-flex flex-col justify-start items-start gap-3">
                            <div className="self-stretch text-right justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                              Total
                            </div>
                            <div className="self-stretch text-right justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              300.00€
                            </div>
                            <div className="self-stretch text-right justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              00.00€
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="justify-center text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">
                        Total Cost
                      </div>
                      <div className="justify-center text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">
                        300.00€
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                    Payment Method
                  </div>
                </div>
                
                <Controller
                  name="paymentMethod"
                  control={control}
                  render={({ field }) => (
                    <>
                      {/* Credit Card Option */}
                      <PaymentMethodCard
                        value="credit"
                        selectedValue={field.value}
                        onChange={field.onChange}
                        label="Credit Card/Debit Card"
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
                        label="Google Pay"
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
                        label="Apple Pay"
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
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
              <button 
                type="submit"
                className="w-full md:w-44 h-12 md:h-11 px-4 md:px-3.5 py-2 md:py-1.5 bg-[#6AAD3C] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors"
              >
                <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
                  Confirm
                </div>
              </button>
              
              <button 
                type="button"
                onClick={clearForm}
                className="w-full md:w-32 h-12 md:h-11 px-4 md:px-3.5 py-2 md:py-1.5 bg-gray-500 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-gray-600 transition-colors"
              >
                <div className="text-center justify-start text-white text-sm font-normal font-['Inter']">
                  Clear Form
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
