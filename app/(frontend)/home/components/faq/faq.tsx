"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
import { getAllFaqs, type FaqItem } from "../../../../../services/faqService";
import { TranslatedText } from "../../../_components/TranslatedText";
import { useLanguage } from "../../../../context/LanguageContext";

interface FaqProps {
  className?: string;
}

export default function Faq({ className = "" }: FaqProps) {
  const { language, translateText } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<number[]>([0]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [translatedFaqs, setTranslatedFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await getAllFaqs();
        if (response.success) {
          setFaqs(response.list);
          if (response.list.length > 0) {
            setExpandedItems([0]);
          }
        }
      } catch {
        // Intentionally silent on homepage; fallback is simply showing nothing
      }
    };
    fetchFaqs();
  }, []);

  // Translate FAQs when language changes
  useEffect(() => {
    const translateFaqs = async () => {
      if (language === 'es') {
        // If Spanish, use original FAQs (no translation needed)
        setTranslatedFaqs(faqs);
      } else {
        // If English, translate FAQs
        const translated = await Promise.all(
          faqs.map(async (faq) => ({
            ...faq,
            question: await translateText(faq.question),
            answer: await translateText(faq.answer),
          }))
        );
        setTranslatedFaqs(translated);
      }
    };

    if (faqs.length > 0) {
      translateFaqs();
    }
  }, [language, faqs, translateText]);

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      if (prev.includes(index)) {
        return prev.filter((item) => item !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  return (
    <div className={className}>
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="pt-16 md:pt-20 lg:pt-24 pb-8 lg:pb-10 bg-light-color flex flex-col justify-start items-start gap-8 lg:gap-12 w-full">
          {/* Header Section */}
          <div className="self-stretch flex flex-col lg:flex-row justify-start items-start lg:items-center gap-6 lg:gap-24">
            <div className="w-full lg:w-[533px] text-zinc-950 text-3xl md:text-4xl lg:text-5xl font-semibold font-['Poppins'] leading-tight lg:leading-[57.60px]">
              <TranslatedText text="Preguntas frecuentes" as="span" />
            </div>
            <div className="flex-1 text-neutral-600 text-sm md:text-base font-normal font-['Poppins'] leading-relaxed md:leading-7">
              <TranslatedText text="Encuentra respuestas a las dudas más comunes. Explora nuestras preguntas frecuentes y obtén toda la información que necesitas." as="span" />
            </div>
          </div>

          {/* FAQ Items */}
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch bg-white flex flex-col justify-start items-start gap-6 w-full">
              <div className="self-stretch p-5 md:p-8 lg:p-10 rounded-lg outline-[6px] outline-offset-[-6px] outline-green-50 w-full">
                <div className="flex flex-col gap-5 w-full">
                  {(translatedFaqs.length > 0 ? translatedFaqs : faqs).slice(0, 5).map((item, index) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 md:gap-5 w-full"
                    >
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
                              className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9 cursor-pointer flex-1 "
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

                      <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/*- View More Button -*/}

            <div className="inline-flex justify-start items-end ">
              <Link
                href="/faqs"
                className="px-4 py-2 md:py-2.5 bg-[#76C043] hover:bg-lime-600 rounded-[999px] flex justify-center items-center gap-2.5 w-36 md:w-44 cursor-pointer"
              >
                <TranslatedText text="Ver más" className="text-center text-white text-base md:text-lg font-normal font-['Inter'] leading-normal md:leading-7" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
