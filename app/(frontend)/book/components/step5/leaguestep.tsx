'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FaCheck } from 'react-icons/fa';

interface LeagueOption {
  id: string;
  title: string;
  price: string;
  imagePath: string;
}

interface LeagueFormData {
  selectedLeague: string;
}

const LEAGUE_OPTIONS: LeagueOption[] = [
  {
    id: 'national',
    title: 'National Leagues',
    price: '',
    imagePath: '/stepper/league1.png'
  },
  {
    id: 'european',
    title: 'European Competition',
    price: '+50€',
    imagePath: '/stepper/league2.png'
  }
];

const CONTAINER_STYLES = "w-[894px] h-[638px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-6";

const CARD_BASE_STYLES = "flex-1 h-48 py-6 rounded inline-flex flex-col justify-center items-center gap-2.5 cursor-pointer relative overflow-hidden transition-all duration-300 hover:shadow-lg group";

const getCardStyles = (isSelected: boolean): string => {
  const overlayStyles = isSelected
    ? "outline outline-2 outline-offset-2 outline-lime-500"
    : "hover:outline hover:outline-1 hover:outline-lime-300";
  
  return `${CARD_BASE_STYLES} ${overlayStyles}`;
};

const getButtonStyles = (isDisabled: boolean): string => {
  const baseStyles = "w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all";
  const conditionalStyles = isDisabled
    ? "bg-gray-400 cursor-not-allowed"
    : "bg-lime-500 hover:bg-lime-600 cursor-pointer";
  
  return `${baseStyles} ${conditionalStyles}`;
};

export default function LeagueStep() {
  const { control, watch, handleSubmit } = useForm<LeagueFormData>({
    defaultValues: {
      selectedLeague: ''
    }
  });

  const selectedLeague = watch('selectedLeague');

  const onSubmit = (data: LeagueFormData) => {
    if (data.selectedLeague) {
      console.log('Selected league:', data.selectedLeague);
      // Handle navigation to next step
    }
  };

  const renderLeagueCard = (option: LeagueOption, onChange: (value: string) => void) => {
    const isSelected = selectedLeague === option.id;
    
    return (
      <div
        key={option.id}
        className={getCardStyles(isSelected)}
        onClick={() => onChange(option.id)}
      >
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundImage: `url(${option.imagePath})` }}
        />

        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/40 rounded transition-colors duration-300 group-hover:bg-lime-900/40" />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-lime-500/0 rounded transition-all duration-300 group-hover:bg-lime-500/20" />
        
        {/* League Title */}
        <div className="relative z-10 self-stretch text-center justify-start text-white text-lg font-bold font-['Poppins'] leading-loose drop-shadow-lg">
          {option.title} {option.price}
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-lime-500 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 animate-pulse">
            <FaCheck className="text-white text-sm" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={CONTAINER_STYLES}>
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
            <Controller
              name="selectedLeague"
              control={control}
              render={({ field: { onChange } }) => (
                <>
                  {LEAGUE_OPTIONS.map((option) => renderLeagueCard(option, onChange))}
                </>
              )}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={!selectedLeague}
            className={getButtonStyles(!selectedLeague)}
            type="button"
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
