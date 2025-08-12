'use client'

import React, { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { useBooking } from '../../context/BookingContext'

// Types
interface League {
  id: string
  name: string
  country: string
  image: string
  removed: boolean
}

// League card data
const INITIAL_LEAGUES: League[] = [
  { id: '1', name: 'La Liga', country: 'Spain', image: '/stepper/img1.png', removed: false },
  { id: '2', name: 'Premier League', country: 'England', image: '/stepper/img2.png', removed: false },
  { id: '3', name: 'Bundesliga', country: 'Germany', image: '/stepper/img3.png', removed: false },
  { id: '4', name: 'Serie A', country: 'Italy', image: '/stepper/img4.png', removed: false },
  { id: '5', name: 'Eredivisie', country: 'Netherlands', image: '/stepper/img5.png', removed: false },
  { id: '6', name: 'Ligue 1', country: 'France', image: '/stepper/img6.png', removed: false },
]

// Constants
const REMOVAL_COST = 20

// League Card Component
interface LeagueCardProps {
  league: League
  onRemove: (leagueId: string) => void
}

const LeagueCard = React.memo(({ league, onRemove }: LeagueCardProps) => {
  const handleRemoveClick = useCallback(() => {
    onRemove(league.id)
  }, [league.id, onRemove])

  return (
    <div className="group w-48 h-72 rounded-lg relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105">
      <Image
        src={league.image}
        alt={league.name}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className={`absolute bottom-0 left-0 right-0 px-4 py-5 flex flex-col justify-end items-start gap-2.5 transition-all duration-300 ease-out ${!league.removed ? 'group-hover:pb-16' : ''}`}>
        <div className="self-stretch flex flex-col justify-start items-start gap-2">
          <div className="self-stretch justify-start text-white text-sm font-bold font-['Poppins'] leading-none">
            {league.name}
          </div>
          <div className="inline-flex justify-start items-center gap-1.5">
            <div className="w-4 h-4 relative">
              <Image
                src="/stepper/icon/location.svg"
                alt="Location"
                width={16}
                height={16}
                className="w-4 h-4"
              />
            </div>
            <div className="text-center justify-start text-white text-sm font-medium font-['Poppins'] leading-none">
              {league.country}
            </div>
          </div>
        </div>
      </div>

      {/* Remove button */}
      {!league.removed && (
        <div 
          className="absolute bottom-0 left-0 right-0 px-4 pb-5 transition-all duration-300 ease-out opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
          onClick={handleRemoveClick}
        >
          <div className="self-stretch px-4 py-2 w-full bg-lime-500 hover:bg-lime-600 rounded-[999px] inline-flex justify-center items-center gap-2.5 transition-colors cursor-pointer">
            <div className="text-center justify-start text-white text-sm font-semibold font-['Inter'] leading-snug">
              Remove
            </div>
          </div>
        </div>
      )}

      {/* Removed overlay */}
      {league.removed && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <div className="text-white text-lg font-bold">REMOVED</div>
        </div>
      )}
    </div>
  )
})

LeagueCard.displayName = 'LeagueCard'

// Main Component
export default function RemoveLeague() {
  const { formData, updateFormData, nextStep } = useBooking()
  const [leagues, setLeagues] = useState<League[]>(INITIAL_LEAGUES)

  // Load existing removed leagues data when component mounts
  useEffect(() => {
    if (formData.removedLeagues && formData.removedLeagues.length > 0) {
      setLeagues(prev => prev.map(league => {
        const wasRemoved = formData.removedLeagues.some(removed => removed.id === league.id)
        return { ...league, removed: wasRemoved }
      }))
    }
  }, [formData.removedLeagues])

  const handleRemoveLeague = useCallback((leagueId: string) => {
    setLeagues(prev => prev.map(league => 
      league.id === leagueId 
        ? { ...league, removed: !league.removed }
        : league
    ))
  }, [])

  const handleNext = useCallback(() => {
    const removedLeagues = leagues.filter(league => league.removed)
    console.log('Removed leagues:', removedLeagues)
    
    // Save removed leagues data to BookingContext
    const removedLeaguesData = removedLeagues.map(league => ({
      id: league.id,
      name: league.name,
      country: league.country
    }))
    
    updateFormData({ removedLeagues: removedLeaguesData })
    
    // Move to next step (date selection)
    nextStep()
  }, [leagues, updateFormData, nextStep])



  return (
    <div className="w-[894px] p-6 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-center items-center gap-6">
      <div className="self-stretch flex flex-col justify-start items-start gap-4">
        <div className="justify-start text-neutral-800 text-lg font-bold font-['Poppins'] leading-loose">
          Which leagues don&apos;t you like?
        </div>
        <div className="self-stretch px-3.5 py-3 bg-green-100 rounded outline-1 outline-offset-[-1px] outline-lime-500 inline-flex justify-center items-center gap-2.5">
          <div className="justify-start">
            <span className="text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              Remove one for free, the rest 
            </span>
            <span className="text-lime-500 text-base font-medium font-['Poppins'] leading-7">
              +{REMOVAL_COST}€
            </span>
            <span className="text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              {' '}(per destination & person).
            </span>
          </div>
        </div>
      </div>

      {/* League cards grid */}
      <div className="self-stretch flex flex-wrap justify-start items-center gap-6">
        {leagues.map((league) => (
          <LeagueCard 
            key={league.id} 
            league={league} 
            onRemove={handleRemoveLeague}
          />
        ))}
      </div>

      <button 
        onClick={handleNext}
        className="w-44 h-11 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
      >
        <div className="text-center justify-start text-white text-base font-normal font-['Inter']">Next</div>
      </button>
    </div>
  )
}
