"use client";

import React, { useCallback, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useBooking } from "../../context/BookingContext";
import { sportsPreferenceData } from "../../../../lib/appdata";
import { TranslatedText } from "../../../_components/TranslatedText";
import { SelectionCard } from "../shared/cards/SelectionCard";

// Types
interface FormData {
  selectedSport: string;
}

interface SportOption {
  value: string;
  label: string;
  gradient: string;
  accent: string;
}

// Sport card gradients
const SPORT_GRADIENTS: Record<string, { gradient: string; accent: string }> = {
  football: {
    gradient: "from-green-500",
    accent: "to-green-600",
  },
  basketball: {
    gradient: "from-orange-500",
    accent: "to-orange-600",
  },
  both: {
    gradient: "from-purple-500",
    accent: "to-purple-600",
  },
};

// Components
interface SportCardProps {
  sportOption: SportOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

const SportCard: React.FC<SportCardProps> = React.memo(
  ({ sportOption, isSelected, onSelect }) => {
    const sportLabel = useMemo(() => {
      if (sportOption.value === "football") {
        return { es: "Fútbol", en: "Football" };
      } else if (sportOption.value === "basketball") {
        return { es: "Basket", en: "Basketball" };
      } else if (sportOption.value === "both") {
        return { es: "Ambos", en: "Both" };
      }
      return { es: sportOption.label, en: sportOption.label };
    }, [sportOption.value, sportOption.label]);

    return (
      <SelectionCard
        value={sportOption.value}
        isSelected={isSelected}
        onSelect={onSelect}
        gradient={sportOption.gradient}
        accent={sportOption.accent}
        ariaLabel={`Select ${sportOption.label}`}
      >
        <h3 className="text-white text-base xl:text-lg font-semibold font-['Poppins'] text-center drop-shadow-lg">
          <TranslatedText
            text={sportLabel.es}
            english={sportLabel.en}
            as="span"
          />
        </h3>
      </SelectionCard>
    );
  },
);

SportCard.displayName = "SportCard";

export default function SportsYouPreffer() {
  const { formData, updateFormData, nextStep } = useBooking();

  // Debug logging
  console.log(
    "🎯 SportsYouPreffer - formData.selectedSport:",
    formData.selectedSport,
    "fromHero:",
    formData.fromHero,
  );

  // Initialize form with react-hook-form
  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      selectedSport: formData.selectedSport || "",
    },
    mode: "onChange",
  });

  const selectedSport = watch("selectedSport");

  // Sync with context when context data changes (especially for hero data)
  useEffect(() => {
    if (formData.selectedSport && formData.selectedSport !== selectedSport) {
      setValue("selectedSport", formData.selectedSport);
      console.log(
        "🎯 SportsYouPreffer - synced with context:",
        formData.selectedSport,
      );
    }
  }, [formData.selectedSport, selectedSport, setValue]);

  // Get sport options with gradients
  const sportOptions = useMemo(() => {
    return sportsPreferenceData.getAllSports().map((sport) => ({
      value: sport.value,
      label: sport.label,
      ...(SPORT_GRADIENTS[sport.value] || {
        gradient: "from-gray-500",
        accent: "to-gray-600",
      }),
    }));
  }, []);

  // Event handlers
  const handleSportSelect = useCallback(
    (value: string) => {
      setValue("selectedSport", value);
      // Save to context immediately on change
      updateFormData({ selectedSport: value });
    },
    [setValue, updateFormData],
  );

  // Form submission handler
  const onSubmit = useCallback(
    (data: FormData) => {
      console.log("Selected sport:", data.selectedSport);
      updateFormData({ selectedSport: data.selectedSport });
      nextStep();
    },
    [updateFormData, nextStep],
  );

  const buttonClassName = useMemo(
    () => `
    w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] flex justify-center items-center transition-all
    ${
      selectedSport
        ? "bg-[#76C043] hover:bg-lime-600 cursor-pointer"
        : "bg-gray-300 cursor-not-allowed"
    }
  `,
    [selectedSport],
  );

  const buttonTextClassName = useMemo(
    () =>
      `text-base font-['Inter'] ${selectedSport ? "text-white" : "text-gray-500"}`,
    [selectedSport],
  );

  return (
    <div className="w-full xl:max-w-[894px] xl:h-[638px] p-4 xl:p-6 bg-[#F1F9EC] rounded-xl border border-[#76C043]/20 mb-10 min-h-[500px] xl:min-h-0">
      {/* Header Section */}
      <div className="mb-6 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-semibold text-neutral-800 font-['Poppins'] leading-8 xl:leading-10 mb-3">
          <TranslatedText
            text="¿Qué deporte prefieres?"
            english="What sport do you prefer?"
          />
        </h1>
        <p className="text-sm xl:text-base text-neutral-600 font-['Poppins'] leading-6 xl:leading-7">
          <TranslatedText
            text="Siempre intentamos que puedas maximizar tu tiempo en el destino."
            english={
              sportsPreferenceData.getSportByValue(selectedSport)
                ?.description ||
              "We always try to maximize the time at the destination"
            }
          />
        </p>
      </div>

      {/* Content Section */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col justify-between xl:h-[calc(100%-120px)] h-auto gap-8 xl:gap-0"
      >
        {/* Sport Cards Grid */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:gap-4 mb-6 xl:mb-8"
          role="group"
          aria-label="Sport selection"
        >
          <Controller
            name="selectedSport"
            control={control}
            rules={{ required: "Please select a sport" }}
            render={({ field }) => (
              <>
                {sportOptions.map((sport) => (
                  <SportCard
                    key={sport.value}
                    sportOption={sport}
                    isSelected={field.value === sport.value}
                    onSelect={(value) => {
                      field.onChange(value);
                      handleSportSelect(value);
                    }}
                  />
                ))}
              </>
            )}
          />
        </div>

        {/* Next Button */}
        <button
          type="submit"
          disabled={!selectedSport}
          className={buttonClassName}
          aria-label="Proceed to next step"
        >
          <span className={buttonTextClassName}>
            <TranslatedText text="Siguiente" english="Next" />
          </span>
        </button>
      </form>
    </div>
  );
}
