'use client'
import React, { useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'

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

const PAYMENT_METHODS = {
  CREDIT: 'credit' as const,
  GOOGLE: 'google' as const,
  APPLE: 'apple' as const,
} as const

export default function Payment() {
  const [isProcessing, setIsProcessing] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, errors },
    clearErrors,
  } = useForm<PaymentFormData>({
    defaultValues: {
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

  // Input formatting utilities
  const formatCardNumber = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
    return formatted.substring(0, 19) // Limit to 16 digits + 3 spaces
  }, [])

  const formatExpiryDate = useCallback((value: string): string => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`
    }
    return cleaned
  }, [])

  const formatCvv = useCallback((value: string): string => {
    return value.replace(/\D/g, '').substring(0, 4)
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

  // Validation logic
  const isCreditCardValid = useMemo(() => {
    if (selectedPayment !== PAYMENT_METHODS.CREDIT) return true
    
    return (
      creditCardData.nameOnCard.trim() !== '' &&
      creditCardData.cardNumber.replace(/\s/g, '').length === 16 &&
      creditCardData.expiryDate.length === 5 &&
      creditCardData.cvv.length >= 3
    )
  }, [selectedPayment, creditCardData])

  const isFormValid = useMemo(() => {
    return selectedPayment !== PAYMENT_METHODS.CREDIT ? true : isCreditCardValid
  }, [selectedPayment, isCreditCardValid])

  // Form submission
  const onSubmit = useCallback(async (data: PaymentFormData) => {
    if (!isFormValid) {
      alert('Please fill in all required fields correctly.')
      return
    }

    setIsProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      if (data.paymentMethod === PAYMENT_METHODS.CREDIT) {
        console.log('Processing credit card payment...', data.creditCard)
      } else {
        console.log(`Processing ${data.paymentMethod} payment...`)
      }
      
      alert('Payment processed successfully!')
    } catch (error) {
      console.error('Payment processing failed:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [isFormValid])

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
        className={`self-stretch p-4 rounded outline outline-1 outline-offset-[-1px] ${
          isSelected ? 'outline-lime-500 bg-lime-50' : 'outline-gray-200'
        } inline-flex justify-between items-center cursor-pointer transition-all duration-200`}
        onClick={() => handlePaymentMethodChange(method)}
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
        {icon}
      </div>
    )
  }, [selectedPayment, handlePaymentMethodChange])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-[894px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-6">
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch h-12 flex flex-col justify-start items-start gap-3">
            <div className="justify-center text-neutral-800 text-3xl font-semibold font-['Poppins'] leading-10">
              Payment Informations
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch px-5 py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-5">
              <div className="self-stretch inline-flex justify-start items-center gap-2">
                <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                  Payment Method
                </div>
              </div>
              
              {/* Credit Card Option */}
              <div 
                className={`self-stretch p-3 outline outline-1 outline-offset-[-1px] ${
                  selectedPayment === PAYMENT_METHODS.CREDIT ? 'outline-lime-500 bg-lime-50' : 'outline-gray-200'
                } flex flex-col justify-start items-start gap-5 cursor-pointer transition-all duration-200`}
                onClick={() => handlePaymentMethodChange(PAYMENT_METHODS.CREDIT)}
              >
                <div className="self-stretch py-4 rounded inline-flex justify-between items-center">
                  <div className="flex justify-start items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full border-2 ${
                      selectedPayment === PAYMENT_METHODS.CREDIT ? 'border-lime-500 bg-lime-500' : 'border-gray-300'
                    } flex items-center justify-center`}>
                      {selectedPayment === PAYMENT_METHODS.CREDIT && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div className="justify-center text-black text-lg font-medium font-['Poppins'] leading-loose">
                      Credit Card/Debit Card
                    </div>
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
                {selectedPayment === PAYMENT_METHODS.CREDIT && (
                  <div className="self-stretch flex flex-col justify-start items-start gap-5">
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch inline-flex justify-start items-start gap-6">
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                            Name on Card
                          </div>
                          <input
                            {...register('creditCard.nameOnCard', {
                              required: selectedPayment === PAYMENT_METHODS.CREDIT,
                              minLength: 1
                            })}
                            type="text"
                            placeholder="Enter your name"
                            className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                          />
                        </div>
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                            Expiry
                          </div>
                          <input
                            type="text"
                            value={creditCardData.expiryDate}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            maxLength={5}
                            className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                          />
                        </div>
                      </div>
                      <div className="self-stretch inline-flex justify-start items-start gap-4">
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                            Card number
                          </div>
                          <input
                            type="text"
                            value={creditCardData.cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="self-stretch h-14 px-4 py-3 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-lime-500"
                          />
                        </div>
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                            CVV
                          </div>
                          <input
                            type="text"
                            value={creditCardData.cvv}
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
              <PaymentMethodOption
                method={PAYMENT_METHODS.GOOGLE}
                label="Google Pay"
                icon={
                  <div className="flex justify-start items-center gap-2.5">
                    <div className="p-2 mr-8 rounded inline-flex flex-col justify-start items-start gap-2">
                      <Image src="/stepper/icon/gpay.png" alt="Google Pay" className="h-6 w-auto scale-300" width={91} height={17} />
                    </div>
                  </div>
                }
              />
              
              {/* Apple Pay Option */}
              <PaymentMethodOption
                method={PAYMENT_METHODS.APPLE}
                label="Apple Pay"
                icon={
                  <div className="w-20 flex justify-start items-center gap-2.5">
                    <div className="flex-1 p-2 rounded inline-flex flex-col justify-center items-center gap-2">
                      <Image src="/stepper/icon/apay.png" alt="Apple Pay" className="h-6 w-auto" width={41} height={17} />
                    </div>
                  </div>
                }
              />
            </div>
          </div>
        </div>
        
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <button 
              type="submit"
              disabled={isProcessing || !isFormValid}
              className={`w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all duration-200 ${
                isProcessing || !isFormValid 
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
    </form>
  )
}
