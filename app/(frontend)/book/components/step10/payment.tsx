'use client'
import React, { useState } from 'react'
import Image from 'next/image'

interface CreditCardInfo {
  nameOnCard: string
  cardNumber: string
  expiryDate: string
  cvv: string
}

export default function Payment() {
  const [selectedPayment, setSelectedPayment] = useState<'credit' | 'google' | 'apple'>('credit')
  const [creditCardInfo, setCreditCardInfo] = useState<CreditCardInfo>({
    nameOnCard: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCreditCardChange = (field: keyof CreditCardInfo, value: string) => {
    setCreditCardInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '')
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
    return formatted.substring(0, 19) // Limit to 16 digits + 3 spaces
  }

  const formatExpiryDate = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '')
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`
    }
    return cleaned
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    handleCreditCardChange('cardNumber', formatted)
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    handleCreditCardChange('expiryDate', formatted)
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4)
    handleCreditCardChange('cvv', value)
  }

  const validateForm = () => {
    if (selectedPayment === 'credit') {
      return (
        creditCardInfo.nameOnCard.trim() !== '' &&
        creditCardInfo.cardNumber.replace(/\s/g, '').length === 16 &&
        creditCardInfo.expiryDate.length === 5 &&
        creditCardInfo.cvv.length >= 3
      )
    }
    return true // For Google Pay and Apple Pay, assume external validation
  }

  const handleConfirm = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields correctly.')
      return
    }

    setIsProcessing(true)
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (selectedPayment === 'credit') {
        console.log('Processing credit card payment...', creditCardInfo)
      } else {
        console.log(`Processing ${selectedPayment} payment...`)
      }
      
      alert('Payment processed successfully!')
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-[894px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-6">
      <div className="self-stretch flex flex-col justify-center items-start gap-3">
        <div className="self-stretch h-12 flex flex-col justify-start items-start gap-3">
          <div className="justify-center text-neutral-800 text-3xl font-semibold font-['Poppins'] leading-10">Payment Informations</div>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-6">
          <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-5">
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">Payment Method</div>
            </div>
            
            {/* Credit Card Option */}
            <div 
              className={`self-stretch p-3 outline outline-1 outline-offset-[-1px] ${selectedPayment === 'credit' ? 'outline-lime-500 bg-lime-50' : 'outline-gray-200'} flex flex-col justify-start items-start gap-5 cursor-pointer transition-all duration-200`}
              onClick={() => setSelectedPayment('credit')}
            >
              <div className="self-stretch py-4 rounded inline-flex justify-between items-center">
                <div className="flex justify-start items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full border-2 ${selectedPayment === 'credit' ? 'border-lime-500 bg-lime-500' : 'border-gray-300'} flex items-center justify-center`}>
                    {selectedPayment === 'credit' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">Credit Card/Debit Card</div>
                </div>
                <div className="flex justify-start items-center gap-3">
                  <div className="w-16 p-2 bg-white rounded-[2.92px] outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                    <Image src="/stepper/icon/visa.png" alt="Visa" className="h-auto w-full" width={55} height={17} />
                  </div>
                  <div className="w-16 h-8 p-2 bg-white rounded-[2.91px] outline outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                    <Image src="/stepper/icon/mastercard.png" alt="Mastercard" className="h-6 w-auto" width={40} height={25} />
                  </div>
                </div>
              </div>
              
              {/* Credit Card Form - Only show when credit card is selected */}
              {selectedPayment === 'credit' && (
                <div className="self-stretch flex flex-col justify-start items-start gap-5">
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch inline-flex justify-start items-start gap-6">
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Name on Card</div>
                        <input
                          type="text"
                          value={creditCardInfo.nameOnCard}
                          onChange={(e) => handleCreditCardChange('nameOnCard', e.target.value)}
                          placeholder="Enter your name"
                          className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                        />
                      </div>
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Expiry</div>
                        <input
                          type="text"
                          value={creditCardInfo.expiryDate}
                          onChange={handleExpiryChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                        />
                      </div>
                    </div>
                    <div className="self-stretch inline-flex justify-start items-start gap-4">
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">Card number</div>
                        <input
                          type="text"
                          value={creditCardInfo.cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                        />
                      </div>
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                        <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">CVV</div>
                        <input
                          type="text"
                          value={creditCardInfo.cvv}
                          onChange={handleCvvChange}
                          placeholder="123"
                          maxLength={4}
                          className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Google Pay Option */}
            <div 
              className={`self-stretch p-4 rounded outline outline-1 outline-offset-[-1px] ${selectedPayment === 'google' ? 'outline-lime-500 bg-lime-50' : 'outline-gray-200'} inline-flex justify-between items-center cursor-pointer transition-all duration-200`}
              onClick={() => setSelectedPayment('google')}
            >
              <div className="flex justify-start items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full border-2 ${selectedPayment === 'google' ? 'border-lime-500 bg-lime-500' : 'border-gray-300'} flex items-center justify-center`}>
                  {selectedPayment === 'google' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">Google Pay</div>
              </div>
              <div className="flex justify-start items-center gap-2.5">
                <div className="p-2 mr-8 rounded inline-flex flex-col justify-start items-start gap-2">
                  <Image src="/stepper/icon/gpay.png" alt="Google Pay" className="h-6 w-auto scale-300" width={91} height={17} />
                </div>
              </div>
            </div>
            
            {/* Apple Pay Option */}
            <div 
              className={`self-stretch p-4 rounded outline outline-1 outline-offset-[-1px] ${selectedPayment === 'apple' ? 'outline-lime-500 bg-lime-50' : 'outline-gray-200'} inline-flex justify-between items-center cursor-pointer transition-all duration-200`}
              onClick={() => setSelectedPayment('apple')}
            >
              <div className="flex justify-start items-center gap-2.5">
                <div className={`w-6 h-6 rounded-full border-2 ${selectedPayment === 'apple' ? 'border-lime-500 bg-lime-500' : 'border-gray-300'} flex items-center justify-center`}>
                  {selectedPayment === 'apple' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">Apple Pay</div>
              </div>
              <div className="w-20 flex justify-start items-center gap-2.5">
                <div className="flex-1 p-2 rounded inline-flex flex-col justify-center items-center gap-2">
                  <Image src="/stepper/icon/apay.png" alt="Apple Pay" className="h-6 w-auto" width={41} height={17} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="self-stretch flex flex-col justify-center items-start gap-3">
        <div className="self-stretch flex flex-col justify-start items-start gap-6">
          <button 
            onClick={handleConfirm}
            disabled={isProcessing || !validateForm()}
            className={`w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all duration-200 ${
              isProcessing || !validateForm() 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-lime-500 hover:bg-lime-600 cursor-pointer'
            }`}
          >
            <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
              {isProcessing ? 'Processing...' : 'Confirm'}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
