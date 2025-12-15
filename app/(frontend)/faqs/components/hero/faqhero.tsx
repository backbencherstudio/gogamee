import React from 'react';
import { TranslatedText } from '../../../_components/TranslatedText';

export default function FaqHero() {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Responsive Hero */}
      <div
        className="w-full h-[280px] sm:h-[320px] md:h-[360px] lg:h-[399px] p-4 sm:p-6 rounded-[16px] sm:rounded-[20px] lg:rounded-[24px] 
                   inline-flex flex-col justify-end items-start overflow-hidden"
        style={{
          backgroundImage: "url(/homepage/packbg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Content */}
        <div className="flex flex-col justify-start items-start gap-2 sm:gap-3 w-full">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold font-['Poppins'] leading-tight sm:leading-[1.1] md:leading-[1.15] lg:leading-[86.40px] px-4">
            <TranslatedText text="Preguntas frecuentes" english="Frequently asked questions" />
          </h1>
        </div>
      </div>
    </div>
  );
}