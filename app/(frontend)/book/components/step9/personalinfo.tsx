"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";

import { useBooking } from "../../context/BookingContext";
import { BOOKING_CONSTANTS } from "../../context/BookingContext";
import { BookingNavigation } from "../shared/navigation/BookingNavigation";
import {
  personalInfoData,
  pricingData,
  flightScheduleData,
  leaguePricingData,
  removeLeagueData,
} from "../../../../lib/appdata";

import {
  formatDateForAPI,
  formatApiDateForComparison,
} from "../../../../../lib/dateUtils";

import { TravelerFormFields } from "./components/TravelerFormFields";
import { ReservationSummary } from "./components/ReservationSummary";

// Utility functions for dynamic data calculation
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const nextDay = minutes >= 1440 ? "(+1)" : "";
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}${nextDay}`;
};

const calculateDuration = (
  departureDate: string,
  returnDate: string,
): number => {
  if (!departureDate || !returnDate) return 0;
  const start = new Date(departureDate);
  const end = new Date(returnDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

type DateRestrictions = {
  enabledDates: string[];
  blockedDates: string[];
  customPrices: Record<
    string,
    {
      football?: { standard?: number; premium?: number };
      basketball?: { standard?: number; premium?: number };
    }
  >;
};

// Validation Error Keys and Messages
const ERROR_MESSAGES = {
  REQUIRED_NAME: "El nombre del viajero es obligatorio",
  REQUIRED_EMAIL: "El correo electrónico es obligatorio",
  INVALID_EMAIL: "Dirección de correo electrónico no válida",
  REQUIRED_PHONE: "El teléfono es obligatorio",
  REQUIRED_DOB: "La fecha de nacimiento es obligatoria",
  REQUIRED_DOC_TYPE: "El tipo de documento es obligatorio",
  REQUIRED_DOC_NUM: "El número de documento es obligatorio",
  MUST_BE_ADULT: "El viajero principal debe tener más de 18 años",
};

const usePerNightPricing = () => {
  // API data now comes from BookingContext.apiCache, no local date fetching needed
  // Price calculation logic will be replaced with context.calculatePriceBreakdown()

  // Temporarily keeping stub - will be replaced with context pricing
  const apiDateData: any[] = []; // FIXME: Remove - use context.apiCache

  const getDateRestrictionsForDuration = useCallback(
    (durationKey: "1" | "2" | "3" | "4"): DateRestrictions => {
      const enabledDates: string[] = [];
      const blockedDates: string[] = [];
      const customPrices: DateRestrictions["customPrices"] = {};

      apiDateData.forEach((item) => {
        if ((item.duration ?? "1") !== durationKey) {
          return;
        }
        const dateString = formatApiDateForComparison(item.date);
        if (item.status === "enabled") {
          if (!enabledDates.includes(dateString)) {
            enabledDates.push(dateString);
          }
          customPrices[dateString] = {
            football: {
              standard: item.prices?.standard ?? 0,
              premium: item.prices?.premium ?? 0,
            },
            basketball: {
              standard: item.prices?.standard ?? 0,
              premium: item.prices?.premium ?? 0,
            },
          };
        } else {
          blockedDates.push(dateString);
        }
      });

      return { enabledDates, blockedDates, customPrices };
    },
    [apiDateData],
  );

  const getDurationKey = (nights: number): "1" | "2" | "3" | "4" => {
    if (nights <= 1) return "1";
    if (nights === 2) return "2";
    if (nights === 3) return "3";
    return "4";
  };

  const sumPerNight = useCallback(
    (params: {
      startISO: string | null;
      endISO: string | null;
      selectedSport: "football" | "basketball" | "both" | "";
      selectedPackage: "standard" | "premium" | "";
    }): number => {
      const { startISO, endISO, selectedSport, selectedPackage } = params;
      if (!startISO || !endISO || !selectedSport || !selectedPackage) return 0;

      const start = new Date(startISO);
      const end = new Date(endISO);
      // nights = days - 1; iterate over nights from start to day before end
      const nights = Math.max(
        0,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const durationKey = getDurationKey(nights);
      const restrictions = getDateRestrictionsForDuration(durationKey);

      const dateKey = formatDateForAPI(start);
      const custom = restrictions.customPrices[dateKey];

      if (!custom) {
        return 0;
      }

      if (selectedSport === "both") {
        const footballPrice =
          custom.football &&
          (selectedPackage === "standard"
            ? custom.football.standard
            : custom.football.premium);
        const basketballPrice =
          custom.basketball &&
          (selectedPackage === "standard"
            ? custom.basketball.standard
            : custom.basketball.premium);

        const footballTotal =
          typeof footballPrice === "number" ? footballPrice : 0;
        const basketballTotal =
          typeof basketballPrice === "number" ? basketballPrice : 0;

        if (footballTotal === 0 && basketballTotal === 0) {
          return 0;
        }
        return footballTotal + basketballTotal;
      }

      if (selectedSport === "football") {
        const price =
          selectedPackage === "standard"
            ? custom.football?.standard
            : custom.football?.premium;
        return typeof price === "number" ? price : 0;
      }

      if (selectedSport === "basketball") {
        const price =
          selectedPackage === "standard"
            ? custom.basketball?.standard
            : custom.basketball?.premium;
        return typeof price === "number" ? price : 0;
      }

      return 0;
    },
    [getDateRestrictionsForDuration],
  );

  return { sumPerNight };
};

const calculateExtrasCost = (
  extras: Array<{
    isSelected: boolean;
    isIncluded?: boolean;
    price: number;
    quantity: number;
  }>,
): number => {
  if (!extras || !Array.isArray(extras)) return 0;

  return extras
    .filter((extra) => extra.isSelected && !extra.isIncluded)
    .reduce((total, extra) => total + extra.price * extra.quantity, 0);
};

const calculateFlightScheduleCost = (
  flightSchedule: {
    departure: { start: number; end: number };
    arrival: { start: number; end: number };
  } | null,
): number => {
  if (!flightSchedule) return 0;

  const departureCost = flightScheduleData.calculatePriceFromDefault(
    flightSchedule.departure,
    true,
  );
  const arrivalCost = flightScheduleData.calculatePriceFromDefault(
    flightSchedule.arrival,
    false,
  );

  return departureCost + arrivalCost;
};

interface TravelerInfo {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  documentType: "ID" | "Passport";
  documentNumber: string;
}

interface PersonalInfoFormData {
  primaryTraveler: TravelerInfo;
  extraTravelers: TravelerInfo[];
  paymentMethod: "credit" | "google" | "apple";
  previousTravelInfo: string;
}

const defaultTravelerInfo: TravelerInfo = {
  name: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  documentType: "ID",
  documentNumber: "",
};

const PaymentMethodCard: React.FC<{
  value: "credit" | "google" | "apple";
  selectedValue: "credit" | "google" | "apple";
  onChange: (value: "credit" | "google" | "apple") => void;
  label: string;
  children: React.ReactNode;
}> = ({ value, selectedValue, onChange, label, children }) => {
  const isSelected = selectedValue === value;

  return (
    <div
      className={`self-stretch p-3 md:p-4 rounded outline-1 outline-offset-[-1px] ${
        isSelected ? "outline-[#6AAD3C] bg-lime-50" : "outline-gray-200"
      } flex flex-col md:inline-flex md:flex-row justify-between items-start md:items-center gap-3 md:gap-0 cursor-pointer`}
      onClick={() => onChange(value)}
    >
      <div className="flex justify-start items-center gap-2.5">
        <div
          className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 ${
            isSelected ? "border-[#6AAD3C] bg-[#6AAD3C]" : "border-gray-300"
          } flex items-center justify-center`}
        >
          {isSelected && (
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" />
          )}
        </div>
        <div className="justify-center text-black text-base md:text-lg font-medium font-['Poppins'] leading-loose">
          {label}
        </div>
      </div>
      <div className="ml-7 md:ml-0">{children}</div>
    </div>
  );
};

const STORAGE_KEY = personalInfoData.storage.key;

// Helper functions for localStorage
const saveToStorage = (data: PersonalInfoFormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

const loadFromStorage = (): PersonalInfoFormData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

export default function Personalinfo() {
  const { updateStepData, nextStep, formData } = useBooking();
  const { sumPerNight } = usePerNightPricing();
  const [codeInput, setCodeInput] = useState(formData.discountCode || "");
  const [appliedCode, setAppliedCode] = useState(formData.appliedCode || null);
  const [codeStatus, setCodeStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const getError = (errorKey: string | undefined) => {
    if (!errorKey) return undefined;
    const message = ERROR_MESSAGES[
      errorKey as keyof typeof ERROR_MESSAGES
    ] as any;
    if (message) {
      if (typeof message === "object" && "es" in message) {
        return message.es; // Always return Spanish
      }
      return message as string;
    }
    return errorKey;
  };

  // Check if we have people count data from howmanytotal page
  const hasMultipleTravelers =
    formData.travelers &&
    ((formData.travelers.adults?.length || 0) > 1 ||
      (formData.travelers.kids?.length || 0) > 0 ||
      (formData.travelers.babies?.length || 0) > 0);

  // Calculate dynamic reservation data from all previous steps
  const reservationData = useMemo(() => {
    const primaryCount = formData.travelers?.adults?.length || 0;
    const kidsCount = formData.travelers?.kids?.length || 0;
    const babiesCount = formData.travelers?.babies?.length || 0;
    
    // Babies don't count as standard passengers for base price
    const totalPeople = primaryCount + kidsCount; 
    const totalWithBabies = totalPeople + babiesCount;

    const duration = calculateDuration(
      formData.departureDate || "",
      formData.returnDate || "",
    );
    const nights = Math.max(0, duration - 1);

    // Use price saved when date was selected in Step 6
    // No need to query API data again - price is already in formData
    const basePrice = (() => {
      const { selectedSport, selectedPackage, selectedDatePrice } = formData;

      if (!selectedDatePrice) return 0;

      // Get the correct price based on sport and package
      if (selectedSport === "both") {
        // Combined package
        return (
          selectedDatePrice.combined ||
          selectedDatePrice.standard +
            (selectedDatePrice.premium - selectedDatePrice.standard)
        );
      } else if (selectedPackage === "standard") {
        return selectedDatePrice.standard || 0;
      } else if (selectedPackage === "premium") {
        return selectedDatePrice.premium || 0;
      }

      return 0;
    })();

    const extrasCost = calculateExtrasCost(formData.extras || []);
    const flightScheduleCost = calculateFlightScheduleCost(
      formData.flightSchedule,
    );
    // Calculate league cost from leagues array
    const leaguesList = formData.leagues || [];
    const isEuropeanCompetition = leaguesList.some(
      (l) => l.group === "European" && l.isSelected,
    );

    // European League Surcharge: 50€ per person
    const leagueCost = isEuropeanCompetition
      ? BOOKING_CONSTANTS.EUROPEAN_LEAGUE_UPGRADE
      : 0;

    const removedLeaguesCount = leaguesList.filter(
      (l) => l.group === "National" && !l.isSelected,
    ).length;

    const effectiveRemovedLeaguesCount = removedLeaguesCount;
    const removalCostPerPerson =
      Math.max(
        0,
        effectiveRemovedLeaguesCount - BOOKING_CONSTANTS.FREE_REMOVALS,
      ) * BOOKING_CONSTANTS.LEAGUE_REMOVAL_COST;

    // Backend logic consistency: European competition does not charge for league removals
    const removalTotal = isEuropeanCompetition
      ? 0
      : removalCostPerPerson * totalPeople;

    const packageTotal = basePrice * totalPeople;

    const extrasTotal = extrasCost;

    const flightScheduleTotal = flightScheduleCost * totalPeople;

    const leagueTotal = leagueCost * totalPeople;

    // TODO: Migrate to use calculatePriceBreakdown() from context for all pricing
    // const pricing = calculatePriceBreakdown();
    const singleTravelerSupplement =
      totalPeople === 1 ? BOOKING_CONSTANTS.SINGLE_TRAVELER_SUPPLEMENT : 0;
    const babySupplementTotal = babiesCount * BOOKING_CONSTANTS.BABY_SUPPLEMENT;

    const subtotalBeforeDiscount =
      packageTotal +
      extrasTotal +
      flightScheduleTotal +
      leagueTotal +
      removalTotal +
      singleTravelerSupplement +
      babySupplementTotal;
    const discountAmount = Math.min(
      subtotalBeforeDiscount,
      appliedCode?.discountAmount || 0,
    );
    const grandTotal = Math.max(0, subtotalBeforeDiscount - discountAmount);

    return {
      departureCity:
        formData.selectedCity?.charAt(0).toUpperCase() +
          formData.selectedCity?.slice(1) || "Madrid",
      departureDate: formatDate(formData.departureDate || ""),
      returnDate: formatDate(formData.returnDate || ""),
      duration,
      nights,
      basePrice,
      extrasCost,
      flightScheduleCost,
      leagueCost,
      packageTotal,
      extrasTotal,
      flightScheduleTotal,
      leagueTotal,
      removalCostPerPerson,
      removalTotal,
      singleTravelerSupplement,
      babySupplementTotal,
      subtotalBeforeDiscount,
      discountAmount,
      grandTotal,
      totalPeople: totalPeople, // For summary display, correctly multiplying without babies
      standardPassengerCount: totalPeople,
      totalWithBabies: totalWithBabies,
      babyCount: babiesCount,
      departureTimeRange: formData.flightSchedule
        ? `${formatTime(
            formData.flightSchedule.departure.start,
          )} - ${formatTime(formData.flightSchedule.departure.end)}`
        : "",
      arrivalTimeRange: formData.flightSchedule
        ? `${formatTime(formData.flightSchedule.arrival.start)} - ${formatTime(
            formData.flightSchedule.arrival.end,
          )}`
        : "",
    };
  }, [formData, sumPerNight, appliedCode]);

  const getInitialValues = (): PersonalInfoFormData => {
    const saveKey = personalInfoData.storage.key;
    const saved = localStorage.getItem(saveKey);
    let initialValues: PersonalInfoFormData | null = null;

    if (saved) {
      try {
        initialValues = JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved form data", e);
      }
    }

    const totalTravelersForForm = formData.travelers
      ? (formData.travelers.adults?.length || 0) +
        (formData.travelers.kids?.length || 0)
      : 1;
    const extraTravelersCount = Math.max(0, totalTravelersForForm - 1);

    const extraTravelers = Array.from({ length: extraTravelersCount }, () => ({
      ...defaultTravelerInfo,
    }));

    if (initialValues) {
      return initialValues;
    }

    return {
      primaryTraveler: defaultTravelerInfo,
      extraTravelers: extraTravelers,
      paymentMethod: "credit",
      previousTravelInfo: "",
    };
  };

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<PersonalInfoFormData>({
    defaultValues: getInitialValues(),
    mode: "onBlur",
  });

  const watchedValues = watch();

  useEffect(() => {
    const currentValues = getValues();
    saveToStorage(currentValues);
  }, [watchedValues, getValues]);

  const onSubmit = (data: PersonalInfoFormData) => {
    const adults = [];

    adults.push({
      id: "primary-" + Date.now(),
      type: "adult" as const,
      name: data.primaryTraveler.name,
      email: data.primaryTraveler.email,
      phone: data.primaryTraveler.phone,
      dateOfBirth: data.primaryTraveler.dateOfBirth,
      documentType: data.primaryTraveler.documentType,
      documentNumber: data.primaryTraveler.documentNumber,
      isPrimary: true,
    });

    let extraIndex = 0;
    const adultsInContext = formData.travelers?.adults?.length || 0;

    for (let i = 1; i < adultsInContext; i++) {
      if (extraIndex < data.extraTravelers.length) {
        const info = data.extraTravelers[extraIndex++];
        adults.push({
          id: `adult-${i}-${Date.now()}`,
          type: "adult" as const,
          name: info.name,
          dateOfBirth: info.dateOfBirth,
          documentType: info.documentType,
          documentNumber: info.documentNumber,
          isPrimary: false,
        });
      }
    }

    const kids = [];
    const kidsInContext = formData.travelers?.kids?.length || 0;
    for (let i = 0; i < kidsInContext; i++) {
      if (extraIndex < data.extraTravelers.length) {
        const info = data.extraTravelers[extraIndex++];
        kids.push({
          id: `kid-${i}-${Date.now()}`,
          type: "kid" as const,
          name: info.name,
          dateOfBirth: info.dateOfBirth,
          documentType: info.documentType,
          documentNumber: info.documentNumber,
          isPrimary: false,
        });
      }
    }

    // Preserve babies as they don't have personal info forms in Step 9
    const babies = formData.travelers?.babies ? [...formData.travelers.babies] : [];

    // Update booking context with new structure
    updateStepData({
      travelers: {
        adults,
        kids,
        babies,
      },
      // Calculated totals for the next step (Booking Summary/Payment)
      calculatedTotals: {
        basePrice: reservationData.basePrice,
        extrasCost: reservationData.extrasCost,
        flightScheduleCost: reservationData.flightScheduleCost,
        leagueCost: reservationData.leagueCost,
        discountAmount: reservationData.discountAmount,
        totalCost: reservationData.grandTotal,
        totalPeople: reservationData.totalPeople,
        standardPassengerCount: reservationData.standardPassengerCount,
        babySupplementTotal: reservationData.babySupplementTotal,
        duration: reservationData.duration,
        nights: reservationData.nights,
      },
      paymentInfo: {
        ...formData.paymentInfo,
      },
      appliedCode,
      discountCode: appliedCode?.code || "",
      previousTravelInfo: data.previousTravelInfo?.trim() || "",
    });

    // Clear localStorage after successful submission
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }

    // Move to next step
    nextStep();
  };

  const handleApplyCode = async () => {
    const code = codeInput.trim();
    if (!code) {
      setAppliedCode(null);
      setCodeStatus({ type: "idle", message: "" });
      return;
    }

    setCodeStatus({ type: "loading", message: "Validando código..." });
    try {
      const response = await fetch("/api/codes/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          orderTotal:
            reservationData.subtotalBeforeDiscount || reservationData.grandTotal,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Código no válido");
      }

      setAppliedCode(result.data);
      setCodeInput(result.data.code);
      setCodeStatus({ type: "success", message: result.message });
    } catch (error: any) {
      setAppliedCode(null);
      setCodeStatus({
        type: "error",
        message: error.message || "No se pudo aplicar el código.",
      });
    }
  };

  const handleRemoveCode = () => {
    setAppliedCode(null);
    setCodeInput("");
    setCodeStatus({ type: "idle", message: "" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full max-w-[894px] px-3 md:px-4 xl:px-6 py-4 md:py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-4 md:gap-6 min-h-[600px] xl:min-h-0">
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
            <div className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
              {personalInfoData.text.title}
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <TravelerFormFields
              control={control}
              errors={errors}
              personalInfoData={personalInfoData}
              getError={getError}
              travelerCounts={{
                adults: formData.travelers?.adults?.length || 1,
                kids: formData.travelers?.kids?.length || 0,
                babies: formData.travelers?.babies?.length || 0,
              }}
              hasMultipleTravelers={hasMultipleTravelers}
            />

            <div className="w-full p-4 md:p-5 bg-white rounded-lg border border-lime-100 flex flex-col gap-3">
              <label className="text-neutral-800 text-base font-semibold font-['Poppins']">
                Código de descuento o regalo
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value)}
                  placeholder="Introduce tu código"
                  className="flex-1 h-12 px-4 rounded border border-gray-200 text-sm font-['Poppins'] outline-none focus:border-[#76C043]"
                />
                {appliedCode ? (
                  <button
                    type="button"
                    onClick={handleRemoveCode}
                    className="h-12 px-5 rounded bg-gray-100 text-gray-700 font-medium font-['Poppins'] hover:bg-gray-200"
                  >
                    Quitar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCode}
                    disabled={codeStatus.type === "loading"}
                    className="h-12 px-5 rounded bg-[#76C043] text-white font-medium font-['Poppins'] hover:bg-lime-600 disabled:opacity-60"
                  >
                    Aplicar
                  </button>
                )}
              </div>
              {codeStatus.message && (
                <p
                  className={`text-sm font-['Poppins'] ${
                    codeStatus.type === "error"
                      ? "text-red-600"
                      : "text-lime-700"
                  }`}
                >
                  {codeStatus.message}
                </p>
              )}
              {appliedCode && (
                <div className="text-sm text-lime-700 font-medium font-['Poppins']">
                  Descuento aplicado: -{appliedCode.discountAmount.toFixed(2)}€
                </div>
              )}
            </div>

            <ReservationSummary
              reservationData={reservationData}
              personalInfoData={personalInfoData}
              formData={formData}
            />
            <BookingNavigation
              onNext={handleSubmit(onSubmit)}
              nextText="Siguiente"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
