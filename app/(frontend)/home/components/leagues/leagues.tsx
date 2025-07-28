'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface LeaguesProps {
  className?: string;
}

interface LeagueData {
  name: string;
  image: string;
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

  const basketballLeagues: LeagueData[] = [
    { name: "Liga Endesa", image: "/homepage/image/bs1.png" },
    { name: "Basketbol Süper Ligi", image: "/homepage/image/bs2.png" },
    { name: "LNB Pro A", image: "/homepage/image/bs3.png" },
    { name: "Lega Basket Serie A", image: "/homepage/image/bs4.png" },
    { name: "Basketball Bundesliga", image: "/homepage/image/bs5.png" },
    { name: "Lietuvos krepšinio lyga", image: "/homepage/image/bs6.png" },
    { name: "European competition", image: "/homepage/image/bs7.png" },
  ];

  const footballLeagues: LeagueData[] = [
    { name: "Premier League", image: "/homepage/image/fb1.png" },
    { name: "La Liga", image: "/homepage/image/fb3.png" },
    { name: "Bundesliga", image: "/homepage/image/fb4.png" },
    { name: "Serie A", image: "/homepage/image/fb5.png" },
    { name: "Ligue 1", image: "/homepage/image/fb6.png" },
    { name: "Champions League", image: "/homepage/image/fb7.png" },
    { name: "Europa League", image: "/homepage/image/fb8.png" },
  ];

  const currentLeagues = isSwitched ? basketballLeagues : footballLeagues;

  const LeagueCard = ({ league, index }: { league: LeagueData; index: number }) => (
    <div className="w-[150px] h-[200px] sm:w-[160px] sm:h-[220px] md:w-[150px] md:h-[200px] lg:w-[160px] lg:h-[220px] px-2 py-4 bg-black/30 rounded flex flex-col justify-center items-center relative overflow-hidden">
      <Image 
        src={league.image} 
        alt={league.name} 
        fill 
        className="object-cover"
        sizes="(max-width: 640px) 150px, (max-width: 768px) 160px, (max-width: 1024px) 150px, 160px"
      />
      <div className="self-stretch text-center text-white text-sm sm:text-base font-bold font-['Poppins'] leading-tight relative z-10 mt-auto">
        {league.name}
      </div>
    </div>
  );

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
            className={`w-11 h-6 p-0.5 bg-lime-500 rounded-xl flex ${isSwitched ? 'justify-end' : 'justify-start'} items-center overflow-hidden cursor-pointer`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10)]" />
          </div>
          <div className={`justify-start text-sm sm:text-base lg:text-lg font-normal font-['Poppins'] leading-loose ${isSwitched ? 'text-neutral-800 font-medium' : 'text-zinc-500'}`}>Basketball</div>
        </div>
      </div>
      
      {isMobile ? (
        <div className="w-full">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={16}
            slidesPerView="auto"
            centeredSlides={true}
            pagination={{ clickable: true }}
            className="w-full !pb-8"
            breakpoints={{
              640: {
                spaceBetween: 20,
              }
            }}
          >
            {currentLeagues.map((league, index) => (
              <SwiperSlide key={index} className="!w-auto">
                <LeagueCard league={league} index={index} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <div className="w-full max-w-[1200px] grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4 sm:gap-5 lg:gap-6 justify-center">
          {currentLeagues.map((league, index) => (
            <LeagueCard key={index} league={league} index={index} />
          ))}
        </div>
      )}

      <div className="px-4 py-2.5 bg-lime-500 rounded-[999px] inline-flex justify-center items-center gap-2.5">
        <div className="text-center justify-start text-white text-sm sm:text-base lg:text-lg font-normal font-['Inter'] leading-7">View packages</div>
      </div>
    </div>
  )
}
