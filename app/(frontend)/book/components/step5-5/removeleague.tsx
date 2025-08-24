'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useBooking } from '../../context/BookingContext'
import { homepageLeaguesData } from '../../../../lib/appdata'

// Types
interface League {
  id: string
  name: string
  country: string
  image: string
  removed: boolean
}

// League Card Component
interface LeagueCardProps {
  league: League
  onRemove: (leagueId: string) => void
}

const LeagueCard = React.memo(({ league, onRemove }: LeagueCardProps) => {
  const [isClicked, setIsClicked] = useState(false)
  
  const handleRemoveClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    onRemove(league.id)
  }, [league.id, onRemove])

  const handleCardClick = useCallback(() => {
    // Only for small screens - toggle the clicked state
    setIsClicked(prev => !prev)
  }, [])

  // Reset clicked state when league is removed
  useEffect(() => {
    if (league.removed) {
      setIsClicked(false)
    }
  }, [league.removed])

  return (
    <div 
      className="group w-40 xl:w-48 h-60 xl:h-72 rounded-lg relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
      onClick={handleCardClick}
    >
      <Image
        src={league.image}
        alt={league.name}
        fill
        className="object-cover"
        priority={league.id === '1'} // Priority for first image
        sizes="(max-width: 768px) 160px, 192px" // Responsive sizes for mobile/desktop
      />
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className={`absolute bottom-0 left-0 right-0 px-4 py-5 flex flex-col justify-end items-start gap-2.5 transition-all duration-300 ease-out ${!league.removed ? `${isClicked ? 'pb-16 md:pb-5' : ''} md:group-hover:pb-16` : ''}`}>
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
          className={`absolute bottom-0 left-0 right-0 px-4 pb-5 transition-all duration-300 ease-out 
                     ${isClicked ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
                     md:opacity-0 md:translate-y-4 md:pointer-events-none 
                     md:group-hover:opacity-100 md:group-hover:translate-y-0 md:group-hover:pointer-events-auto`}
          onClick={handleRemoveClick}
        >
          <div className="self-stretch px-4 py-2 w-full bg-[#6AAD3C] hover:bg-lime-600 rounded-[999px] inline-flex justify-center items-center gap-2.5 transition-colors cursor-pointer">
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
  
  // Debug logging
  console.log('🎯 RemoveLeague - formData:', {
    selectedSport: formData.selectedSport,
    selectedLeague: formData.selectedLeague,
    removedLeagues: formData.removedLeagues
  })
  
  // Get the appropriate leagues based on selected sport and league type
  const availableLeagues = useMemo(() => {
    const selectedSport = formData.selectedSport?.toLowerCase()
    const selectedLeagueType = formData.selectedLeague
    
    console.log('🎯 RemoveLeague - determining leagues:', { selectedSport, selectedLeagueType })
    
    // Validate that we have the required data
    if (!selectedSport || !selectedLeagueType) {
      console.warn('🎯 RemoveLeague - Missing required data:', { selectedSport, selectedLeagueType })
      // Return empty array if data is missing
      return []
    }
    
    // If European competition is selected, show all leagues from both sports
    if (selectedLeagueType === 'european') {
      const footballLeagues = homepageLeaguesData.getFootballLeagues()
      const basketballLeagues = homepageLeaguesData.getBasketballLeagues()
      const allLeagues = [...footballLeagues, ...basketballLeagues]
      console.log('🎯 RemoveLeague - European competition selected, showing all leagues:', allLeagues.length)
      return allLeagues
    }
    
    // If national leagues is selected, show leagues based on selected sport
    if (selectedLeagueType === 'national') {
      if (selectedSport === 'football') {
        const footballLeagues = homepageLeaguesData.getFootballLeagues()
        console.log('🎯 RemoveLeague - Football + National selected, showing football leagues:', footballLeagues.length)
        return footballLeagues
      } else if (selectedSport === 'basketball') {
        const basketballLeagues = homepageLeaguesData.getBasketballLeagues()
        console.log('🎯 RemoveLeague - Basketball + National selected, showing basketball leagues:', basketballLeagues.length)
        return basketballLeagues
      } else if (selectedSport === 'both') {
        // For "Both" sports, show leagues from both sports
        const footballLeagues = homepageLeaguesData.getFootballLeagues()
        const basketballLeagues = homepageLeaguesData.getBasketballLeagues()
        const bothLeagues = [...footballLeagues, ...basketballLeagues]
        console.log('🎯 RemoveLeague - Both sports + National selected, showing both leagues:', bothLeagues.length)
        return bothLeagues
      }
    }
    
    // Default fallback - return football leagues
    const defaultLeagues = homepageLeaguesData.getFootballLeagues()
    console.log('🎯 RemoveLeague - Default fallback, showing football leagues:', defaultLeagues.length)
    return defaultLeagues
  }, [formData.selectedSport, formData.selectedLeague])
  
  console.log('🎯 RemoveLeague - availableLeagues:', availableLeagues)
  
  // Initialize leagues from sport-specific data
  const [leagues, setLeagues] = useState<League[]>(() => 
    availableLeagues.map(league => ({
      ...league,
      removed: false
    }))
  )

  // Update leagues when availableLeagues changes
  useEffect(() => {
    console.log('🎯 RemoveLeague - updating leagues with:', availableLeagues.length, 'leagues')
    setLeagues(availableLeagues.map(league => ({
      ...league,
      removed: false
    })))
  }, [availableLeagues])

  // Load existing removed leagues data when component mounts
  useEffect(() => {
    if (formData.removedLeagues && formData.removedLeagues.length > 0) {
      console.log('🎯 RemoveLeague - loading existing removed leagues:', formData.removedLeagues)
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
    console.log('🎯 RemoveLeague - removed leagues:', removedLeagues)
    
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

  // Get removal cost (using the same logic as before)
  const removalCost = 20 // €20 per removal after the first free one

  // Show loading or error state if no leagues are available
  if (availableLeagues.length === 0) {
    return (
      <div className="w-full xl:w-[894px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-center items-center gap-6 min-h-[600px] xl:min-h-0">
        <div className="text-center">
          <div className="text-neutral-800 text-xl xl:text-2xl font-bold font-['Poppins'] mb-4">
            Loading leagues...
          </div>
          <div className="text-neutral-600 text-base font-normal font-['Poppins']">
            Please ensure you have selected a sport and league type in the previous steps.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full xl:w-[894px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-center items-center gap-6 min-h-[600px] xl:min-h-0">
      <div className="self-stretch flex flex-col justify-start items-start gap-4">
        <div className="justify-start text-neutral-800 text-xl xl:text-2xl font-bold font-['Poppins'] leading-loose">
          Which leagues don&apos;t you like?
        </div>
        <div className="self-stretch px-3.5 py-3 bg-green-100 rounded outline-1 outline-offset-[-1px] outline-[#76C043] inline-flex justify-center items-center gap-2.5">
          <div className="justify-start">
            <span className="text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              Remove one for free, the rest 
            </span>
            <span className="text-[#76C043] text-base font-medium font-['Poppins'] leading-7">
              +{removalCost}€
            </span>
            <span className="text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              {' '}(per destination & person).
            </span>
          </div>
        </div>
      </div>

      {/* League cards grid */}
      <div className="self-stretch flex flex-wrap justify-center xl:justify-start items-center gap-4 xl:gap-6">
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
        className="w-44 h-11 px-3.5 py-1.5 bg-[#76C043] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
      >
        <div className="text-center justify-start text-white text-base font-normal font-['Inter']">Next</div>
      </button>
    </div>
  )
}
