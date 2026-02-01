"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useBooking } from "../../context/BookingContext";
import type { ExtraService as BookingExtraService } from "../../context/BookingContext";
import { extrasData } from "../../../../lib/appdata";
import { TranslatedText } from "../../../_components/TranslatedText";

type ExtraService = BookingExtraService;

interface FormData {
  extras: ExtraService[];
}

// Helper function to get English translations for extras
const getExtraEnglishText = (
  id: string,
  type: "name" | "description",
): string => {
  const translations: Record<string, { name: string; description: string }> = {
    breakfast: {
      name: "Breakfast",
      description:
        "Start your day full of energy with breakfast for only 10 euros per person",
    },
    "travel-insurance": {
      name: "Travel Insurance",
      description:
        "Cover yourself for delays or strikes as well as medical insurance in the country you are going to.",
    },
    "underseat-bag": {
      name: "Underseat bag",
      description:
        "Check the measurements accepted by the airline you are flying with.",
    },
    "extra-luggage": {
      name: "Extra luggage",
      description: "Extra luggage (8kg-10kg)",
    },
    "seats-together": {
      name: "Seats together",
      description:
        "Do you want to sit together on the flight? Otherwise the seats will be chosen randomly.",
    },
  };
  return translations[id]?.[type] || "";
};

// Initial data factory
const createInitialExtras = (): ExtraService[] => {
  return extrasData.initialExtras.map((extra) => ({
    ...extra,
    // Use the centralized data as is
    isSelected: extra.isSelected,
    quantity: extra.quantity,
    isGroupOption: extra.isGroupOption || false,
  }));
};

export default function Extras() {
  const { formData, updateExtras, nextStep, getTotalPeople } = useBooking();

  // Get total number of travelers (needed for initial extras)
  const totalTravelers = getTotalPeople();

  // Get initial extras from BookingContext or create defaults
  const getInitialExtras = (): ExtraService[] => {
    if (formData.extras && formData.extras.length > 0) {
      console.log(
        "Loading existing extras from BookingContext:",
        formData.extras,
      );
      // Update Underseat bag quantity based on current total travelers
      return formData.extras.map((extra) => {
        if (extra.id === "underseat-bag" && extra.isIncluded) {
          return { ...extra, quantity: totalTravelers, isSelected: true };
        }
        if (extra.isGroupOption) {
          return { ...extra, quantity: totalTravelers };
        }
        return extra;
      });
    } else {
      console.log("Creating default extras");
      const initialExtras = createInitialExtras();
      // Update Underseat bag quantity based on total travelers (1 bag per person)
      return initialExtras.map((extra) => {
        if (extra.id === "underseat-bag" && extra.isIncluded) {
          return { ...extra, quantity: totalTravelers, isSelected: true };
        }
        if (extra.isGroupOption) {
          return { ...extra, quantity: totalTravelers };
        }
        return extra;
      });
    }
  };

  const { control, setValue, handleSubmit, getValues } = useForm<FormData>({
    defaultValues: {
      extras: getInitialExtras(),
    },
  });

  const watchedExtras = useWatch({ control, name: "extras" });
  const extras = useMemo(() => watchedExtras ?? [], [watchedExtras]);

  // Update quantities for group options and included extras (like Underseat bag) when total travelers changes
  useEffect(() => {
    const currentExtras = getValues("extras");
    const updatedExtras = currentExtras.map((extra) => {
      if (extra.isGroupOption) {
        return { ...extra, quantity: totalTravelers };
      }
      // Update Underseat bag (included extra) quantity based on total travelers (1 bag per person)
      if (extra.id === "underseat-bag" && extra.isIncluded) {
        return { ...extra, quantity: totalTravelers, isSelected: true };
      }
      return extra;
    });
    setValue("extras", updatedExtras, { shouldDirty: true });
  }, [totalTravelers, setValue, getValues]);

  // Memoized calculations
  const totalExtrasCost = useMemo(() => {
    return extras
      .filter((extra) => extra.isSelected && !extra.isIncluded)
      .reduce((total, extra) => {
        return total + extra.price * extra.quantity;
      }, 0);
  }, [extras]);

  // Event handlers
  const handleToggleExtra = useCallback(
    (id: string) => {
      const updatedExtras = extras.map((extra) => {
        if (extra.id === id && !extra.isIncluded) {
          const newIsSelected = !extra.isSelected;

          if (extra.isGroupOption) {
            return {
              ...extra,
              isSelected: newIsSelected,
              quantity: totalTravelers,
            };
          }

          if (extra.id === "extra-luggage") {
            const maxQuantity =
              extra.maxQuantity || extrasData.constants.defaultMaxQuantity;
            const ensuredQuantity = Math.min(
              maxQuantity,
              Math.max(
                extrasData.constants.minQuantity,
                extra.quantity || extrasData.constants.minQuantity,
              ),
            );
            return {
              ...extra,
              isSelected: newIsSelected,
              quantity: newIsSelected ? ensuredQuantity : 0,
            };
          }

          return { ...extra, isSelected: newIsSelected };
        }

        return extra;
      });
      setValue("extras", updatedExtras, { shouldDirty: true });
    },
    [extras, setValue, totalTravelers],
  );

  const handleQuantityChange = useCallback(
    (id: string, change: number) => {
      const updatedExtras = extras.map((extra) => {
        if (extra.id === id && !extra.isIncluded) {
          if (extra.isGroupOption) {
            return extra;
          }

          const maxQuantity =
            extra.maxQuantity || extrasData.constants.defaultMaxQuantity;
          const minQuantity =
            extra.id === "extra-luggage" && extra.isSelected
              ? extrasData.constants.minQuantity
              : 0;

          const proposedQuantity = extra.quantity + change;
          const newQuantity = Math.max(
            minQuantity,
            Math.min(maxQuantity, proposedQuantity),
          );

          return { ...extra, quantity: newQuantity };
        }
        return extra;
      });
      setValue("extras", updatedExtras, { shouldDirty: true });
    },
    [extras, setValue],
  );

  const onSubmit = useCallback(
    (data: FormData) => {
      const selectedExtras = data.extras.filter((extra) => extra.isSelected);
      console.log("Selected extras:", selectedExtras);

      // Calculate total cost
      const totalCost = selectedExtras.reduce((total, extra) => {
        if (!extra.isIncluded) {
          return total + extra.price * extra.quantity;
        }
        return total;
      }, 0);

      console.log("Total extra cost:", totalCost);

      // Update booking context with selected extras
      updateExtras(data.extras);

      // Navigate to next step
      nextStep();
    },
    [updateExtras, nextStep],
  );

  const getExtraDisplayQuantity = useCallback((extra: ExtraService) => {
    if (extra.id === "extra-luggage") {
      if (!extra.isSelected) {
        return extra.quantity;
      }
      return Math.max(extrasData.constants.minQuantity, extra.quantity);
    }
    return extra.quantity;
  }, []);

  const renderQuantityControls = (extra: ExtraService) => {
    const displayQuantity = getExtraDisplayQuantity(extra);

    // For included extras like Underseat bag, show quantity based on total travelers (1 bag per person)
    if (extra.isIncluded && extra.id === "underseat-bag") {
      return (
        <div className="flex items-center gap-2">
          <div className="justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none min-w-[20px] text-center">
            x{extra.quantity}
          </div>
        </div>
      );
    }

    // For group options, show quantity but don't allow individual changes
    if (extra.isGroupOption) {
      return (
        <div className="flex items-center gap-2">
          <div className="justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none min-w-[20px] text-center">
            x{extra.quantity}
          </div>
        </div>
      );
    }

    // For individual options (like extra luggage), allow quantity changes
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleQuantityChange(extra.id, -1)}
          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors opacity-60 hover:opacity-80 cursor-pointer disabled:cursor-not-allowed"
          disabled={
            extra.id === "extra-luggage" && extra.isSelected
              ? displayQuantity <= extrasData.constants.minQuantity
              : displayQuantity <= 0
          }
        >
          -
        </button>
        <div className="justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none min-w-[20px] text-center">
          x{displayQuantity}
        </div>
        <button
          type="button"
          onClick={() => handleQuantityChange(extra.id, 1)}
          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors opacity-60 hover:opacity-80 cursor-pointer disabled:cursor-not-allowed"
          disabled={
            displayQuantity >=
            (extra.maxQuantity || extrasData.constants.defaultMaxQuantity)
          }
        >
          +
        </button>
      </div>
    );
  };

  const renderToggleButton = (extra: ExtraService) => (
    <button
      type="button"
      onClick={() => handleToggleExtra(extra.id)}
      className={`w-28 sm:w-32 h-10 px-4 sm:px-6 py-2.5 rounded outline-1 outline-offset-[-1px] flex justify-center items-center gap-2.5 transition-all cursor-pointer ${
        extra.isSelected
          ? "bg-red-500 outline-red-500 hover:bg-red-600"
          : "bg-[#6AAD3C] outline-[#6AAD3C] hover:bg-lime-600"
      }`}
    >
      <div className="text-center justify-start text-white text-sm sm:text-lg font-normal font-['Inter'] leading-5 sm:leading-7">
        {extra.isSelected ? (
          <TranslatedText
            text={extrasData.text.remove}
            english={extrasData.text.removeEn}
          />
        ) : (
          <TranslatedText
            text={extrasData.text.add}
            english={extrasData.text.addEn}
          />
        )}
      </div>
    </button>
  );

  const renderExtraService = (extra: ExtraService) => (
    <div
      key={extra.id}
      className={`self-stretch p-4 bg-white rounded-lg transition-all ${
        extra.isSelected ? "ring-2 ring-[#6AAD3C] shadow-lg" : "hover:shadow-md"
      }`}
    >
      {/* Mobile Layout */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* Header with icon, name and price */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 p-2 bg-[#F1F9EC] rounded-[5.14px] flex justify-center items-center shrink-0">
              <Image
                src={extra.icon}
                alt={`${extra.name} icon`}
                width={32}
                height={32}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="text-neutral-800 text-base font-medium font-['Poppins'] leading-tight">
                <TranslatedText
                  text={extra.name}
                  english={getExtraEnglishText(extra.id, "name")}
                />
              </div>
              <div className="text-[#6AAD3C] text-base font-semibold font-['Poppins']">
                {extra.isIncluded ? (
                  <TranslatedText
                    text={extrasData.text.included}
                    english={extrasData.text.includedEn}
                  />
                ) : (
                  `+${extra.price}€`
                )}
              </div>
              {!extra.isIncluded && (
                <div className="text-neutral-600 text-sm font-normal font-['Poppins']">
                  <TranslatedText
                    text={extrasData.text.perPerson}
                    english={extrasData.text.perPersonEn}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="text-neutral-600 text-sm font-normal font-['Poppins'] leading-5">
          <TranslatedText
            text={extra.description}
            english={getExtraEnglishText(extra.id, "description")}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          {!extra.isIncluded ? (
            <>
              <div className="flex items-center gap-3">
                {renderQuantityControls(extra)}
              </div>
              {renderToggleButton(extra)}
            </>
          ) : (
            <div className="flex justify-between items-center w-full">
              <div className="text-neutral-800 text-base font-normal font-['Poppins']">
                x{extra.quantity}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout - unchanged */}
      <div className="hidden md:flex justify-between items-start">
        <div className="flex justify-start items-start gap-3 flex-1">
          <div className="w-16 h-16 p-3 bg-[#F1F9EC] rounded-[5.14px] inline-flex flex-col justify-center items-center gap-3 overflow-hidden">
            <Image
              src={extra.icon}
              alt={`${extra.name} icon`}
              width={40}
              height={40}
            />
          </div>
          <div className="inline-flex flex-col justify-start items-start gap-1 flex-1">
            <div className="self-stretch justify-start text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">
              <TranslatedText
                text={extra.name}
                english={getExtraEnglishText(extra.id, "name")}
              />
            </div>
            <div className="self-stretch justify-start text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
              <TranslatedText
                text={extra.description}
                english={getExtraEnglishText(extra.id, "description")}
              />
            </div>
          </div>
        </div>
        <div className="inline-flex flex-col justify-center items-end gap-4">
          <div className="flex flex-col justify-start items-end gap-1">
            <div className="self-stretch text-right justify-start text-[#6AAD3C] text-lg font-semibold font-['Poppins'] leading-loose">
              {extra.isIncluded ? (
                <TranslatedText
                  text={extrasData.text.included}
                  english={extrasData.text.includedEn}
                />
              ) : (
                `+${extra.price}€`
              )}
            </div>
            {!extra.isIncluded && (
              <div className="self-stretch text-right justify-start text-neutral-600 text-base font-normal font-['Poppins'] leading-7">
                <TranslatedText
                  text={extrasData.text.perPerson}
                  english={extrasData.text.perPersonEn}
                />
              </div>
            )}
          </div>
          <div className="inline-flex justify-start items-center gap-4">
            {!extra.isIncluded ? (
              <>
                {renderQuantityControls(extra)}
                {renderToggleButton(extra)}
              </>
            ) : (
              <div className="justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                x{extra.quantity}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full xl:w-[894px] px-3 sm:px-4 xl:px-6 py-4 sm:py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-4 sm:gap-6 min-h-[400px] sm:min-h-[500px] xl:min-h-0">
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <div className="justify-center text-neutral-800 text-xl sm:text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-7 sm:leading-8 xl:leading-10">
              <TranslatedText
                text={extrasData.text.title}
                english={extrasData.text.titleEn}
              />
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <Controller
                name="extras"
                control={control}
                render={({ field }) => {
                  const value =
                    (field.value as ExtraService[] | undefined) ?? [];
                  return <>{value.map(renderExtraService)}</>;
                }}
              />
            </div>

            {/* Total Cost Display */}
            {totalExtrasCost > 0 && (
              <div className="self-stretch p-3 sm:p-4 bg-lime-50 rounded-lg border border-lime-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0">
                  <div className="text-neutral-800 text-base sm:text-lg font-medium font-['Poppins']">
                    <TranslatedText
                      text={extrasData.text.totalCost}
                      english={extrasData.text.totalCostEn}
                    />
                  </div>
                  <div className="text-lime-600 text-lg sm:text-xl font-semibold font-['Poppins']">
                    +{extrasData.constants.currencySymbol}
                    {totalExtrasCost}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full sm:w-44 h-11 px-3.5 py-1.5 bg-[#6AAD3C] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
            >
              <div className="text-center justify-start text-[#ffffff] text-base font-normal font-['Inter']">
                <TranslatedText
                  text={extrasData.text.confirm}
                  english={extrasData.text.confirmEn}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
