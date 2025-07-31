'use client'

import React, { useState } from 'react'
import { IoChevronDown } from 'react-icons/io5'

const sportsOptions = [
  { value: 'football', label: 'Football' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'golf', label: 'Golf' },
]

export default function SportsYouPreffer() {
  const [selectedSport, setSelectedSport] = useState<string>('football')
  const [isOpen, setIsOpen] = useState(false)

  const handleSportSelect = (value: string) => {
    setSelectedSport(value)
    setIsOpen(false)
  }

  const handleNext = () => {
    console.log('Selected sport:', selectedSport)
    // Handle navigation to next step
  }

  const selectedLabel = sportsOptions.find(sport => sport.value === selectedSport)?.label || 'Select a sport'

  return (
    <div className="w-full max-w-[894px] h-[638px] p-6 bg-[#F1F9EC] rounded-xl border border-lime-500/20 mb-10">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-10 mb-3">
          What sport do you prefer?
        </h1>
        <p className="text-base text-neutral-600 font-['Poppins'] leading-7">
          We always try to maximize the time at the destination
        </p>
      </div>

      {/* Content Section */}
      <div className="flex flex-col justify-between h-[calc(100%-120px)]">
        {/* Dropdown Section */}
        <div className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="w-full max-w-96 h-11 px-5 py-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-all"
          >
            <span className="text-sm text-zinc-950 font-['Poppins']">
              {selectedLabel}
            </span>
            <IoChevronDown 
              className={`w-5 h-5 text-zinc-950 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>

          {/* Dropdown Options */}
          {isOpen && (
            <div className="absolute top-12 left-0 w-full max-w-96 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
              {sportsOptions.map((sport) => (
                <div
                  key={sport.value}
                  onClick={() => handleSportSelect(sport.value)}
                  className={`
                    px-5 py-3 cursor-pointer hover:bg-gray-50 transition-all
                    ${selectedSport === sport.value ? 'bg-lime-50 text-lime-700' : 'text-zinc-950'}
                    ${sport.value === sportsOptions[0].value ? 'rounded-t-lg' : ''}
                    ${sport.value === sportsOptions[sportsOptions.length - 1].value ? 'rounded-b-lg' : ''}
                  `}
                >
                  <span className="text-sm font-['Poppins']">
                    {sport.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="w-44 h-11 px-3.5 py-1.5 bg-[#76C043] hover:bg-lime-600 rounded backdrop-blur-[5px] flex justify-center items-center transition-all"
        >
          <span className="text-base text-white font-['Inter']">Next</span>
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
