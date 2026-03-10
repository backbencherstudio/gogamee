"use client";

import React from "react";
import { useBooking } from "../../../context/BookingContext";

interface BookingNavigationProps {
  onNext: () => void;
  onBack?: () => void;
  nextText?: string;
  backText?: string;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  showBack?: boolean;
  showNext?: boolean;
  className?: string;
}

/**
 * Reusable Navigation Buttons for Booking steps
 * Includes "Anterior" (Back) and "Siguiente" (Next) buttons
 */
export function BookingNavigation({
  onNext,
  onBack,
  nextText = "Siguiente",
  backText = "Anterior",
  nextDisabled = false,
  backDisabled = false,
  showBack = true,
  showNext = true,
  className = "",
}: BookingNavigationProps) {
  const { previousStep, currentStep } = useBooking();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      previousStep();
    }
  };

  const baseButtonStyles =
    "w-full sm:w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-all duration-300 font-medium font-['Poppins'] leading-snug";
  
  const primaryButtonStyles = nextDisabled 
    ? "bg-gray-300 cursor-not-allowed opacity-50 text-white" 
    : "bg-[#76C043] hover:bg-lime-600 cursor-pointer text-white shadow-sm hover:shadow-md";

  const secondaryButtonStyles = backDisabled
    ? "bg-gray-100 cursor-not-allowed opacity-50 text-gray-400 border border-gray-200"
    : "bg-white border border-[#76C043] text-[#76C043] hover:bg-green-50 cursor-pointer shadow-sm hover:shadow-md";

  // Hide back button on the first step
  const shouldShowBack = showBack && currentStep > 0;

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 w-full ${shouldShowBack ? 'justify-between' : 'justify-end'} ${className}`}>
      {shouldShowBack && (
        <button
          onClick={handleBack}
          disabled={backDisabled}
          className={`${baseButtonStyles} ${secondaryButtonStyles}`}
          type="button"
        >
          {backText}
        </button>
      )}
      
      {showNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`${baseButtonStyles} ${primaryButtonStyles}`}
          type="button"
        >
          {nextText}
        </button>
      )}
    </div>
  );
}
