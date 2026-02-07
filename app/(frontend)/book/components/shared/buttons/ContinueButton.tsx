"use client";

import React from "react";
import { TranslatedText } from "../../../../_components/TranslatedText";

interface ContinueButtonProps {
  onClick: () => void;
  disabled?: boolean;
  text?: string;
  englishText?: string;
  className?: string;
}

/**
 * Reusable Continue Button component
 * Used across multiple booking steps with consistent styling
 */
export function ContinueButton({
  onClick,
  disabled = false,
  text = "Continuar",
  englishText = "Continue",
  className = "",
}: ContinueButtonProps) {
  const baseStyles =
    "w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-colors";

  const enabledStyles = "bg-[#76C043] hover:bg-lime-600 cursor-pointer";
  const disabledStyles = "bg-gray-300 cursor-not-allowed opacity-50";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${disabled ? disabledStyles : enabledStyles} ${className}`}
      type="button"
    >
      <div className="text-center text-white text-sm font-medium font-['Poppins'] leading-snug">
        <TranslatedText text={text} english={englishText} />
      </div>
    </button>
  );
}
