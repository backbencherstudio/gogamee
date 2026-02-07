"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useForm } from "react-hook-form";

import { useBooking } from "../../context/BookingContext";
import { BOOKING_CONSTANTS } from "../../context/BookingContext";
import { TranslatedText } from "../../../_components/TranslatedText";
import { useLanguage } from "../../../../context/LanguageContext";
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
const formatDate = (dateString: string, language: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString(language === "en" ? "en-US" : "es-ES", {
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
  REQUIRED_NAME: {
    es: "El nombre del viajero es obligatorio",
    en: "Traveler name is required",
  },
  REQUIRED_EMAIL: {
    es: "El correo electrónico es obligatorio",
    en: "Email is required",
  },
  INVALID_EMAIL: {
    es: "Dirección de correo electrónico no válida",
    en: "Invalid email address",
  },
  REQUIRED_PHONE: {
    es: "El teléfono es obligatorio",
    en: "Phone number is required",
  },
  REQUIRED_DOB: {
    es: "La fecha de nacimiento es obligatoria",
    en: "Date of birth is required",
  },
  REQUIRED_DOC_TYPE: {
    es: "El tipo de documento es obligatorio",
    en: "Document type is required",
  },
  REQUIRED_DOC_NUM: {
    es: "El número de documento es obligatorio",
    en: "Document number is required",
  },
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

const calculateLeagueCost = (selectedLeague: string): number => {
  if (!selectedLeague) return 0;
  return leaguePricingData.getLeagueAdditionalCost(selectedLeague);
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
  const { updateFormData, nextStep, formData } = useBooking();
  const { sumPerNight } = usePerNightPricing();
  const { language } = useLanguage();
  const t = (es: string, en: string) => (language === "en" ? en : es);

  const getTranslatedError = (errorKey: string | undefined) => {
    if (!errorKey) return undefined;
    const messageObj = ERROR_MESSAGES[errorKey as keyof typeof ERROR_MESSAGES];
    if (messageObj) {
      return t(messageObj.es, messageObj.en);
    }
    return errorKey;
  };

  // Check if we have people count data from howmanytotal page
  const hasMultipleTravelers =
    formData.travelers &&
    (formData.travelers.adults.length > 1 ||
      formData.travelers.kids.length > 0 ||
      formData.travelers.babies.length > 0);

  // Calculate dynamic reservation data from all previous steps
  const reservationData = useMemo(() => {
    const totalPeople = formData.travelers
      ? formData.travelers.adults.length +
        formData.travelers.kids.length +
        formData.travelers.babies.length
      : 0;

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

    const effectiveRemovedLeaguesCount = isEuropeanCompetition
      ? 0
      : removedLeaguesCount;
    const removalCostPerPerson = removeLeagueData.calculateTotalCost(
      effectiveRemovedLeaguesCount,
    );
    const removalTotal = removalCostPerPerson * totalPeople;

    const packageTotal = basePrice * totalPeople;

    const extrasTotal = extrasCost;

    const flightScheduleTotal = flightScheduleCost * totalPeople;

    const leagueTotal = leagueCost * totalPeople;

    // TODO: Migrate to use calculatePriceBreakdown() from context for all pricing
    // const pricing = calculatePriceBreakdown();
    const singleTravelerSupplement =
      totalPeople === 1 ? BOOKING_CONSTANTS.SINGLE_TRAVELER_SUPPLEMENT : 0;

    const grandTotal =
      packageTotal +
      extrasTotal +
      flightScheduleTotal +
      leagueTotal +
      removalTotal +
      singleTravelerSupplement;

    return {
      departureCity:
        formData.selectedCity?.charAt(0).toUpperCase() +
          formData.selectedCity?.slice(1) || "Madrid",
      departureDate: formatDate(formData.departureDate || "", language),
      returnDate: formatDate(formData.returnDate || "", language),
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
      grandTotal,
      totalPeople,
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
  }, [formData, sumPerNight]);

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

    const totalPeople = formData.travelers
      ? formData.travelers.adults.length +
        formData.travelers.kids.length +
        formData.travelers.babies.length
      : 1;
    const extraTravelersCount = Math.max(0, totalPeople - 1);

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

    for (let i = 1; i < formData.travelers.adults.length; i++) {
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
    for (let i = 0; i < formData.travelers.kids.length; i++) {
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

    const babies = [];
    for (let i = 0; i < formData.travelers.babies.length; i++) {
      if (extraIndex < data.extraTravelers.length) {
        const info = data.extraTravelers[extraIndex++];
        babies.push({
          id: `baby-${i}-${Date.now()}`,
          type: "baby" as const,
          name: info.name,
          dateOfBirth: info.dateOfBirth,
          documentType: info.documentType,
          documentNumber: info.documentNumber,
          isPrimary: false,
        });
      }
    }

    // Update booking context with new structure
    updateFormData({
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
        totalCost: reservationData.grandTotal,
        totalPeople: reservationData.totalPeople,
        duration: reservationData.duration,
        nights: reservationData.nights,
      },
      paymentInfo: {
        ...formData.paymentInfo,
      },
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full max-w-[894px] px-3 md:px-4 xl:px-6 py-4 md:py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-4 md:gap-6 min-h-[600px] xl:min-h-0">
        <div className="self-stretch flex flex-col justify-center items-start gap-3">
          <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
            <div className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
              <TranslatedText
                text={personalInfoData.text.title}
                english={personalInfoData.text.titleEn}
              />
            </div>
          </div>
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <TravelerFormFields
              control={control}
              errors={errors}
              t={t}
              personalInfoData={personalInfoData}
              getTranslatedError={getTranslatedError}
              travelerCounts={{
                adults: formData.travelers?.adults?.length || 1,
                kids: formData.travelers?.kids?.length || 0,
                babies: formData.travelers?.babies?.length || 0,
              }}
              hasMultipleTravelers={hasMultipleTravelers}
            />

            <ReservationSummary
              reservationData={reservationData}
              personalInfoData={personalInfoData}
              formData={formData}
              t={t}
            />
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
              <button
                type="submit"
                className="w-full md:w-44 h-12 md:h-11 px-4 md:px-3.5 py-2 md:py-1.5 bg-[#6AAD3C] rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors"
              >
                <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
                  <TranslatedText
                    text={personalInfoData.text.confirm}
                    english="Confirm"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
