import React, { useMemo, useCallback } from "react";

// Internal Components
const CheckIcon: React.FC = React.memo(() => (
  <svg
    className="w-4 h-4 text-white"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
));
CheckIcon.displayName = "CheckIcon";

const DecorativePattern: React.FC = React.memo(() => (
  <div className="absolute inset-0 opacity-20" aria-hidden="true">
    <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full" />
    <div className="absolute top-8 right-6 w-1 h-1 bg-white rounded-full" />
    <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white rounded-full" />
    <div className="absolute bottom-4 right-4 w-1 h-1 bg-white rounded-full" />
  </div>
));
DecorativePattern.displayName = "DecorativePattern";

interface SelectionCardProps {
  value: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
  gradient: string;
  accent: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const SelectionCard: React.FC<SelectionCardProps> = React.memo(
  ({
    value,
    isSelected,
    onSelect,
    gradient,
    accent,
    children,
    className = "",
    ariaLabel,
  }) => {
    const handleClick = useCallback(() => {
      onSelect(value);
    }, [value, onSelect]);

    const cardClassName = useMemo(
      () => `
    relative h-[120px] xl:h-[140px] rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105
    bg-gradient-to-br ${gradient} ${accent}
    ${
      isSelected
        ? "ring-4 ring-lime-400 ring-opacity-60 shadow-lg shadow-lime-200"
        : "hover:shadow-xl"
    } ${className}
  `,
      [gradient, accent, isSelected, className],
    );

    return (
      <div
        onClick={handleClick}
        className={cardClassName}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-pressed={isSelected}
        aria-label={ariaLabel || `Select ${value}`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>

        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-lime-400 rounded-full flex items-center justify-center">
            <CheckIcon />
          </div>
        )}

        <DecorativePattern />
      </div>
    );
  },
);

SelectionCard.displayName = "SelectionCard";
