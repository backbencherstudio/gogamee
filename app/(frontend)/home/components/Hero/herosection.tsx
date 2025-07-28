"use client"
import { useState, useEffect, useRef } from "react"
import { IoChevronDown } from "react-icons/io5"
import { gsap } from "gsap"

// Data for dropdowns
const packTypes = [
  { id: 1, name: "Standard", price: "€299" },
  { id: 2, name: "Premium", price: "€499" },
  { id: 3, name: "VIP", price: "€799" },
]

const departureCities = [
  { id: 1, name: "Madrid" },
  { id: 2, name: "Barcelona" },
  { id: 3, name: "Valencia" },
  { id: 4, name: "Seville" },
]

const peopleOptions = [
  { id: 1, name: "Adults 1" },
  { id: 2, name: "Adults 2" },
  { id: 3, name: "Adults 3" },
  { id: 4, name: "Adults 4" },
]

export default function HeroSection() {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const heroTextRef = useRef<HTMLDivElement>(null)

  // Sport selection state
  const [selectedSport, setSelectedSport] = useState<"Football" | "Basketball" | "Both">("Football")

  // Dropdown states
  const [selectedPack, setSelectedPack] = useState(packTypes[0])
  const [selectedCity, setSelectedCity] = useState(departureCities[0])
  const [selectedPeople, setSelectedPeople] = useState(peopleOptions[1])

  // Dropdown visibility states
  const [openDropdown, setOpenDropdown] = useState<"pack" | "city" | "people" | null>(null)

  // Handle dropdown toggle
  const toggleDropdown = (dropdown: "pack" | "city" | "people") => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown)
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
              Are you ready to experience sports like never before?
            </h1>
            <p className="text-white text-sm sm:text-base md:text-lg font-normal font-['Poppins'] leading-relaxed md:leading-loose">
              Let your passion for soccer or basketball take you to an unexpected place. The destination is a surprise.
            </p>
          </div>

          <div
            className="w-full p-3 bg-white rounded-lg backdrop-blur-[5px] flex flex-col justify-start items-start gap-3"
            ref={dropdownRef}
          >
            {/* Sport Selection - Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="bg-gray-50 rounded-lg flex flex-col sm:flex-row w-full sm:inline-flex justify-start items-center">
              {(["Football", "Basketball", "Both"] as const).map((sport, index, array) => (
                <button
                  key={sport}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedSport(sport)
                  }}
                  className={`w-full sm:w-36 h-11 px-3.5 py-1.5 flex justify-center items-center gap-2.5 ${
                    selectedSport === sport ? "bg-lime-500 text-white" : "text-neutral-600"
                  } ${
                    // Mobile: rounded corners for first and last
                    index === 0
                      ? "rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                      : index === array.length - 1
                        ? "rounded-b-lg sm:rounded-r-lg sm:rounded-bl-none"
                        : "sm:rounded-none"
                  } backdrop-blur-[5px]`}
                >
                  <span className="text-center text-base font-normal font-['Inter']">{sport}</span>
                </button>
              ))}
            </div>

            {/* Form Section - Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="w-full p-3 bg-gray-50 rounded-xl flex flex-col lg:flex-row justify-start items-start lg:items-end gap-3">
              {/* Pack Type Dropdown */}
              <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-2 relative">
                <label className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">Pack type:</label>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown("pack")
                  }}
                  className="cursor-pointer w-full h-11 px-3.5 py-1.5 bg-white rounded outline outline-1 outline-offset-[-1px] outline-neutral-300 flex justify-between items-center"
                >
                  <span className="text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed">
                    {selectedPack.name} - {selectedPack.price}
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
                        <span className="text-sm font-normal font-['Poppins'] text-black">{pack.name}</span>
                        <span className="text-sm font-medium text-black">{pack.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Departure City Dropdown */}
              <div className="w-full lg:flex-1 flex flex-col justify-center items-start gap-2 relative">
                <label className="text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">Departure:</label>
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
                  How many are you?:
                </label>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown("people")
                  }}
                  className="cursor-pointer w-full h-11 px-3.5 py-1.5 bg-white rounded outline outline-1 outline-offset-[-1px] outline-neutral-300 flex justify-between items-center"
                >
                  <span className="text-zinc-950 text-sm font-normal font-['Poppins'] leading-relaxed">
                    {selectedPeople.name}
                  </span>
                  <IoChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${openDropdown === "people" ? "rotate-180" : ""}`}
                  />
                </div>
                {openDropdown === "people" && (
                  <div className="absolute top-[100%] left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-[100] py-1 border border-gray-200">
                    {peopleOptions.map((option) => (
                      <div
                        key={option.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedPeople(option)
                          setOpenDropdown(null)
                        }}
                        className="px-3.5 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <span className="text-sm font-normal font-['Poppins'] text-black">{option.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle form submission here
                  console.log({
                    sport: selectedSport,
                    packType: selectedPack,
                    city: selectedCity,
                    people: selectedPeople,
                  })
                }}
                className="w-full lg:w-44 h-11 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors"
              >
                <span className="text-center text-white text-base font-normal font-['Inter']">Start the game</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
