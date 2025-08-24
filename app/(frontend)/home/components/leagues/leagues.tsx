"use client"

import { useState, useEffect } from "react"
import { homepageLeaguesData } from "@/app/lib/appdata"

export default function SportsLeagues() {
  const [isFootball, setIsFootball] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get leagues data from appdata.ts
  const footballLeagues = homepageLeaguesData.getFootballLeagues()
  const basketballLeagues = homepageLeaguesData.getBasketballLeagues()

  const currentLeagues = isFootball ? footballLeagues : basketballLeagues

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % currentLeagues.length)
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [currentLeagues.length])

  const extendedLeagues = [...currentLeagues, ...currentLeagues, ...currentLeagues]

  return (
    <div className="w-full min-h-[645px] px-28 py-24 bg-[#D5EBC5] flex flex-col justify-start items-center gap-12">
      <div className="flex flex-col justify-start items-center gap-6">
        <div className="flex flex-col justify-start items-center gap-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="text-center text-zinc-950 text-5xl font-semibold font-poppins leading-[57.60px]">
                Ready for these leagues?
              </div>
            </div>
          </div>
        </div>
        <div className="inline-flex justify-start items-center gap-5">
          <div className={`text-lg font-medium font-poppins leading-loose ${isFootball ? 'text-neutral-800' : 'text-zinc-500'}`}>Football</div>
          <button
            onClick={() => setIsFootball(!isFootball)}
            className={`w-11 h-6 p-0.5 rounded-xl flex items-center transition-colors ${
              isFootball ? "bg-lime-500 justify-start" : "bg-lime-500 justify-end"
            }`}
          >
            <div className="w-5 h-5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] " />
          </button>
          <div className={`text-lg font-medium font-poppins leading-loose ${!isFootball ? 'text-neutral-800' : 'text-zinc-500'}`}>Basketball</div>
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="w-full overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out gap-6"
            style={{
              transform: `translateX(-${currentIndex * (160 + 24)}px)`, // 160px card width + 24px gap
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
  )
}
