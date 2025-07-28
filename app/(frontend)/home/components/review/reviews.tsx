"use client"
import React, { useRef, useState, useEffect } from 'react';
import { AiFillStar } from "react-icons/ai";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import Image from 'next/image';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';

const reviews = [
  {
    id: 1,
    name: "Esther Howard",
    role: "Wellness Coach",
    image: "/homepage/image/avatar1.png",
    rating: 5,
    review: "I've used several travel platforms for my sports trips, but GoGame completely blew me away. The concept of booking a surprise destination and match was amazing!"
  },
  {
    id: 2,
    name: "Darlene",
    role: "Wellness Coach",
    image: "/homepage/image/avatar2.png",
    rating: 5,
    review: "GoGame provided an unforgettable experience for me and my friends. We chose football as our sport, and they organized everything perfectly"
  },
  {
    id: 3,
    name: "Brooklyn",
    role: "Wellness Coach",
    image: "/homepage/image/avatar3.png",
    rating: 5,
    review: "If you're a sports fan and love surprises, GoGame is for you! I booked a surprise football trip and was amazed by how well everything was organized."
  },
  {
    id: 4,
    name: "Jenny Wilson",
    role: "Sports Enthusiast",
    image: "/homepage/image/avatar1.png",
    rating: 4,
    review: "The surprise element made the whole experience so exciting! The match we attended was incredible, though the hotel could have been better."
  },
  {
    id: 5,
    name: "Robert Fox",
    role: "Travel Blogger",
    image: "/homepage/image/avatar2.png",
    rating: 5,
    review: "As someone who reviews travel experiences for a living, I can say GoGame offers something truly unique. Their attention to detail is impressive!"
  },
  {
    id: 6,
    name: "Wade Warren",
    role: "Football Fan",
    image: "/homepage/image/avatar3.png",
    rating: 5,
    review: "Watched my favorite team play in a stadium I never thought I'd visit! The surprise reveal was perfect, and the matchday experience was unforgettable."
  }
];

export default function Reviews() {
  const [swiper, setSwiper] = useState<SwiperType>();
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (swiper && prevRef.current && nextRef.current) {
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, [swiper]);

  return (
    <section className="w-full max-w-[1200px] mx-auto pt-24 pb-10 relative px-4 md:px-6 ">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-24 mb-12">
        <h2 className="w-full lg:w-[533px] text-3xl md:text-4xl lg:text-5xl font-semibold font-['Poppins'] text-zinc-950 leading-tight lg:leading-[57.60px]">
          What our customers are saying
        </h2>
        <p className="flex-1 text-sm md:text-base font-normal font-['Poppins'] text-neutral-600 leading-relaxed lg:leading-7">
          Hear from our thrilled travelers who embarked on unforgettable sports adventures and embraced the excitement of surprise destinations!
        </p>
      </div>

      {/* Reviews Container */}
      <div className="relative review-slider-container">
        {/* Custom Navigation Buttons */}
        <button 
          ref={prevRef}
          className="absolute left-[-30px] md:left-[-60px] top-1/2 -translate-y-1/2 z-10 p-3 bg-[#D5EBC5] rounded-full rotate-180 hover:bg-lime-500 transition-colors hidden lg:flex"
        >
          <IoChevronBack className="w-6 h-6 text-white rotate-180" />
        </button>
        <button 
          ref={nextRef}
          className="absolute right-[-30px] md:right-[-60px] top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-[#D5EBC5] hover:bg-lime-500 transition-colors hidden lg:flex"
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
            enabled: true
          }}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 20
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24
            }
          }}
          className="pb-12"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review.id} className="h-auto">
              <div className="h-[298px] p-4 bg-white rounded-lg border border-gray-200 flex flex-col gap-4">
                {/* Review Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={review.image}
                        alt={review.name}
                        fill
                        className="object-cover"
                      />
                    </div>
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
                        <AiFillStar key={i} className="w-3 h-3 md:w-4 md:h-4 text-emerald-500" />
                      ))}
                      {[...Array(5 - review.rating)].map((_, i) => (
                        <AiFillStar key={i + review.rating} className="w-3 h-3 md:w-4 md:h-4 text-gray-200" />
                      ))}
                    </div>
                    <p className="text-xs md:text-sm text-zinc-500 whitespace-nowrap">2 days ago</p>
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
        <button className="w-full md:w-44 px-4 py-2.5 bg-lime-500 rounded-full text-white text-lg font-['Inter'] hover:bg-lime-600 transition-colors">
          Book Now
        </button>
      </div>
    </section>
  );
}
