"use client";
import React, { useRef, useState, useEffect } from "react";
import { AiFillStar } from "react-icons/ai";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import type { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import {
  getAllTestimonials,
  TestimonialItem,
} from "../../../../../services/testimonialService";
import { useLanguage } from "../../../../context/LanguageContext";
import { TranslatedText } from "../../../_components/TranslatedText";
import { formatTimeAgo } from "../../../../lib/utils";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

interface ReviewsProps {
  initialReviews?: TestimonialItem[];
}

export default function Reviews({ initialReviews = [] }: ReviewsProps) {
  const { language, translateText } = useLanguage();
  const [swiper, setSwiper] = useState<SwiperType>();
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [apiReviews, setApiReviews] =
    useState<TestimonialItem[]>(initialReviews);
  const [translatedReviews, setTranslatedReviews] =
    useState<TestimonialItem[]>(initialReviews);

  useEffect(() => {
    if (swiper && prevRef.current && nextRef.current) {
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, [swiper]);

  useEffect(() => {
    if (initialReviews.length > 0) return;
    const load = async () => {
      const response = await getAllTestimonials();
      if (response && response.success && Array.isArray(response.data)) {
        setApiReviews(response.data);
      }
    };
    load();
  }, [initialReviews]);

  // Translate reviews when language changes
  useEffect(() => {
    const translateReviews = async () => {
      if (language === "es") {
        // If Spanish, use original reviews (no translation needed)
        setTranslatedReviews(apiReviews);
      } else {
        // If English, translate reviews
        const translated = await Promise.all(
          apiReviews.map(async (review) => ({
            ...review,
            name: await translateText(review.name),
            role: await translateText(review.role),
            review: await translateText(review.review),
          })),
        );
        setTranslatedReviews(translated);
      }
    };

    if (apiReviews.length > 0) {
      translateReviews();
    }
  }, [language, apiReviews, translateText]);

  const handleImageError = (
    imagePath: string,
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    // Only set fallback if we haven't already tried for this image
    if (!failedImages.has(imagePath)) {
      setFailedImages((prev) => new Set(prev).add(imagePath));
      e.currentTarget.src = "/homepage/image/avatar1.png";
    }
  };

  return (
    <section className="w-full max-w-[1200px] mx-auto pt-24 pb-10 relative px-4 md:px-6 ">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-24 mb-12">
        <h2 className="w-full lg:w-[533px] text-3xl md:text-4xl lg:text-5xl font-semibold font-['Poppins'] text-zinc-950 leading-tight lg:leading-[57.60px]">
          <TranslatedText
            text="Qué dicen nuestros viajeros"
            english="What our customers are saying"
            as="span"
          />
        </h2>
        <p className="flex-1 text-sm md:text-base font-normal font-['Poppins'] text-neutral-600 leading-relaxed lg:leading-7">
          <TranslatedText
            text="Conoce las experiencias de quienes ya disfrutaron de aventuras deportivas inolvidables... ¡y vivieron la emoción de descubrir su destino por sorpresa!"
            english="Hear from our thrilled travelers who embarked on unforgettable sports adventures and embraced the excitement of surprise destinations!"
            as="span"
          />
        </p>
      </div>

      {/* Reviews Container */}
      <div className="relative review-slider-container">
        {/* Custom Navigation Buttons */}
        <button
          ref={prevRef}
          className="absolute left-[-30px] md:left-[-60px] top-1/2 -translate-y-1/2 z-10 p-3 bg-[#D5EBC5] rounded-full rotate-180 hover:bg-[#76C043] transition-colors hidden lg:flex cursor-pointer"
        >
          <IoChevronBack className="w-6 h-6 text-white rotate-180" />
        </button>
        <button
          ref={nextRef}
          className="absolute right-[-30px] md:right-[-60px] top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-[#D5EBC5] hover:bg-[#76C043] transition-colors hidden lg:flex cursor-pointer"
        >
          <IoChevronForward className="w-6 h-6 text-white" />
        </button>

        {/* Swiper */}
        <Swiper
          modules={[Navigation]}
          spaceBetween={24}
          onSwiper={setSwiper}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
            enabled: true,
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
          }}
          className="pb-12"
        >
          {translatedReviews.map((review) => (
            <SwiperSlide key={review.id} className="h-auto">
              <div className="h-[298px] p-4 bg-white rounded-lg border border-gray-200 flex flex-col gap-4">
                {/* Review Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-xl font-semibold font-['Geist'] text-lime-900 truncate">
                        {review.name}
                      </h3>
                      <p className="text-xs md:text-sm text-zinc-500 font-['Poppins'] truncate">
                        {review.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="flex gap-0.5 mb-1.5 justify-end">
                      {[...Array(review.rating)].map((_, i) => (
                        <AiFillStar
                          key={i}
                          className="w-3 h-3 md:w-4 md:h-4 text-emerald-500"
                        />
                      ))}
                      {[...Array(5 - review.rating)].map((_, i) => (
                        <AiFillStar
                          key={i + review.rating}
                          className="w-3 h-3 md:w-4 md:h-4 text-gray-200"
                        />
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-zinc-500 whitespace-nowrap">
                      <TranslatedText
                        text={formatTimeAgo(review.created_at, "es")}
                        english={formatTimeAgo(review.created_at, "en")}
                        as="span"
                      />
                    </p>
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-1 p-3 md:p-4 bg-gray-50 rounded-lg overflow-y-auto">
                  <p className="text-sm md:text-base text-neutral-600 font-['Poppins'] leading-6 md:leading-7">
                    {review.review}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Book Now Button */}
      <div className="flex justify-center mt-8">
        <Link href="/book">
          <button className="w-full md:w-44 px-4 py-2.5 bg-[#76C043] rounded-full text-white text-lg font-['Inter'] hover:bg-lime-600 transition-colors cursor-pointer">
            <TranslatedText text="Reserva ahora" english="Book Now" as="span" />
          </button>
        </Link>
      </div>
    </section>
  );
}
