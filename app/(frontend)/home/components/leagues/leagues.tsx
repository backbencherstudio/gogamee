"use client"

import { useState, useEffect, useRef } from "react"
import { homepageLeaguesData } from "@/app/lib/appdata"
import Link from "next/link"
import { TranslatedText } from "../../../_components/TranslatedText"

export default function SportsLeagues() {
  const [isFootball, setIsFootball] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Get leagues data from appdata.ts
  const footballLeagues = homepageLeaguesData.getFootballLeagues()
  const basketballLeagues = homepageLeaguesData.getBasketballLeagues()

  const currentLeagues = isFootball ? footballLeagues : basketballLeagues

  // Auto-slide for desktop only
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % currentLeagues.length)
    }, 2000) // Change slide every 2 seconds

    return () => clearInterval(interval)
  }, [currentLeagues.length])

  const extendedLeagues = [...currentLeagues, ...currentLeagues, ...currentLeagues]

  // Handle manual scroll for mobile
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft
      const cardWidth = 128 + 16 // mobile card width + gap
      const newIndex = Math.round(scrollLeft / cardWidth) % currentLeagues.length
      setCurrentIndex(newIndex)
    }
  }

  // Auto-scroll effect for desktop
  useEffect(() => {
    if (scrollContainerRef.current) {
      const cardWidth = 128 + 16 // mobile card width + gap
      const scrollPosition = currentIndex * cardWidth
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }, [currentIndex])

  return (
    <div className="w-full min-h-[645px] px-4 sm:px-8 md:px-16 lg:px-28 py-24 bg-[#D5EBC5] flex flex-col justify-start items-center gap-12">
      <div className="flex flex-col justify-start items-center gap-6">
        <div className="flex flex-col justify-start items-center gap-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="text-center text-zinc-950 text-3xl sm:text-4xl md:text-5xl font-semibold font-poppins leading-tight md:leading-[57.60px] px-4">
                <TranslatedText text="¿Listo para estas ligas?" as="span" />
              </div>
            </div>
          </div>
        </div>
        <div className="inline-flex justify-start items-center gap-5">
          <div className={`text-lg font-medium font-poppins leading-loose ${isFootball ? 'text-neutral-800' : 'text-zinc-500'}`}>
            <TranslatedText text="Fútbol" as="span" />
          </div>
          <button
            onClick={() => setIsFootball(!isFootball)}
            className={`w-11 h-6 p-0.5 rounded-xl flex items-center transition-colors ${
              isFootball ? "bg-lime-500 justify-start" : "bg-lime-500 justify-end"
            }`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] " />
          </button>
          <div className={`text-lg font-medium font-poppins leading-loose ${!isFootball ? 'text-neutral-800' : 'text-zinc-500'}`}>
            <TranslatedText text="Basket" as="span" />
          </div>
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-6 px-4 sm:px-0">
        {/* Auto-slide indicator for desktop */}
        {/* <div className="hidden sm:block w-full text-center text-sm text-zinc-600 mb-2">
          ← Cards auto-slide every 2 seconds → <span className="text-lime-600 font-medium">• Auto-sliding active</span>
        </div> */}
        
        {/* Mobile: Horizontal scrollable, Desktop: Auto-slide */}
        <div className="w-full overflow-hidden">
          {/* Mobile: Scrollable container */}
          <div className="block sm:hidden w-full overflow-x-auto overflow-y-hidden scrollbar-hide">
            <div
              ref={scrollContainerRef}
              className="flex gap-4 min-w-max pb-4"
              style={{
                width: `${extendedLeagues.length * (128 + 16)}px`,
              }}
              onScroll={handleScroll}
            >
              {extendedLeagues.map((league, index) => (
                <div
                  key={`${league.name}-${index}`}
                  className="flex-shrink-0 w-32 h-64 px-3 py-4 rounded relative overflow-hidden"
                  style={{
                    backgroundImage: `url(${league.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative z-10 h-full flex flex-col justify-center items-center">
                    <div className="text-center text-white text-sm font-bold font-poppins leading-tight px-2">{league.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Desktop: Auto-slide container */}
          <div className="hidden sm:block w-full overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (160 + 24)}px)`, // desktop: 160px card width + 24px gap
                width: `${extendedLeagues.length * (160 + 24)}px`,
              }}
            >
              {extendedLeagues.map((league, index) => (
                <div
                  key={`${league.name}-${index}`}
                  className="flex-shrink-0 w-40 h-72 px-4 py-6 rounded relative overflow-hidden"
                  style={{
                    backgroundImage: `url(${league.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="relative z-10 h-full flex flex-col justify-center items-center">
                    <div className="text-center text-white text-base font-bold font-poppins leading-7">{league.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <Link href="/packages">
      <div className="px-4 py-2.5 bg-[#76C043] hover:bg-lime-600 rounded-[999px] inline-flex justify-center items-center gap-2.5 cursor-pointer">
        <TranslatedText text="Ver packs" className="text-center justify-start text-white text-sm sm:text-base lg:text-lg font-normal font-['Inter'] leading-7" />
      </div>
      </Link>
      
    </div>
  )
}
