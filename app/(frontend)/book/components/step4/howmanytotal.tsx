'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { HiMinus, HiPlus } from 'react-icons/hi2';
import { useBooking } from '../../context/BookingContext';

// Types
interface CounterFormData {
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
  isMinimumReached: boolean;
}

// Constants
const DEFAULT_VALUES: CounterFormData = {
  adults: 1,
  kids: 2,
  babies: 0,
};

const MAX_TOTAL_PEOPLE = 11;
const MIN_ADULTS = 1;

const COUNTER_CONFIG = [
  {
    key: 'adults' as keyof CounterFormData,
    title: 'Adults',
    description: '12 years or more',
    minValue: MIN_ADULTS,
  },
  {
    key: 'kids' as keyof CounterFormData,
    title: 'Kids',
    description: '2-11 years old',
    minValue: 0,
  },
  {
    key: 'babies' as keyof CounterFormData,
    title: 'Baby',
    description: '0 to 2 years old',
    minValue: 0,
  },
] as const;

// Counter Item Component
const CounterItem: React.FC<CounterItemProps> = ({
  title,
  description,
  count,
  onIncrement,
  onDecrement,
  canIncrement = true,
  isMinimumReached,
}) => {
  return (
    <div className="self-stretch py-3 border-b border-neutral-200 last:border-b-0 flex justify-between items-center">
      <div className="flex-1 xl:w-28 flex flex-col justify-start items-start">
        <div className="self-stretch justify-start text-zinc-950 text-base xl:text-lg font-normal font-['Poppins'] leading-loose">
          {title}
        </div>
        <div className="self-stretch text-left justify-start text-zinc-500 text-xs xl:text-sm font-normal font-['Poppins'] leading-relaxed">
          {description}
        </div>
      </div>
      
      <div className="flex justify-start items-center gap-3 xl:gap-4">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={onDecrement}
          disabled={isMinimumReached}
          className="w-8 h-8 xl:w-6 xl:h-6 p-0.5 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiMinus 
            className={`w-4 h-4 xl:w-3.5 xl:h-3.5 ${!isMinimumReached ? 'text-zinc-950' : 'text-neutral-300'}`} 
          />
        </button>
        
        {/* Count Display */}
        <div className="text-center justify-start text-zinc-950 text-lg font-medium font-['Poppins'] leading-loose min-w-[2ch] xl:min-w-[1ch]">
          {count}
        </div>
        
        {/* Increment Button */}
        <button
          type="button"
          onClick={onIncrement}
          disabled={!canIncrement}
          className="w-8 h-8 xl:w-6 xl:h-6 p-0.5 rounded-xl outline outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiPlus className={`w-4 h-4 xl:w-3.5 xl:h-3.5 ${canIncrement ? 'text-zinc-950' : 'text-neutral-300'}`} />
        </button>
      </div>
    </div>
  );
};

// Main Component
export default function HowManyTotal() {
  const { formData, updateFormData, nextStep } = useBooking();
  
  // Calculate default values from existing data or defaults
  const getDefaultValues = (): CounterFormData => {
    if (formData.peopleCount.adults || formData.peopleCount.kids || formData.peopleCount.babies) {
      return {
        adults: formData.peopleCount.adults,
        kids: formData.peopleCount.kids,
        babies: formData.peopleCount.babies
      }
    }
    return DEFAULT_VALUES;
  }
  
  const { control, watch, setValue, handleSubmit } = useForm<CounterFormData>({
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const watchedValues = watch();
  const totalCount = watchedValues.adults + watchedValues.kids + watchedValues.babies;
  const canAddMore = totalCount < MAX_TOTAL_PEOPLE;

  const updateCount = (
    field: keyof CounterFormData,
    operation: 'increment' | 'decrement',
    minValue: number
  ) => {
    const currentValue = watchedValues[field];
    
    if (operation === 'increment') {
      if (totalCount >= MAX_TOTAL_PEOPLE) return;
      setValue(field, currentValue + 1, { shouldValidate: true });
    } else {
      const newValue = Math.max(minValue, currentValue - 1);
      setValue(field, newValue, { shouldValidate: true });
    }
  };

  const onSubmit = (data: CounterFormData) => {
    const totalPeople = data.adults + data.kids + data.babies;
    console.log('Current counts:', data, 'Total:', totalPeople);
    
    // Update the booking context with detailed people count
    updateFormData({ 
      peopleCount: {
        adults: data.adults,
        kids: data.kids,
        babies: data.babies
      }
    });
    
    // Move to next step
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full xl:w-[894px] xl:h-[638px] px-4 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-6 min-h-[500px] xl:min-h-0">
        <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-3">
          {/* Header */}
          <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
            <h2 className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
              How many are you?
            </h2>
          </div>
          
          {/* Content */}
          <div className="self-stretch flex-1 flex flex-col justify-between items-start gap-8 xl:gap-0">
            {/* Counter Section */}
            <div className="w-full xl:w-[473px] p-3 bg-white rounded-xl flex flex-col justify-start items-start whitespace-nowrap">
              {COUNTER_CONFIG.map(({ key, title, description, minValue }) => (
                <Controller
                  key={key}
                  name={key}
                  control={control}
                  render={({ field }) => (
                    <CounterItem
                      title={title}
                      description={description}
                      count={field.value}
                      onIncrement={() => updateCount(key, 'increment', minValue)}
                      onDecrement={() => updateCount(key, 'decrement', minValue)}
                      canIncrement={canAddMore}
                      isMinimumReached={field.value <= minValue}
                    />
                  )}
                />
              ))}
            </div>
            
            {/* Next Button */}
            <button
              type="submit"
              className="w-44 h-11 px-3.5 py-1.5 bg-[#6AAD3C] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors"
            >
              <span className="text-center justify-start text-white text-base font-normal font-['Inter']">
                Next
              </span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
