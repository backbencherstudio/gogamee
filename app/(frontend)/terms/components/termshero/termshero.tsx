import React from 'react'
import { TranslatedText } from '../../../_components/TranslatedText'

export default function TermsHero() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full h-[180px] sm:h-[220px] lg:h-[254px] p-4 sm:p-6 rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] overflow-hidden bg-[#6AAD3C] flex justify-center items-center">
        <div className="text-white text-2xl sm:text-3xl lg:text-5xl font-semibold font-['Poppins'] leading-tight sm:leading-normal lg:leading-[57.60px] text-center">
          <TranslatedText text="Términos y condiciones" english="Terms & Conditions" />
        </div>
      </div>
    </div>
  )
}
