'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import { 
  FaPlane
} from 'react-icons/fa'
import { 
  SiApplepay
} from 'react-icons/si'

interface TravelerInfo {
  name: string
  email: string
  phone: string
  dateOfBirth: string
  documentType: 'ID' | 'Passport'
  documentNumber: string
}

export default function Personalinfo() {
  const [primaryTraveler, setPrimaryTraveler] = useState<TravelerInfo>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    documentType: 'ID',
    documentNumber: ''
  })

  const [extraTraveler, setExtraTraveler] = useState<TravelerInfo>({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    documentType: 'ID',
    documentNumber: ''
  })

  const [selectedPayment, setSelectedPayment] = useState<'credit' | 'google' | 'apple'>('credit')

  const handlePrimaryTravelerChange = (field: keyof TravelerInfo, value: string | 'ID' | 'Passport') => {
    setPrimaryTraveler(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleExtraTravelerChange = (field: keyof TravelerInfo, value: string | 'ID' | 'Passport') => {
    setExtraTraveler(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="w-[894px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-6">
      <div className="self-stretch flex flex-col justify-center items-start gap-3">
        <div className="self-stretch h-12 flex flex-col justify-start items-start gap-3">
          <div className="justify-center text-neutral-800 text-3xl font-semibold font-['Poppins'] leading-10">Personal Informations</div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-6">
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            
            {/* Primary Traveler Information */}
            <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4">
              <div className="self-stretch flex flex-col justify-start items-start gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">Primary traveler informations</div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch inline-flex justify-start items-start gap-6">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Traveler&apos;s name (as on ID/ passport)</div>
                      <input
                        type="text"
                        value={primaryTraveler.name}
                        onChange={(e) => handlePrimaryTravelerChange('name', e.target.value)}
                        placeholder="Enter your name"
                        className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Traveler&apos;s email</div>
                      <input
                        type="email"
                        value={primaryTraveler.email}
                        onChange={(e) => handlePrimaryTravelerChange('email', e.target.value)}
                        placeholder="Enter your email"
                        className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                      />
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-start items-start gap-4">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Phone number</div>
                      <input
                        type="tel"
                        value={primaryTraveler.phone}
                        onChange={(e) => handlePrimaryTravelerChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                      />
                    </div>
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Date of birth</div>
                      <input
                        type="date"
                        value={primaryTraveler.dateOfBirth}
                        onChange={(e) => handlePrimaryTravelerChange('dateOfBirth', e.target.value)}
                        className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500 w-full"
                      />
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch flex flex-col justify-center items-start gap-4">
                      <div className="self-stretch inline-flex justify-start items-center gap-2">
                        <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">Document type</div>
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="inline-flex justify-start items-center gap-2">
                          <input
                            type="radio"
                            id="primaryID"
                            name="primaryDocType"
                            checked={primaryTraveler.documentType === 'ID'}
                            onChange={() => handlePrimaryTravelerChange('documentType', 'ID')}
                            className="w-5 h-5"
                          />
                          <label htmlFor="primaryID" className="justify-start text-neutral-800 text-base font-normal font-['Poppins'] leading-relaxed cursor-pointer">ID</label>
                        </div>
                        <div className="inline-flex justify-start items-center gap-2">
                          <input
                            type="radio"
                            id="primaryPassport"
                            name="primaryDocType"
                            checked={primaryTraveler.documentType === 'Passport'}
                            onChange={() => handlePrimaryTravelerChange('documentType', 'Passport')}
                            className="w-5 h-5"
                          />
                          <label htmlFor="primaryPassport" className="justify-start text-neutral-800 text-base font-normal font-['Poppins'] leading-relaxed cursor-pointer">Passport</label>
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col justify-start items-start gap-2">
                        <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Documents number</div>
                        <input
                          type="text"
                          value={primaryTraveler.documentNumber}
                          onChange={(e) => handlePrimaryTravelerChange('documentNumber', e.target.value)}
                          placeholder="Enter your documents number"
                          className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
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
                <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">Extra travelers info</div>
              </div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="self-stretch inline-flex justify-start items-start gap-6">
                  <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Name (as on ID/ passport)</div>
                    <input
                      type="text"
                      value={extraTraveler.name}
                      onChange={(e) => handleExtraTravelerChange('name', e.target.value)}
                      placeholder="Enter your name"
                      className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                    />
                  </div>
                  <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Date of birth</div>
                    <input
                      type="date"
                      value={extraTraveler.dateOfBirth}
                      onChange={(e) => handleExtraTravelerChange('dateOfBirth', e.target.value)}
                      className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500 w-full"
                    />
                  </div>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  <div className="self-stretch flex flex-col justify-center items-start gap-4">
                    <div className="self-stretch inline-flex justify-start items-center gap-2">
                      <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">Document type</div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                      <div className="inline-flex justify-start items-center gap-2">
                        <input
                          type="radio"
                          id="extraID"
                          name="extraDocType"
                          checked={extraTraveler.documentType === 'ID'}
                          onChange={() => handleExtraTravelerChange('documentType', 'ID')}
                          className="w-5 h-5"
                        />
                        <label htmlFor="extraID" className="justify-start text-neutral-800 text-base font-normal font-['Poppins'] leading-relaxed cursor-pointer">ID</label>
                      </div>
                      <div className="inline-flex justify-start items-center gap-2">
                        <input
                          type="radio"
                          id="extraPassport"
                          name="extraDocType"
                          checked={extraTraveler.documentType === 'Passport'}
                          onChange={() => handleExtraTravelerChange('documentType', 'Passport')}
                          className="w-5 h-5"
                        />
                        <label htmlFor="extraPassport" className="justify-start text-neutral-800 text-base font-normal font-['Poppins'] leading-relaxed cursor-pointer">Passport</label>
                      </div>
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Documents number</div>
                      <input
                        type="text"
                        value={extraTraveler.documentNumber}
                        onChange={(e) => handleExtraTravelerChange('documentNumber', e.target.value)}
                        placeholder="Enter your documents number"
                        className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reservation Summary */}
            <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-5">
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">Your Reservation</div>
              </div>
              <div className="w-[811px] p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-green-50 flex flex-col justify-start items-start gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-20">
                  <div className="flex-1 flex justify-start items-center gap-4">
                    <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                      <div className="justify-center text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">Flight + Hotel</div>
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
                            <div className="justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">Departure: Barcelona</div>
                            <div className="self-stretch justify-center text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">20 July 2025</div>
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
                            <div className="justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">Return: Back to Barcelona</div>
                            <div className="self-stretch justify-center text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">23 July 2025</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch pb-5 border-b border-gray-200 flex flex-col justify-start items-start gap-2.5">
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="w-20 inline-flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">Concept</div>
                        <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">Barcelona</div>
                        <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">Barcelona</div>
                      </div>
                      <div className="w-20 inline-flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">Concept</div>
                        <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">150.00€</div>
                        <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">00.00€</div>
                      </div>
                      <div className="w-20 inline-flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">Concept</div>
                        <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">x2</div>
                        <div className="self-stretch justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">x2</div>
                      </div>
                      <div className="w-20 inline-flex flex-col justify-start items-start gap-3">
                        <div className="self-stretch text-right justify-center text-neutral-800 text-base font-medium font-['Poppins'] leading-none">Total</div>
                        <div className="self-stretch text-right justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">300.00€</div>
                        <div className="self-stretch text-right justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">00.00€</div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-center text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">Total Cost</div>
                    <div className="justify-center text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">300.00€</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-5">
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">Payment Method</div>
              </div>
              
              {/* Credit Card Option */}
              <div 
                className={`self-stretch p-4 rounded outline-1 outline-offset-[-1px] ${selectedPayment === 'credit' ? 'outline-lime-500 bg-lime-50' : 'outline-gray-200'} inline-flex justify-between items-center cursor-pointer`}
                onClick={() => setSelectedPayment('credit')}
              >
                <div className="flex justify-start items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full border-2 ${selectedPayment === 'credit' ? 'border-lime-500 bg-lime-500' : 'border-gray-300'} flex items-center justify-center`}>
                    {selectedPayment === 'credit' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">Credit Card/Debit Card</div>
                </div>
                <div className="flex justify-start items-center gap-3">
                  <div className="w-16 p-2  rounded-[2.92px] outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                    <img src="/stepper/icon/visa.png" alt="Visa" className="h-auto w-full " />
                  </div>
                  <div className="w-16 h-8 p-2  rounded-[2.91px] outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                    <img src="/stepper/icon/mastercard.png" alt="Mastercard" className="h-6 w-auto" />
                  </div>
                </div>
              </div>

              {/* Google Pay Option */}
              <div 
                className={`self-stretch p-4 rounded outline outline-1 outline-offset-[-1px] ${selectedPayment === 'google' ? 'outline-lime-500 bg-lime-50' : 'outline-gray-200'} inline-flex justify-between items-center cursor-pointer`}
                onClick={() => setSelectedPayment('google')}
              >
                <div className="flex justify-start items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full border-2 ${selectedPayment === 'google' ? 'border-lime-500 bg-lime-500' : 'border-gray-300'} flex items-center justify-center`}>
                    {selectedPayment === 'google' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">Google Pay</div>
                </div>
                <div className="flex justify-start items-center gap-2.5">
                  <div className="p-2 mr-8 rounded outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                    <Image src="/stepper/icon/gpay.png" alt="Google Pay" className="h-6 w-auto scale-300" width={100} height={100} quality={100}   />
                  </div>
                </div>
              </div>

              {/* Apple Pay Option */}
              <div 
                className={`self-stretch p-4 rounded outline-1 outline-offset-[-1px] ${selectedPayment === 'apple' ? 'outline-lime-500 bg-lime-50' : 'outline-gray-200'} inline-flex justify-between items-center cursor-pointer`}
                onClick={() => setSelectedPayment('apple')}
              >
                <div className="flex justify-start items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full border-2 ${selectedPayment === 'apple' ? 'border-lime-500 bg-lime-500' : 'border-gray-300'} flex items-center justify-center`}>
                    {selectedPayment === 'apple' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">Apple Pay</div>
                </div>
                <div className="w-20 flex justify-start items-center gap-2.5">
                  <div className="flex-1 p-2 rounded outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                    <Image src="/stepper/icon/apay.png" alt="Apple Pay" className="h-6 w-auto" width={100} height={100} quality={100}   />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button className="w-44 h-11 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors">
            <div className="text-center justify-start text-white text-base font-normal font-['Inter']">Confirm</div>
          </button>
        </div>
      </div>
    </div>
  )
}
