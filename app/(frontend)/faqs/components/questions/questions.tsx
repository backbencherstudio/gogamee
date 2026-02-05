"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";
import { getAllFaqs, FaqItem } from "../../../../../services/faqService";
import { useLanguage } from "../../../../context/LanguageContext";
import { TranslatedText } from "../../../_components/TranslatedText";

interface QuestionsProps {
  initialFaqs?: FaqItem[];
}

export default function Questions({ initialFaqs = [] }: QuestionsProps) {
  const { language, translateText } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<number[]>([0]);
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [translatedFaqs, setTranslatedFaqs] = useState<FaqItem[]>(initialFaqs);
  const [loading, setLoading] = useState<boolean>(initialFaqs.length === 0);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch FAQs from API
  const fetchFaqs = async (pageNum: number, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await getAllFaqs(pageNum, 10);

      if (response && response.success && Array.isArray(response.data)) {
        const newFaqs = response.data;

        if (isLoadMore) {
          setFaqs((prev) => [...prev, ...newFaqs]);
        } else {
          setFaqs(newFaqs);
          // Auto-expand first item if available and it's the first page
          if (newFaqs.length > 0) {
            setExpandedItems([0]);
          }
        }

        // Check availability of next page
        if (response.meta_data) {
          setHasMore(response.meta_data.page < response.meta_data.total_pages);
        } else {
          // Fallback if metadata missing
          setHasMore(newFaqs.length === 10);
        }
      } else {
        if (!isLoadMore) setFaqs([]);
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      if (!isLoadMore) setError("Failed to load FAQs. Please try again later.");
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFaqs(1, false);
  }, []);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFaqs(nextPage, true);
  };

  // Translate FAQs when language changes
  useEffect(() => {
    const translateFaqs = async () => {
      if (language === "es") {
        // If Spanish, use original FAQs (no translation needed)
        setTranslatedFaqs(faqs);
      } else {
        // If English, translate all FAQs
        const translated = await Promise.all(
          faqs.map(async (faq) => ({
            ...faq,
            question: await translateText(faq.question),
            answer: await translateText(faq.answer),
          })),
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
    <div className="w-full bg-[#FCFEFB] py-12 md:py-16 lg:py-24">
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6 lg:px-0">
        {/* Header Section */}
        <div className="flex flex-col justify-start items-center gap-6 lg:gap-12 mb-8 lg:mb-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="text-center text-zinc-950 text-3xl md:text-4xl lg:text-5xl font-semibold font-['Poppins'] leading-tight lg:leading-[57.60px]">
              <TranslatedText
                text="Preguntas frecuentes"
                english="Frequently asked questions"
              />
            </div>
          </div>
          <div className="w-full max-w-[532px] text-center text-neutral-600 text-sm md:text-base font-normal font-['Poppins'] leading-relaxed md:leading-7">
            <TranslatedText
              text="Encuentra respuestas a las dudas más comunes. Explora nuestras preguntas frecuentes y obtén toda la información que necesitas."
              english="Find solutions to common inquiries. Browse through our answers to frequently asked questions and get the clarity you need."
            />
          </div>
        </div>

        {/* FAQ Items */}
        <div className="bg-white flex flex-col justify-start items-start gap-6 w-full">
          <div className="w-full p-5 md:p-8 lg:p-10 rounded-lg outline-[6px] outline-offset-[-6px] outline-green-50">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-neutral-600 text-lg font-medium">
                  Loading FAQs...
                </div>
              </div>
            ) : error ? (
              <div className="flex flex-col justify-center items-center py-12 gap-4">
                <div className="text-red-600 text-lg font-medium">{error}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : faqs.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-neutral-600 text-lg font-medium">
                  No FAQs available at the moment.
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5 w-full">
                {translatedFaqs.map((item, index) => (
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
                            className="text-lime-900 text-lg md:text-xl lg:text-2xl font-medium font-['Poppins'] leading-tight lg:leading-9 cursor-pointer flex-1"
                          >
                            {item.question}
                          </div>
                        </div>
                        <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center flex-shrink-0">
                          <IoIosArrowDown
                            className={`w-full h-full text-lime-900 transition-transform duration-200 ${
                              expandedItems.includes(index) ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      className={`text-neutral-600 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose w-full pl-7 md:pl-8 lg:pl-9 overflow-hidden transition-all duration-500 ease-in-out ${
                        expandedItems.includes(index)
                          ? "max-h-96 opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {item.answer}
                    </div>

                    {index < translatedFaqs.length - 1 && (
                      <div className="self-stretch h-0 outline-1 outline-offset-[-0.50px] outline-stone-500/10 w-full" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && !loading && !error && (
              <div className="w-full flex justify-center mt-8 cursor-pointer">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-[#76C043] rounded-full text-white text-base font-medium hover:bg-lime-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <TranslatedText text="Cargando..." english="Loading..." />
                    </>
                  ) : (
                    <TranslatedText
                      text="Ver más preguntas"
                      english="Load more questions"
                    />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
