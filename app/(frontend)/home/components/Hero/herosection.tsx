"use client"
import { useState, useEffect, useRef } from "react"
import { IoChevronDown } from "react-icons/io5"
import { gsap } from "gsap"
import { useRouter } from "next/navigation"
import { useLanguage, formatPeopleCount } from "../../../_components/common/LanguageContext"

// Dynamic pack types based on sport selection
const getPackTypes = (sport: "Football" | "Basketball" | "Both", fromText: string) => {
  const packTypes = [
    {
      id: 1,
      name: "Standard",
      price: sport === "Football" 
        ? `${fromText} 299€` 
        : sport === "Basketball" 
          ? `${fromText} 279€` 
          : `${fromText} 279€` // Both - use lowest price
    },
    {
      id: 2,
      name: "Premium",
      price: sport === "Football" 
        ? `${fromText} 1399€` 
        : sport === "Basketball" 
          ? `${fromText} 1279€` 
          : `${fromText} 1279€` // Both - use lowest price
    }
  ]
  return packTypes
}

// Extended departure cities list
const departureCities = [
  { id: 1, name: "Madrid" },
  { id: 2, name: "Barcelona" },
  { id: 3, name: "Málaga" },
  { id: 4, name: "Valencia" },
  { id: 5, name: "Alicante" },
  { id: 6, name: "Bilbao" },
]

// People categories for the counter interface
interface PeopleCount {
  adults: number
  children: number
  babies: number
}

export default function HeroSection() {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { language, t } = useLanguage()

  // Sport selection state
  const [selectedSport, setSelectedSport] = useState<"Football" | "Basketball" | "Both">("Football")

  // Get dynamic pack types based on selected sport
  const packTypes = getPackTypes(selectedSport, t.common.from)

  // Dropdown states
  const [selectedPack, setSelectedPack] = useState(packTypes[0])
  const [selectedCity, setSelectedCity] = useState(departureCities[0])
  
  // People counter state
  const [peopleCount, setPeopleCount] = useState<PeopleCount>({
    adults: 2,
    children: 0,
    babies: 0
  })

  // Dropdown visibility states
  const [openDropdown, setOpenDropdown] = useState<"pack" | "city" | "people" | null>(null)

  // Calculate total people
  const totalPeople = peopleCount.adults + peopleCount.children + peopleCount.babies

  // Update selected pack when sport changes to maintain consistency
  useEffect(() => {
    const newPackTypes = getPackTypes(selectedSport, t.common.from)
    // Find the same pack type (Standard/Premium) in the new list
    const matchingPack = newPackTypes.find(pack => pack.name === selectedPack.name)
    if (matchingPack) {
      setSelectedPack(matchingPack)
    } else {
      // Fallback to first option if not found
      setSelectedPack(newPackTypes[0])
    }
  }, [selectedSport, t.common.from, selectedPack.name])

  // Handle dropdown toggle
  const toggleDropdown = (dropdown: "pack" | "city" | "people") => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
  }

  // Handle people count changes
  const updatePeopleCount = (category: keyof PeopleCount, increment: boolean) => {
    setPeopleCount(prev => {
      const newCount = { ...prev }
      const currentValue = newCount[category]
      
      if (increment) {
        // Check if we can add more (max 10 total)
        if (totalPeople < 10) {
          newCount[category] = currentValue + 1
        }
      } else {
        // Check if we can subtract (minimum 1 adult required)
        if (category === 'adults' && currentValue > 1) {
          newCount[category] = currentValue - 1
        } else if (category !== 'adults' && currentValue > 0) {
          newCount[category] = currentValue - 1
        }
      }
      
      return newCount
    })
  }

  // Format people count for display
  const formatPeopleDisplay = () => {
    return formatPeopleCount(peopleCount.adults, peopleCount.children, peopleCount.babies, language)
  }

  // Close all dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Hero text animation
  useEffect(() => {
    if (heroTextRef.current) {
      // Initial setup - hide text
      gsap.set(heroTextRef.current.children, {
        y: 100,
        opacity: 0,
      })
      // Animate text from bottom
      gsap.to(heroTextRef.current.children, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        delay: 0.1,
      })
    }
  }, [])

  return (
    <div className="w-full h-[100vh] min-h-[600px] md:h-[720px] relative flex-shrink-0 max-w-[1200px] mx-auto">
      <div
        className="absolute inset-0 rounded-none md:rounded-[24px] overflow-hidden"
        style={{ backgroundImage: "url(/homepage/Herobg.png)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative w-full max-w-[1200px] h-full mx-auto px-4 md:px-6 py-6 flex flex-col justify-end items-center gap-2.5">
        <div className="w-full flex flex-col justify-start items-start gap-6 md:gap-8">
          <div
            ref={heroTextRef}
            className="w-full max-w-[1041px] flex flex-col justify-start items-start gap-4 md:gap-6"
          >
            <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold font-['Inter'] leading-tight md:leading-[86.40px]">
              {t.hero.title}
            </h1>
            <p className="text-white text-sm sm:text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose">
              {t.hero.subtitle}
            </p>
          </div>

          <div
            className="w-full p-3 bg-white rounded-lg backdrop-blur-[5px] flex flex-col justify-start items-start gap-3"
            ref={dropdownRef}
          >
            {/* Sport Selection - Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="bg-gray-50 rounded-lg flex flex-col sm:flex-row w-full sm:inline-flex justify-start items-center">
              {(["Football", "Basketball", "Both"] as const).map((sport, index, array) => {
                const sportLabel = sport === "Football" ? t.hero.football : sport === "Basketball" ? t.hero.basketball : t.hero.both
                return (
                  <button
                    key={sport}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedSport(sport)
                    }}
                    className={`w-full sm:w-36 h-11 px-3.5 py-1.5 flex justify-center items-center gap-2.5 cursor-pointer ${
                      selectedSport === sport ? "bg-[#76C043] text-white" : "text-neutral-600"
                    } ${
                      // Mobile: rounded corners for first and last
                      index === 0
                        ? "rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                        : index === array.length - 1
                          ? "rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none"
                          : "sm:rounded-none"
                    } backdrop-blur-[5px]`}
                  >
                    <span className="text-center text-base font-normal font-['Inter']">{sportLabel}</span>
                  </button>
                )
              })}
            </div>

            {/* Form Section - Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="w-full p-3 bg-gray-50 rounded-xl flex flex-col lg:flex-row justify-start items-start lg:items-end gap-3">
              {/* Pack Type Dropdown */}
              <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-2 relative">
                <label className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">{t.hero.packType}</label>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown("pack")
                  }}
                  className="cursor-pointer w-full h-11 px-3.5 py-1.5 bg-white rounded outline outline-1 outline-offset-[-1px] outline-neutral-300 flex justify-between items-center"
                >
                  <span className="text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed">
                    {selectedPack.name === "Standard" ? t.hero.standard : t.hero.premium} - {selectedPack.price}
                  </span>
                  <IoChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openDropdown === "pack" ? "rotate-180" : ""}`}
                  />
                </div>
                {openDropdown === "pack" && (
                  <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-[100] py-1 border border-gray-200">
                    {packTypes.map((pack) => (
                      <div
                        key={pack.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPack(pack)
                          setOpenDropdown(null)
                        }}
                        className="px-3.5 py-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      >
                        <span className="text-sm font-normal font-['Poppins'] text-black">{pack.name === "Standard" ? t.hero.standard : t.hero.premium}</span>
                        <span className="text-sm font-medium text-black">{pack.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Departure City Dropdown */}
              <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-2 relative">
                <label className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">{t.hero.departure}</label>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown("city")
                  }}
                  className="cursor-pointer w-full h-11 px-3.5 py-1.5 bg-white rounded outline outline-1 outline-offset-[-1px] outline-neutral-300 flex justify-between items-center"
                >
                  <span className="text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed">
                    {selectedCity.name}
                  </span>
                  <IoChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openDropdown === "city" ? "rotate-180" : ""}`}
                  />
                </div>
                {openDropdown === "city" && (
                  <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-[100] py-1 border border-gray-200">
                    {departureCities.map((city) => (
                      <div
                        key={city.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedCity(city)
                          setOpenDropdown(null)
                        }}
                        className="px-3.5 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <span className="text-sm font-normal font-['Poppins'] text-black">{city.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* People Count Dropdown */}
              <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-2 relative">
                <label className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
                  {t.hero.howManyAreYou}
                </label>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown("people")
                  }}
                  className="cursor-pointer w-full h-11 px-3.5 py-1.5 bg-white rounded outline-1 outline-offset-[-1px] outline-neutral-300 flex justify-between items-center"
                >
                  <span className="text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed">
                    {formatPeopleDisplay()}
                  </span>
                  <IoChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openDropdown === "people" ? "rotate-180" : ""}`}
                  />
                </div>
                {openDropdown === "people" && (
                  <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-[100] p-4 border border-gray-200 min-w-[300px]">
                    <div className="space-y-4">
                      {/* Adults */}
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium font-['Poppins'] text-black">{t.hero.adults}</span>
                          <span className="text-xs text-gray-500 font-['Poppins']">{t.hero.adultsAge}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updatePeopleCount('adults', false)
                            }}
                            disabled={peopleCount.adults <= 1}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium font-['Poppins'] text-black w-6 text-center">{peopleCount.adults}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updatePeopleCount('adults', true)
                            }}
                            disabled={totalPeople >= 10}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium font-['Poppins'] text-black">{t.hero.children}</span>
                          <span className="text-xs text-gray-500 font-['Poppins']">{t.hero.childrenAge}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updatePeopleCount('children', false)
                            }}
                            disabled={peopleCount.children <= 0}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium font-['Poppins'] text-black w-6 text-center">{peopleCount.children}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updatePeopleCount('children', true)
                            }}
                            disabled={totalPeople >= 10}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Babies */}
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium font-['Poppins'] text-black">{t.hero.babies}</span>
                          <span className="text-xs text-gray-500 font-['Poppins']">{t.hero.babiesAge}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updatePeopleCount('babies', false)
                            }}
                            disabled={peopleCount.babies <= 0}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            −
                          </button>
                          <span className="text-sm font-medium font-['Poppins'] text-black w-6 text-center">{peopleCount.babies}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              updatePeopleCount('babies', true)
                            }}
                            disabled={totalPeople >= 10}
                            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Total count display */}
                      <div className="pt-2 border-t border-gray-200">
                        <div className="text-xs text-gray-500 font-['Poppins'] text-center">
                          {t.hero.total}: {totalPeople}/10 {t.hero.people}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  
                  // Check if all required fields are filled
                  const isAllFieldsFilled = selectedSport && selectedPack && selectedCity && totalPeople > 0
                  
                  console.log('🎯 Hero section data validation:', {
                    selectedSport,
                    selectedPack: selectedPack.name,
                    selectedCity: selectedCity.name,
                    totalPeople,
                    peopleCount,
                    isAllFieldsFilled
                  })
                  
                  if (isAllFieldsFilled) {
                    // Create hero data object for BookingContext
                    const heroData = {
                      selectedSport: selectedSport.toLowerCase(),
                      selectedPackage: selectedPack.name.toLowerCase(),
                      selectedCity: selectedCity.name.toLowerCase(),
                      peopleCount: {
                        adults: peopleCount.adults,
                        kids: peopleCount.children,
                        babies: peopleCount.babies
                      },
                      fromHero: true,
                      startFromStep: 4 // Start from step 5 (0-indexed)
                    }
                    
                    // Save hero data to localStorage for BookingContext to pick up
                    localStorage.setItem('gogame_hero_data', JSON.stringify(heroData))
                    console.log('🎯 Hero data saved for stepper:', heroData)
                  } else {
                    // Clear any existing hero data if not all fields are filled
                    localStorage.removeItem('gogame_hero_data')
                    console.log('📝 Starting fresh booking - not all hero fields filled')
                  }
                  
                  // Navigate to booking page
                  router.push('/book')
                }}
                className="w-full lg:w-44 h-11 px-3.5 py-1.5 bg-[#76C043] rounded backdrop-blur-[5px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
              >
                <span className="text-center text-white text-base font-normal font-['Inter']">{t.hero.startTheGame}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
