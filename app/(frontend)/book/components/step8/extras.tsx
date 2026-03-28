"use client";

import React, { useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useBooking } from "../../context/BookingContext";
import type { ExtraService as BookingExtraService } from "../../context/BookingContext";
import { BookingNavigation } from "../shared/navigation/BookingNavigation";
import { extrasData } from "../../../../lib/appdata";

type ExtraService = BookingExtraService;

interface FormData {
  extras: ExtraService[];
}

// Initial data factory
const createInitialExtras = (): ExtraService[] => {
  return extrasData.initialExtras.map((extra: any) => ({
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
      return formData.extras.map((extra) => {
        if (extra.id === "underseat-bag" && extra.isIncluded) {
          return { ...extra, quantity: totalTravelers, isSelected: true };
        }
        if (extra.isGroupOption) {
          return { ...extra, quantity: totalTravelers };
        }

        // Clamp quantity for existing individual extras
        if (!extra.isIncluded && extra.isSelected) {
          const maxQuantity =
            extra.id === "extra-luggage"
              ? totalTravelers
              : extra.maxQuantity || 10;
          if (extra.quantity > maxQuantity) {
            return { ...extra, quantity: maxQuantity };
          }
        }
        
        return extra;
      });
    } else {
      const initialExtras = createInitialExtras();
      return initialExtras.map((extra) => {
        if (extra.id === "underseat-bag" && extra.isIncluded) {
          return { ...extra, quantity: totalTravelers, isSelected: true };
        }
        if (extra.isGroupOption) {
          return { ...extra, quantity: totalTravelers };
        }
        if (extra.id === "seats-together" && totalTravelers === 1) {
          return { ...extra, quantity: 1, isSelected: false }; // Force deselect if 1 traveler
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
      // Hide seats together option if only 1 traveler
      if (extra.id === "seats-together" && totalTravelers === 1) {
        return { ...extra, quantity: 1, isSelected: false };
      }

      // Clamp quantity for individual extras when total travelers changes
      if (!extra.isGroupOption && !extra.isIncluded && extra.isSelected) {
        const maxQuantity =
          extra.id === "extra-luggage"
            ? totalTravelers
            : extra.maxQuantity || 10;
        if (extra.quantity > maxQuantity) {
          return { ...extra, quantity: maxQuantity };
        }
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
            const maxQuantity = totalTravelers;
            const ensuredQuantity = Math.min(
              maxQuantity,
              Math.max(
                1,
                extra.quantity || 1,
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
            extra.id === "extra-luggage"
              ? totalTravelers
              : extra.maxQuantity || 10;
          const minQuantity =
            extra.id === "extra-luggage" && extra.isSelected
              ? 1
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
    [extras, setValue, totalTravelers],
  );

  const onSubmit = useCallback(
    (data: FormData) => {
      updateExtras(data.extras);
      nextStep();
    },
    [updateExtras, nextStep],
  );

  const renderQuantityControls = (extra: ExtraService) => {
    const displayQuantity = extra.id === "extra-luggage" && extra.isSelected ? Math.max(1, extra.quantity) : extra.quantity;

    if (extra.isIncluded && extra.id === "underseat-bag") {
      return (
        <div className="flex items-center gap-2">
          <div className="text-neutral-800 text-base font-normal font-['Poppins'] leading-none min-w-[20px] text-center">
            x{extra.quantity}
          </div>
        </div>
      );
    }

    if (extra.isGroupOption) {
      return (
        <div className="flex items-center gap-2">
          <div className="text-neutral-800 text-base font-normal font-['Poppins'] leading-none min-w-[20px] text-center">
            x{extra.quantity}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleQuantityChange(extra.id, -1)}
          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors opacity-60 hover:opacity-80 cursor-pointer disabled:cursor-not-allowed"
          disabled={extra.id === "extra-luggage" && extra.isSelected ? displayQuantity <= 1 : displayQuantity <= 0}
        >
          -
        </button>
        <div className="text-neutral-800 text-base font-normal font-['Poppins'] leading-none min-w-[20px] text-center">
          x{displayQuantity}
        </div>
        <button
          type="button"
          onClick={() => handleQuantityChange(extra.id, 1)}
          className="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors opacity-60 hover:opacity-80 cursor-pointer disabled:cursor-not-allowed"
          disabled={displayQuantity >= (extra.id === "extra-luggage" ? totalTravelers : extra.maxQuantity || 10)}
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
        {extra.isSelected ? extrasData.text.remove : extrasData.text.add}
      </div>
    </button>
  );

  const renderExtraService = (extra: ExtraService) => (
    <div
      key={extra.id}
      className={`self-stretch py-3 px-4 bg-white rounded-lg transition-all ${
        extra.isSelected ? "ring-2 ring-[#6AAD3C] shadow-lg" : "hover:shadow-md"
      }`}
    >
      <div className="flex flex-col gap-4 md:hidden">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 p-2 bg-[#F1F9EC] rounded-[5.14px] flex justify-center items-center shrink-0">
              <Image src={extra.icon} alt={`${extra.name} icon`} width={32} height={32} />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="text-neutral-800 text-base font-medium font-['Poppins'] leading-tight">
                {extra.name}
              </div>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <div className="text-[#6AAD3C] text-base font-semibold font-['Poppins']">
                  {extra.isIncluded ? extrasData.text.included : `+${extra.price}€`}
                </div>
                {!extra.isIncluded && <div className="text-neutral-600 text-sm font-normal font-['Poppins']">{extrasData.text.perPerson}</div>}
              </div>
            </div>
          </div>
        </div>
        <div className="text-neutral-600 text-sm font-normal font-['Poppins'] leading-5">{extra.description}</div>
        <div className="flex justify-between items-center">
          {!extra.isIncluded ? (
            <>
              <div className="flex items-center gap-3">{renderQuantityControls(extra)}</div>
              {renderToggleButton(extra)}
            </>
          ) : (
            <div className="flex justify-between items-center w-full">
              <div className="text-neutral-800 text-base font-normal font-['Poppins']">x{extra.quantity}</div>
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:flex justify-between items-start">
        <div className="flex justify-start items-start gap-3 flex-1">
          <div className="w-16 h-16 p-3 bg-[#F1F9EC] rounded-[5.14px] inline-flex flex-col justify-center items-center gap-3 overflow-hidden">
            <Image src={extra.icon} alt={`${extra.name} icon`} width={40} height={40} />
          </div>
          <div className="inline-flex flex-col justify-start items-start gap-1 flex-1">
            <div className="self-stretch justify-start text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">{extra.name}</div>
            <div className="self-stretch justify-start text-neutral-600 text-base font-normal font-['Poppins'] leading-7">{extra.description}</div>
          </div>
        </div>
        <div className="inline-flex flex-col justify-center items-end gap-3">
          <div className="flex flex-row items-baseline justify-end gap-2">
            <div className="text-[#6AAD3C] text-lg font-semibold font-['Poppins'] leading-loose">{extra.isIncluded ? extrasData.text.included : `+${extra.price}€`}</div>
            {!extra.isIncluded && <div className="text-neutral-600 text-base font-normal font-['Poppins'] leading-7">{extrasData.text.perPerson}</div>}
          </div>
          <div className="inline-flex justify-start items-center gap-4">
            {!extra.isIncluded ? (
              <>
                {renderQuantityControls(extra)}
                {renderToggleButton(extra)}
              </>
            ) : (
              <div className="justify-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">x{extra.quantity}</div>
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
            <div className="justify-center text-neutral-800 text-xl sm:text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-7 sm:leading-8 xl:leading-10">{extrasData.text.title}</div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="self-stretch flex flex-col justify-start items-start gap-3">
              <Controller
                name="extras"
                control={control}
                render={({ field }) => {
                  const value = (field.value as ExtraService[] | undefined) ?? [];
                  const displayExtras = value.filter((extra) => !(extra.id === "seats-together" && totalTravelers === 1));
                  return <>{displayExtras.map(renderExtraService)}</>;
                }}
              />
            </div>
            {totalExtrasCost > 0 && (
              <div className="self-stretch p-3 sm:p-4 bg-lime-50 rounded-lg border border-lime-200">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0">
                  <div className="text-neutral-800 text-base sm:text-lg font-medium font-['Poppins']">{extrasData.text.totalCost}</div>
                  <div className="text-lime-600 text-lg sm:text-xl font-semibold font-['Poppins']">+{extrasData.constants?.currencySymbol || "€"}{totalExtrasCost}</div>
                </div>
              </div>
            )}
            <BookingNavigation onNext={handleSubmit(onSubmit)} nextText={extrasData.text.confirm} className="w-full" />
          </div>
        </div>
      </div>
    </form>
  );
}
