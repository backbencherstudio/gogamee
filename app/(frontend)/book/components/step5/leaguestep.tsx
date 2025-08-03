'use client';

import React, { useState } from 'react';
import { FaCheck } from 'react-icons/fa';

interface LeagueOption {
  id: string;
  title: string;
  price: string;
  imagePath: string;
  isSelected: boolean;
}

export default function LeagueStep() {
  const [selectedLeague, setSelectedLeague] = useState<string>('');

  const leagueOptions: LeagueOption[] = [
    {
      id: 'national',
      title: 'National Leagues',
      price: '',
      imagePath: '/stepper/league1.png',
      isSelected: selectedLeague === 'national'
    },
    {
      id: 'european',
      title: 'European Competition',
      price: '+50€',
      imagePath: '/stepper/league2.png',
      isSelected: selectedLeague === 'european'
    }
  ];

  const handleLeagueSelection = (leagueId: string) => {
    setSelectedLeague(leagueId);
  };

  const handleNextStep = () => {
    if (selectedLeague) {
      // Handle navigation to next step
      console.log('Selected league:', selectedLeague);
    }
  };

  const getCardStyling = (option: LeagueOption) => {
    const baseStyle = "flex-1 h-48 py-6 rounded inline-flex flex-col justify-center items-center gap-2.5 cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-lg group";
    const overlayStyle = option.isSelected
      ? "outline outline-2 outline-offset-2 outline-lime-500"
      : "hover:outline hover:outline-1 hover:outline-lime-300";
    
    return `${baseStyle} ${overlayStyle}`;
  };

  return (
    <div className="w-[894px] h-[638px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-6">
      <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-3">
        {/* Header Section */}
        <div className="self-stretch h-12 flex flex-col justify-start items-start gap-3">
          <div className="justify-center text-neutral-800 text-3xl font-semibold font-['Poppins'] leading-10">
            Which type of competition do you want to attend?
          </div>
        </div>

        {/* Content Section */}
        <div className="self-stretch flex-1 flex flex-col justify-between items-start">
          {/* League Options */}
          <div className="self-stretch inline-flex justify-center items-center gap-6 flex-wrap content-center">
            {leagueOptions.map((option) => (
              <div
                key={option.id}
                className={getCardStyling(option)}
                onClick={() => handleLeagueSelection(option.id)}
              >
                {/* Background Image Layer - This scales on hover */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${option.imagePath})`
                  }}
                ></div>

                {/* Background Overlay */}
                <div className="absolute inset-0 bg-black/40 rounded transition-colors duration-300 group-hover:bg-lime-900/40"></div>
                
                {/* Greenish Hover Overlay */}
                <div className="absolute inset-0 bg-lime-500/0 rounded transition-all duration-300 group-hover:bg-lime-500/20"></div>
                
                {/* League Title - positioned over the background */}
                <div className="relative z-10 self-stretch text-center justify-start text-white text-lg font-bold font-['Poppins'] leading-loose drop-shadow-lg">
                  {option.title} {option.price}
                </div>

                {/* Green Tick Icon for Selected State */}
                {option.isSelected && (
                  <div className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 animate-pulse">
                    <FaCheck className="text-white text-sm" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextStep}
            disabled={!selectedLeague}
            className={`w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all ${
              selectedLeague
                ? 'bg-lime-500 hover:bg-lime-600 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
              Next
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
