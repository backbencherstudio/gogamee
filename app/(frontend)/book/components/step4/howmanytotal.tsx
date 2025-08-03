'use client';

import React, { useState } from 'react';
import { HiMinus, HiPlus } from 'react-icons/hi2';

interface CounterData {
  adults: number;
  kids: number;
  babies: number;
}

interface CounterItemProps {
  title: string;
  description: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minValue?: number;
  canIncrement?: boolean;
}

const CounterItem: React.FC<CounterItemProps> = ({
  title,
  description,
  count,
  onIncrement,
  onDecrement,
  minValue = 0,
  canIncrement = true
}) => {
  const canDecrement = count > minValue;

  return (
    <div className="self-stretch py-3 border-b border-neutral-200 last:border-b-0 inline-flex justify-between items-center">
      <div className="w-28 inline-flex flex-col justify-start items-start">
        <div className="self-stretch justify-start text-zinc-950 text-lg font-normal font-['Poppins'] leading-loose">
          {title}
        </div>
        <div className="self-stretch text-center justify-start text-zinc-500 text-sm font-normal font-['Poppins'] leading-relaxed">
          {description}
        </div>
      </div>
      
      <div className="flex justify-start items-center gap-4">
        {/* Decrement Button */}
        <button
          onClick={onDecrement}
          disabled={!canDecrement}
          className="w-6 h-6 p-0.5 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiMinus 
            className={`w-3.5 h-3.5 ${canDecrement ? 'text-zinc-950' : 'text-neutral-300'}`} 
          />
        </button>
        
        {/* Count Display */}
        <div className="text-center justify-start text-zinc-950 text-lg font-medium font-['Poppins'] leading-loose min-w-[1ch]">
          {count}
        </div>
        
        {/* Increment Button */}
        <button
          onClick={onIncrement}
          disabled={!canIncrement}
          className="w-6 h-6 p-0.5 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiPlus className={`w-3.5 h-3.5 ${canIncrement ? 'text-zinc-950' : 'text-neutral-300'}`} />
        </button>
      </div>
    </div>
  );
};

export default function HowManyTotal() {
  const [counts, setCounts] = useState<CounterData>({
    adults: 1,
    kids: 2,
    babies: 0
  });

  const totalCount = counts.adults + counts.kids + counts.babies;
  const maxTotal = 11;
  const canAddMore = totalCount < maxTotal;

  const updateCount = (
    type: keyof CounterData,
    operation: 'increment' | 'decrement',
    minValue: number = 0
  ) => {
    setCounts(prev => {
      const currentValue = prev[type];
      
      if (operation === 'increment' && totalCount >= maxTotal) {
        return prev; // Don't allow increment if at max total
      }
      
      const newValue = operation === 'increment' 
        ? currentValue + 1 
        : Math.max(minValue, currentValue - 1);
      
      return {
        ...prev,
        [type]: newValue
      };
    });
  };

  const handleNext = () => {
    // Handle next step logic here
    console.log('Current counts:', counts, 'Total:', totalCount);
  };

  return (
    <div className="w-[894px] h-[638px] px-6 py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-lime-500/20 inline-flex flex-col justify-start items-start gap-6">
      <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-3">
        {/* Header */}
        <div className="self-stretch h-12 flex flex-col justify-start items-start gap-3">
          <h2 className="justify-center text-neutral-800 text-3xl font-semibold font-['Poppins'] leading-10">
            How many are you?
          </h2>
          {/* {totalCount >= maxTotal && (
            <p className="text-sm text-orange-600 font-medium">
              Maximum {maxTotal} people allowed
            </p>
          )} */}
        </div>
        
        {/* Content */}
        <div className="self-stretch flex-1 flex flex-col justify-between items-start">
          {/* Counter Section */}
          <div className="w-[473px] p-3 bg-white rounded-xl flex flex-col justify-start items-start whitespace-nowrap">
            <CounterItem
              title="Adults"
              description="12 years or more"
              count={counts.adults}
              onIncrement={() => updateCount('adults', 'increment')}
              onDecrement={() => updateCount('adults', 'decrement', 1)}
              minValue={1}
              canIncrement={canAddMore}
            />
            
            <CounterItem
              title="Kids"
              description="2-11 years old"
              count={counts.kids}
              onIncrement={() => updateCount('kids', 'increment')}
              onDecrement={() => updateCount('kids', 'decrement')}
              canIncrement={canAddMore}
            />
            
            <CounterItem
              title="Baby"
              description="0 to 2 years old"
              count={counts.babies}
              onIncrement={() => updateCount('babies', 'increment')}
              onDecrement={() => updateCount('babies', 'decrement')}
              canIncrement={canAddMore}
            />
          </div>
          
          {/* Next Button */}
          <button
            onClick={handleNext}
            className="w-44 h-11 px-3.5 py-1.5 bg-lime-500 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors"
          >
            <span className="text-center justify-start text-white text-base font-normal font-['Inter']">
              Next
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
