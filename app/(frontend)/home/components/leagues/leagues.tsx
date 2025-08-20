'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import Link from 'next/link'

interface LeaguesProps {
  className?: string;
}



export default function Leagues({ className }: LeaguesProps) {
  const [isSwitched, setIsSwitched] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSliderMove = (swiper: { translate: number; maxTranslate: () => number; width: number; setTranslate: (value: number) => void }) => {
    if (!isMobile) {
      const translate = swiper.translate;
      const maxTranslate = swiper.maxTranslate();
      
      // 250px constraint from edges
      const leftLimit = -250;
      const rightLimit = -(swiper.width - 250);
      
      if (translate > leftLimit) {
        swiper.setTranslate(leftLimit);
      } else if (translate < rightLimit && rightLimit < maxTranslate) {
        swiper.setTranslate(rightLimit);
      }
    }
  };





  return (
    <div className={`${className} px-3 sm:px-4 lg:px-28 py-12 sm:py-16 lg:py-24 inline-flex flex-col justify-start items-center gap-6 sm:gap-8 lg:gap-12 w-full`}>
      <div className="flex flex-col justify-start items-center gap-4 sm:gap-6">
        <div className="flex flex-col justify-start items-center gap-8 sm:gap-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="text-center justify-start text-zinc-950 text-2xl sm:text-3xl lg:text-5xl font-semibold font-['Poppins'] leading-tight lg:leading-[57.60px] px-4">Ready for these leagues?</div>
            </div>
          </div>
        </div>
        <div className="inline-flex justify-start items-center gap-4">
          <div className={`justify-start text-sm sm:text-base lg:text-lg font-normal font-['Poppins'] leading-loose ${!isSwitched ? 'text-neutral-800 font-medium' : 'text-zinc-500'}`}>Football</div>
          <div 
            onClick={() => setIsSwitched(!isSwitched)}
            className={`w-11 h-6 p-0.5 bg-[#76C043] rounded-xl flex ${isSwitched ? 'justify-end' : 'justify-start'} items-center overflow-hidden cursor-pointer`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10)]" />
          </div>
          <div className={`justify-start text-sm sm:text-base lg:text-lg font-normal font-['Poppins'] leading-loose ${isSwitched ? 'text-neutral-800 font-medium' : 'text-zinc-500'}`}>Basketball</div>
        </div>
      </div>
      
      <div className="w-full flex justify-center">
        <div className="max-w-fit">
          <Swiper
            spaceBetween={isMobile ? 16 : 32}
            slidesPerView={isMobile ? 1.5 : "auto"}
            centeredSlides={true}
            loop={false}
            className="w-auto"
            grabCursor={true}
            initialSlide={isMobile ? Math.floor(7 / 2) : Math.floor(7 / 2)}
            resistance={true}
            resistanceRatio={0.2}
            onSliderMove={handleSliderMove}
            breakpoints={{
              640: {
                slidesPerView: 2.5,
                spaceBetween: 20,
                centeredSlides: true,
              },
              768: {
                slidesPerView: 3.5,
                spaceBetween: 24,
                centeredSlides: true,
              },
              1024: {
                slidesPerView: "auto",
                spaceBetween: 32,
                centeredSlides: true,
                resistance: true,
                resistanceRatio: 0.15,
              },
              1280: {
                slidesPerView: "auto",
                spaceBetween: 40,
                centeredSlides: true,
                resistance: true,
                resistanceRatio: 0.1,
              }
            }}
          >
            {!isSwitched ? (
              // Football Leagues
              <>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/fb1.png" alt="Premier League" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Premier League</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/fb3.png" alt="La Liga" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">La Liga</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/fb4.png" alt="Bundesliga" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Bundesliga</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/fb5.png" alt="Serie A" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Serie A</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/fb6.png" alt="Ligue 1" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Ligue 1</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/fb7.png" alt="Champions League" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Champions League</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/fb8.png" alt="Europa League" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Europa League</div>
                  </div>
                </SwiperSlide>
              </>
            ) : (
              // Basketball Leagues
              <>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/bs1.png" alt="Liga Endesa" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Liga Endesa</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/bs2.png" alt="Basketbol Süper Ligi" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Basketbol Süper Ligi</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[201px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/bs3.png" alt="LNB Pro A" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">LNB Pro A</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/bs4.png" alt="Lega Basket Serie A" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Lega Basket Serie A</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/bs5.png" alt="Basketball Bundesliga" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Basketball Bundesliga</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/bs6.png" alt="Lietuvos krepšinio lyga" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">Lietuvos krepšinio lyga</div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="!w-auto">
                  <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden cursor-pointer">
                    <Image src="/homepage/image/bs7.png" alt="European competition" fill className="object-cover" sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px" />
                    <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">European competition</div>
                  </div>
              </SwiperSlide>
              </>
            )}
          </Swiper>
        </div>
      </div>


<Link href="/packages">
      <div className="px-4 py-2.5 bg-[#76C043] hover:bg-lime-600 rounded-[999px] inline-flex justify-center items-center gap-2.5 cursor-pointer">
        <div className="text-center justify-start text-white text-sm sm:text-base lg:text-lg font-normal font-['Inter'] leading-7">View packages</div>
      </div>
      </Link>
      
    </div>
  )
}
