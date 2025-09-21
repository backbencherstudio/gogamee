'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { IoIosArrowDown } from 'react-icons/io';
import { faqs } from '../../../../lib/appdata';

export default function Questions() {
  const [expandedItems, setExpandedItems] = useState<number[]>([0]);

  const toggleItem = (index: number) => {
    setExpandedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(item => item !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  return (
    <div className="w-full bg-[#FCFEFB] py-12 md:py-16 lg:py-24">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-0">
        {/* Header Section */}
        <div className="flex flex-col justify-start items-center gap-6 lg:gap-12 mb-8 lg:mb-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="text-center text-zinc-950 text-3xl md:text-4xl lg:text-5xl font-semibold font-['Poppins'] leading-tight lg:leading-[57.60px]">
              Frequently asked questions
            </div>
          </div>
          <div className="w-full max-w-[532px] text-center text-neutral-600 text-sm md:text-base font-normal font-['Poppins'] leading-relaxed md:leading-7">
            Find solutions to common inquiries. Browse through our answers to frequently asked questions and get the clarity you need.
          </div>
        </div>

        {/* FAQ Items */}
        <div className="bg-white flex flex-col justify-start items-start gap-6 w-full">
          <div className="w-full p-5 md:p-8 lg:p-10 rounded-lg outline-[6px] outline-offset-[-6px] outline-green-50">
            <div className="flex flex-col gap-5 w-full">
              {faqs.map((item, index) => (
                <div key={item.id} className="flex flex-col gap-4 md:gap-5 w-full">
                  <div className="w-full">
                    <div 
                      onClick={() => toggleItem(index)}
                      className="flex justify-between items-start gap-4 md:gap-6 w-full cursor-pointer"
                    >
                      <div className="flex items-center gap-2 md:gap-3 flex-1">
                        <div className="w-5 h-5 md:w-6 md:h-6 relative overflow-hidden flex-shrink-0">
                          <Image 
                            src="/homepage/icon/faq.svg"
                            alt="FAQ icon"
                            width={24}
                            height={24}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div 
                          onClick={() => toggleItem(index)}
                          className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9 cursor-pointer flex-1"
                        >
                          {item.question}
                        </div>
                      </div>
                      <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center flex-shrink-0">
                        <IoIosArrowDown 
                          className={`w-full h-full text-lime-900 transition-transform duration-200 ${
                            expandedItems.includes(index) ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full pl-7 md:pl-8 lg:pl-9 overflow-hidden transition-all duration-500 ease-in-out ${
                        expandedItems.includes(index) 
                          ? 'max-h-96 opacity-100' 
                          : 'max-h-0 opacity-0'
                    }`}
                  >
                    {item.answer}
                  </div>
                  
                  {index < faqs.length - 1 && (
                    <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
