'use client'

import Image from 'next/image'
import React, { useState } from 'react'
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
      className={`self-stretch p-4 rounded outline-1 outline-offset-[-1px] ${
        isSelected ? 'outline-lime-500 bg-lime-50' : 'outline-gray-200'
      } inline-flex justify-between items-center cursor-pointer`}
      onClick={() => onChange(value)}
    >
      <div className="flex justify-start items-center gap-2.5">
        <div className={`w-6 h-6 rounded-full border-2 ${
          isSelected ? 'border-lime-500 bg-lime-500' : 'border-gray-300'
        } flex items-center justify-center`}>
          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
        <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">
          {label}
        </div>
      </div>
      {children}
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
      className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500 w-full"
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

export default function Personalinfo() {
  const { updateFormData, nextStep } = useBooking()
  
  const { control, handleSubmit, watch, setValue, getValues } = useForm<PersonalInfoFormData>({
    defaultValues: {
      primaryTraveler: defaultTravelerInfo,
      extraTraveler: defaultTravelerInfo,
      paymentMethod: 'credit'
    }
  })

  const watchedPaymentMethod = watch('paymentMethod')

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
    
    // Move to next step
    nextStep()
  }

  const updateTravelerField = (
    travelerType: 'primaryTraveler' | 'extraTraveler',
    field: keyof TravelerInfo,
    value: string | 'ID' | 'Passport'
  ) => {
    const currentData = getValues(travelerType)
    setValue(travelerType, { ...currentData, [field]: value })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-[894px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-6">
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch h-12 flex flex-col justify-start items-start gap-3">
            <div className="justify-center text-neutral-800 text-3xl font-semibold font-['Poppins'] leading-10">
              Personal Informations
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              
              {/* Primary Traveler Information */}
              <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex flex-col justify-start items-start gap-5">
                  <div className="self-stretch inline-flex justify-start items-center gap-2">
                    <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                      Primary traveler informations
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch inline-flex justify-start items-start gap-6">
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
                    <div className="self-stretch inline-flex justify-start items-start gap-4">
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
                                className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
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
              <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                    Extra travelers info
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch inline-flex justify-start items-start gap-6">
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
                              className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservation Summary */}
              <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                    Your Reservation
                  </div>
                </div>
                <div className="w-[811px] p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-green-50 flex flex-col justify-start items-start gap-5">
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
                    <div className="self-stretch py-5 border-t border-b border-gray-200 inline-flex justify-start items-start gap-12">
                      <div className="w-96 border-r border-gray-200 inline-flex flex-col justify-center items-center gap-8">
                        <div className="self-stretch inline-flex justify-start items-center gap-20">
                          <div className="flex justify-start items-center gap-4">
                            <div className="w-16 h-16 p-4 bg-[#F1F9EC] rounded-[5.14px] flex justify-start items-center gap-3">
                              <FaPlane className="w-8 h-8 text-lime-500" />
                            </div>
                            <div className="w-32 inline-flex flex-col justify-start items-start gap-1.5">
                              <div className="justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                                Departure: Barcelona
                              </div>
                              <div className="self-stretch justify-center text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
                                20 July 2025
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="inline-flex flex-col justify-center items-center gap-8">
                        <div className="self-stretch inline-flex justify-start items-center gap-20">
                          <div className="flex justify-start items-center gap-4">
                            <div className="w-16 h-16 p-4 bg-[#F1F9EC] rounded-[5.14px] flex justify-start items-center gap-3">
                              <FaPlane className="w-8 h-8 text-lime-500 transform rotate-180" />
                            </div>
                            <div className="w-32 inline-flex flex-col justify-start items-start gap-1.5">
                              <div className="justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                                Return: Back to Barcelona
                              </div>
                              <div className="self-stretch justify-center text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
                                23 July 2025
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch pb-5 border-b border-gray-200 flex flex-col justify-start items-start gap-2.5">
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
                            Concept
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
                            Concept
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
              <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-5">
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
                          <div className="w-16 p-2 rounded-[2.92px] outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <img src="/stepper/icon/visa.png" alt="Visa" className="h-auto w-full" />
                          </div>
                          <div className="w-16 h-8 p-2 rounded-[2.91px] outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <img src="/stepper/icon/mastercard.png" alt="Mastercard" className="h-6 w-auto" />
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
            <button 
              type="submit"
              className="w-44 h-11 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors"
            >
              <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
                Confirm
              </div>
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
