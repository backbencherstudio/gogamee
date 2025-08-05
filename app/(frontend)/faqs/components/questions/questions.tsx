'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { IoIosArrowDown } from 'react-icons/io';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is GoGame?",
    answer: "GoGame is a surprise travel platform that creates unforgettable sports experiences. We organize everything for you — match tickets, flights, and hotel — but we only reveal the destination and event 48 hours before departure."
  },
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 2-3 months in advance to ensure availability and the best prices. For major sporting events or peak seasons, booking 4-6 months ahead is advisable. Last-minute bookings are possible but may have limited options."
  },
  {
    question: "When will I find out my destination?",
    answer: "Your destination and event details will be revealed exactly 48 hours before your departure. This adds to the excitement and surprise element of your GoGame experience while giving you enough time to prepare for your trip."
  },
  {
    question: "Do I need a passport or ID?",
    answer: "Yes, you'll need a valid passport for international destinations and government-issued ID for domestic travel. We recommend having at least 6 months validity on your passport beyond your travel dates to avoid any issues."
  },
  {
    question: "What kind of accommodation is included?",
    answer: "We provide comfortable, quality accommodations in 3-4 star hotels, always located in safe and convenient areas close to the sporting venue or city center. All rooms include standard amenities and are carefully selected to ensure a pleasant stay."
  },
  {
    question: "Can I travel alone?",
    answer: "Absolutely! GoGame welcomes solo travelers. Many of our customers travel alone and often end up meeting like-minded sports fans during their trip. We ensure safe and comfortable arrangements for individual travelers."
  },
  {
    question: "Can I cancel or modify a booking?",
    answer: "Cancellation and modification policies vary depending on how close to departure you are and the specific package. We offer flexible options with different cancellation terms. Please check your booking terms or contact our support team for specific details."
  },
  {
    question: "What luggage is included?",
    answer: "Standard checked baggage (up to 23kg) and carry-on luggage are included in your package. Specific allowances may vary by airline and destination. We'll provide detailed luggage information once your destination is revealed."
  },
  {
    question: "What are the flights like?",
    answer: "We book economy class flights with reputable airlines, ensuring comfortable and safe travel. For longer routes, we may include upgraded seating or premium economy when available. All flights include standard meal service and entertainment."
  },
  {
    question: "What if my flight is delayed or cancelled?",
    answer: "We have 24/7 support to handle any flight disruptions. Our team will work with airlines to rebook you on the next available flight and adjust your itinerary accordingly. Trip insurance options are available for additional protection."
  },
  {
    question: "Can minors travel?",
    answer: "Yes, minors can travel but must be accompanied by a parent or guardian. For unaccompanied minors, special arrangements and additional fees may apply. Please contact us during booking to discuss specific requirements and airline policies."
  },
  {
    question: "Are there limitations for travelers with reduced mobility?",
    answer: "We strive to accommodate all travelers. Please inform us of any mobility requirements during booking so we can ensure appropriate accommodations, accessible venues, and suitable transportation arrangements are made for your comfort and safety."
  }
];

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
              {faqData.map((item, index) => (
                <div key={index} className="flex flex-col gap-4 md:gap-5 w-full">
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
                        <div className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9">
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
                  
                  {expandedItems.includes(index) && (
                    <div className="text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full pl-7 md:pl-8 lg:pl-9">
                      {item.answer}
                    </div>
                  )}
                  
                  {index < faqData.length - 1 && (
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
