"use client";

import React, { useEffect, useCallback, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { HiMinus, HiPlus } from "react-icons/hi2";
import { useBooking } from "../../context/BookingContext";
import { BOOKING_CONSTANTS } from "../../context/BookingContext";
import { TranslatedText } from "../../../_components/TranslatedText";
import { useLanguage } from "../../../../context/LanguageContext";

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
  kids: 0,
  babies: 0,
};

const MAX_TOTAL_PEOPLE = 11;
const MIN_ADULTS = 1;

const COUNTER_CONFIG = [
  {
    key: "adults" as keyof CounterFormData,
    title: "Adults",
    description: "12 years or more",
    minValue: MIN_ADULTS,
  },
  {
    key: "kids" as keyof CounterFormData,
    title: "Kids",
    description: "2-11 years old",
    minValue: 0,
  },
  {
    key: "babies" as keyof CounterFormData,
    title: "Baby",
    description: "0 to 2 years old",
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
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDecrement();
          }}
          disabled={isMinimumReached}
          className="w-8 h-8 xl:w-6 xl:h-6 p-0.5 rounded-xl outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <HiMinus
            className={`w-4 h-4 xl:w-3.5 xl:h-3.5 ${!isMinimumReached ? "text-zinc-950" : "text-neutral-300"}`}
          />
        </button>

        {/* Count Display */}
        <div className="text-center justify-start text-zinc-950 text-lg font-medium font-['Poppins'] leading-loose min-w-[2ch] xl:min-w-[1ch]">
          {count}
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onIncrement();
          }}
          disabled={!canIncrement}
          className="w-8 h-8 xl:w-6 xl:h-6 p-0.5 rounded-xl outline-1 outline-offset-[-1px] outline-neutral-200 flex justify-center items-center gap-2.5 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <HiPlus
            className={`w-4 h-4 xl:w-3.5 xl:h-3.5 ${canIncrement ? "text-zinc-950" : "text-neutral-300"}`}
          />
        </button>
      </div>
    </div>
  );
};

// Main Component
export default function HowManyTotal() {
  const { formData, updateFormData, nextStep } = useBooking();
  const { language } = useLanguage();
  const t = (es: string, en: string) => (language === "en" ? en : es);

  // Calculate default values from existing data or defaults
  const getDefaultValues = useCallback((): CounterFormData => {
    if (
      formData.travelers?.adults?.length ||
      formData.travelers?.kids?.length ||
      formData.travelers?.babies?.length
    ) {
      return {
        adults: formData.travelers?.adults?.length || 1,
        kids: formData.travelers?.kids?.length || 0,
        babies: formData.travelers?.babies?.length || 0,
      };
    }
    return DEFAULT_VALUES;
  }, [formData.travelers]);

  const { control, watch, setValue, handleSubmit } = useForm<CounterFormData>({
    defaultValues: getDefaultValues(),
    mode: "onChange",
  });

  useEffect(() => {
    const initialValues = getDefaultValues();
  }, [formData.fromHero, formData.travelers, getDefaultValues]); // Only run once on mount

  const watchedValues = watch();

  // One-time sync with hero context to avoid overwriting user interactions
  const hasSyncedFromHeroRef = useRef(false);
  useEffect(() => {
    if (formData.fromHero && !hasSyncedFromHeroRef.current) {
      const travelers = formData.travelers;
      // Ensure at least 1 adult even if Hero data says 0
      setValue("adults", Math.max(travelers?.adults?.length || 0, MIN_ADULTS));
      setValue("kids", travelers?.kids?.length || 0);
      setValue("babies", travelers?.babies?.length || 0);
      hasSyncedFromHeroRef.current = true;
    }
  }, [formData.fromHero, formData.travelers, setValue]);

  // Calculate total count from watched values
  const totalCount =
    (watchedValues.adults ?? 0) +
    (watchedValues.kids ?? 0) +
    (watchedValues.babies ?? 0);
  const canAddMore = totalCount < MAX_TOTAL_PEOPLE;

  const updateCount = (
    field: keyof CounterFormData,
    operation: "increment" | "decrement",
    minValue: number,
  ) => {
    const currentValue = watchedValues[field];
    if (operation === "increment") {
      if (totalCount >= MAX_TOTAL_PEOPLE) {
        return;
      }
      const newValue = currentValue + 1;
      setValue(field, newValue, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      if (currentValue <= minValue) {
        return;
      }
      const newValue = Math.max(minValue, currentValue - 1);
      setValue(field, newValue, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  const onSubmit = (data: CounterFormData) => {
    const totalPeople = data.adults + data.kids + data.babies;

    if (totalPeople === 0) {
      return; // Prevent proceeding with 0 people
    }

    // Initialize/Resize traveler arrays to match counts
    // We try to preserve existing data from context if available, otherwise create new
    const prevTravelers = formData.travelers || {
      adults: [],
      kids: [],
      babies: [],
    };

    // Helper to sync array size
    const syncArray = (
      targetSize: number,
      currentArray: any[],
      type: "adult" | "kid" | "baby",
    ) => {
      if (currentArray.length === targetSize) return currentArray;
      if (currentArray.length > targetSize)
        return currentArray.slice(0, targetSize);

      // Add new empty travelers
      const newItems = Array.from(
        { length: targetSize - currentArray.length },
        (_, i) => ({
          id: `${type}-${currentArray.length + i + 1}-${Date.now()}`,
          type: type,
          name: "",
          dateOfBirth: "",
          documentType: "ID",
          documentNumber: "",
          isPrimary: type === "adult" && currentArray.length + i === 0, // First adult is primary
        }),
      );
      return [...currentArray, ...newItems];
    };

    const adults = syncArray(data.adults, prevTravelers.adults, "adult");
    const kids = syncArray(data.kids, prevTravelers.kids, "kid");
    const babies = syncArray(data.babies, prevTravelers.babies, "baby");

    // Update the booking context with detailed people count AND initialized arrays
    updateFormData({
      travelers: {
        adults,
        kids,
        babies,
      },
    });

    // Move to next step
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full xl:w-[894px] xl:h-[638px] px-4 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-6 min-h-[500px] xl:min-h-0">
        <div className="self-stretch flex-1 flex flex-col justify-start items-start gap-3">
          {/* Header */}
          <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
            <h2 className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
              <TranslatedText
                text="¿Cuántos fanáticos/as viajarán?"
                english="How many are you?"
              />
            </h2>
          </div>

          {/* Content */}
          <div className="self-stretch flex-1 flex flex-col justify-between items-start gap-8 xl:gap-0">
            {/* Counter Section */}
            <div className="w-full mx-auto p-3 bg-white rounded-xl flex flex-col justify-start items-start whitespace-nowrap">
              {COUNTER_CONFIG.map(({ key, title, description, minValue }) => (
                <Controller
                  key={key}
                  name={key}
                  control={control}
                  render={({ field }) => (
                    <CounterItem
                      title={
                        key === "adults"
                          ? t("Adultos", "Adults")
                          : key === "kids"
                            ? t("Niños o niñas", "Kids")
                            : t("Bebés", "Baby")
                      }
                      description={
                        key === "adults"
                          ? t("12 años o más", "12 years or more")
                          : key === "kids"
                            ? t("De 2 a 11 años", "2-11 years old")
                            : t("De 0 a 2 años", "0 to 2 years old")
                      }
                      count={field.value}
                      onIncrement={() =>
                        updateCount(key, "increment", minValue)
                      }
                      onDecrement={() =>
                        updateCount(key, "decrement", minValue)
                      }
                      canIncrement={canAddMore}
                      isMinimumReached={field.value <= minValue}
                    />
                  )}
                />
              ))}
            </div>

            {/* Next Button */}
            {totalCount === 1 && (
              <div className="w-full xl:w-[600px] mx-auto p-3 bg-lime-50 rounded-xl outline-1 outline-offset-[-1px] outline-lime-200 text-zinc-900">
                <div className="text-sm xl:text-base font-medium font-['Poppins']">
                  <TranslatedText
                    text={`Suplemento de viajero individual: se aplicarán ${BOOKING_CONSTANTS.SINGLE_TRAVELER_SUPPLEMENT}€.`}
                    english={`Single traveler supplement: ${BOOKING_CONSTANTS.SINGLE_TRAVELER_SUPPLEMENT}€ will be applied.`}
                  />
                </div>
                <div className="text-xs xl:text-sm text-zinc-600 font-['Poppins'] mt-1">
                  <TranslatedText
                    text="Esta tarifa solo se aplica cuando se viaja solo y aparecerá en su resumen final."
                    english="This fee applies only when traveling alone and will appear in your final summary."
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              className="w-44 h-11 px-3.5 py-1.5 bg-[#6AAD3C] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors"
            >
              <span className="text-center justify-start text-white text-base font-normal font-['Inter']">
                <TranslatedText text="Siguiente" english="Next" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
