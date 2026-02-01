"use client";

import Image from "next/image";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { FaPlane } from "react-icons/fa";
import { useBooking } from "../../context/BookingContext";
import { TranslatedText } from "../../../_components/TranslatedText";
import { useLanguage } from "../../../../context/LanguageContext";
import {
  personalInfoData,
  pricingData,
  flightScheduleData,
  leaguePricingData,
  removeLeagueData,
} from "../../../../lib/appdata";
import { getAllDates } from "../../../../../services/dateManagementService";
import {
  formatDateForAPI,
  formatApiDateForComparison,
} from "../../../../../lib/dateUtils";

// Utility functions for dynamic data calculation
const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
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

// Local pricing helpers (mirror Date step logic)
const usePerNightPricing = () => {
  interface ApiDateData {
    date: string;
    status: string;
    football_standard_package_price: number;
    football_premium_package_price: number;
    baskatball_standard_package_price: number;
    baskatball_premium_package_price: number;
    updated_football_standard_package_price: number | null;
    updated_football_premium_package_price: number | null;
    updated_baskatball_standard_package_price: number | null;
    updated_baskatball_premium_package_price: number | null;
    sportname: string;
    league: string;
    duration?: "1" | "2" | "3" | "4";
  }
  const [apiDateData, setApiDateData] = useState<ApiDateData[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const datesRes = await getAllDates();
        setApiDateData(
          (datesRes || []).map((item) => ({
            ...item,
            duration: (item.duration ?? "1") as "1" | "2" | "3" | "4",
          })),
        );
      } catch (e) {
        console.error("Pricing bootstrap failed:", e);
      }
    };
    fetchAll();
  }, []);

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
              standard:
                item.updated_football_standard_package_price ??
                item.football_standard_package_price,
              premium:
                item.updated_football_premium_package_price ??
                item.football_premium_package_price,
            },
            basketball: {
              standard:
                item.updated_baskatball_standard_package_price ??
                item.baskatball_standard_package_price,
              premium:
                item.updated_baskatball_premium_package_price ??
                item.baskatball_premium_package_price,
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

const FormInput: React.FC<{
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  error?: string;
}> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  error,
}) => (
  <div
    className={`flex-1 inline-flex flex-col justify-start items-start gap-2 ${className}`}
  >
    <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
      {label}
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`self-stretch h-14 px-3 md:px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] text-sm md:text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 w-full ${
        error ? "outline-red-500" : "outline-zinc-200 focus:outline-[#6AAD3C]"
      }`}
    />
    {error && (
      <div className="text-red-500 text-sm font-normal font-['Poppins']">
        {error}
      </div>
    )}
  </div>
);

const DocumentTypeRadio: React.FC<{
  id: string;
  name: string;
  value: "ID" | "Passport";
  selectedValue: "ID" | "Passport";
  onChange: (value: "ID" | "Passport") => void;
  label: string;
}> = ({ id, name, value, selectedValue, onChange, label }) => (
  <div className="inline-flex justify-start items-center gap-2">
    <input
      type="radio"
      id={id}
      name={name}
      checked={selectedValue === value}
      onChange={() => onChange(value)}
      className="w-5 h-5"
    />
    <label
      htmlFor={id}
      className="justify-start text-neutral-800 text-base font-normal font-['Poppins'] leading-relaxed cursor-pointer"
    >
      {label}
    </label>
  </div>
);

const STORAGE_KEY = personalInfoData.storage.key;

// Helper functions for localStorage
const saveToStorage = (data: PersonalInfoFormData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log("💾 Saved to localStorage:", data);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

const loadFromStorage = (): PersonalInfoFormData | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      console.log("📂 Loaded from localStorage:", parsed);
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

  // Check if we have people count data from howmanytotal page
  const hasMultipleTravelers =
    formData.peopleCount &&
    (formData.peopleCount.adults > 1 ||
      formData.peopleCount.kids > 0 ||
      formData.peopleCount.babies > 0);

  // Calculate dynamic reservation data from all previous steps
  const reservationData = useMemo(() => {
    const totalPeople = formData.peopleCount
      ? formData.peopleCount.adults +
        formData.peopleCount.kids +
        formData.peopleCount.babies
      : 0;

    const duration = calculateDuration(
      formData.departureDate || "",
      formData.returnDate || "",
    );
    const nights = Math.max(0, duration - 1);

    // Per-night package price for one person (handles custom prices)
    const basePrice = sumPerNight({
      startISO: formData.departureDate || null,
      endISO: formData.returnDate || null,
      selectedSport:
        (formData.selectedSport as "football" | "basketball" | "both" | "") ||
        "",
      selectedPackage:
        (formData.selectedPackage as "standard" | "premium" | "") || "",
    });

    const extrasCost = calculateExtrasCost(formData.extras || []);
    const flightScheduleCost = calculateFlightScheduleCost(
      formData.flightSchedule,
    );
    const leagueCost = calculateLeagueCost(formData.selectedLeague || "");

    // League removal cost: ignore when European Competition is selected
    const removedLeaguesCount = Array.isArray(formData.removedLeagues)
      ? formData.removedLeagues.length
      : 0;
    const isEuropeanCompetition =
      formData.selectedLeague === "european" ||
      formData.selectedLeague === "European Competition";
    const effectiveRemovedLeaguesCount = isEuropeanCompetition
      ? 0
      : removedLeaguesCount;
    const removalCostPerPerson = removeLeagueData.calculateTotalCost(
      effectiveRemovedLeaguesCount,
    );
    const removalTotal = removalCostPerPerson * totalPeople;

    // Calculate package total (base price × total people)
    const packageTotal = basePrice * totalPeople;

    // Calculate extras total (extras cost is fixed for the entire group, not per person)
    const extrasTotal = extrasCost;

    // Calculate flight schedule total (flight schedule cost × total people)
    const flightScheduleTotal = flightScheduleCost * totalPeople;

    // Calculate league total (league cost × total people)
    const leagueTotal = leagueCost * totalPeople;

    // Calculate grand total
    const singleTravelerSupplement = totalPeople === 1 ? 50 : 0;

    const grandTotal =
      packageTotal +
      extrasTotal +
      flightScheduleTotal +
      leagueTotal +
      removalTotal +
      singleTravelerSupplement;

    return {
      departureCity: formData.selectedCity || "Barcelona",
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

  // Debug: Log the reservation data
  useEffect(() => {
    console.log("🎯 PersonalInfo - People Count Data:", formData.peopleCount);
    console.log(
      "🎯 PersonalInfo - Has Multiple Travelers:",
      hasMultipleTravelers,
    );
    console.log("🎯 PersonalInfo - Reservation Data:", reservationData);

    // Debug calculation breakdown
    if (formData.extras && formData.extras.length > 0) {
      console.log("🔍 Extras Breakdown:");
      formData.extras.forEach((extra) => {
        if (extra.isSelected && !extra.isIncluded) {
          console.log(
            `  - ${extra.name}: ${extra.price}€ × ${extra.quantity} = ${(
              extra.price * extra.quantity
            ).toFixed(2)}€`,
          );
        }
      });
      console.log(
        `  Total Extras Cost: ${reservationData.extrasCost.toFixed(2)}€`,
      );
      console.log(
        `  Extras Total (×${
          reservationData.totalPeople
        }): ${reservationData.extrasTotal.toFixed(2)}€`,
      );
    }

    console.log(`💰 Final Calculation:`);
    console.log(
      `  Package: ${reservationData.basePrice}€ × ${
        reservationData.totalPeople
      } = ${reservationData.packageTotal.toFixed(2)}€`,
    );
    console.log(
      `  Extras: ${
        reservationData.extrasCost
      }€ (fixed for group) = ${reservationData.extrasTotal.toFixed(2)}€`,
    );
    console.log(
      `  Flight Schedule: ${reservationData.flightScheduleCost}€ × ${
        reservationData.totalPeople
      } = ${reservationData.flightScheduleTotal.toFixed(2)}€`,
    );
    console.log(
      `  League: ${reservationData.leagueCost}€ × ${
        reservationData.totalPeople
      } = ${reservationData.leagueTotal.toFixed(2)}€`,
    );
    if (formData.removedLeagues && formData.removedLeagues.length > 0) {
      console.log(
        `  League Removal: ${reservationData.removalCostPerPerson}€ × ${
          reservationData.totalPeople
        } = ${reservationData.removalTotal.toFixed(2)}€`,
      );
    }
    if (reservationData.singleTravelerSupplement > 0) {
      console.log(
        `  Single Traveler Supplement: ${reservationData.singleTravelerSupplement.toFixed(
          2,
        )}€`,
      );
    }
    console.log(`  Grand Total: ${reservationData.grandTotal.toFixed(2)}€`);
  }, [
    formData.peopleCount,
    hasMultipleTravelers,
    reservationData,
    formData.extras,
    formData.removedLeagues,
  ]);

  // Load initial data from localStorage or use defaults
  const getInitialValues = (): PersonalInfoFormData => {
    const savedData = loadFromStorage();

    // Calculate how many extra travelers we need
    const totalPeople = formData.peopleCount
      ? formData.peopleCount.adults +
        formData.peopleCount.kids +
        formData.peopleCount.babies
      : 1;
    const extraTravelersCount = Math.max(0, totalPeople - 1); // Total minus primary traveler

    // Create array of extra travelers
    const extraTravelers = Array.from({ length: extraTravelersCount }, () => ({
      ...defaultTravelerInfo,
    }));

    const initialValues = savedData || {
      primaryTraveler: defaultTravelerInfo,
      extraTravelers: extraTravelers,
      paymentMethod: "credit",
      previousTravelInfo: "",
    };

    // If saved data exists but has old structure, migrate it
    if (savedData && "extraTraveler" in savedData) {
      const migratedData = {
        primaryTraveler: savedData.primaryTraveler,
        extraTravelers: savedData.extraTraveler
          ? [{ ...defaultTravelerInfo, ...savedData.extraTraveler }]
          : [],
        paymentMethod: savedData.paymentMethod,
        previousTravelInfo: savedData.previousTravelInfo,
      };
      console.log("🎯 Migrated old form structure:", migratedData);
      return migratedData;
    }

    console.log("🎯 Initial form values:", initialValues);
    return initialValues;
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

  // Watch all form values for auto-save
  const watchedValues = watch();

  // Auto-save to localStorage whenever form values change
  useEffect(() => {
    const currentValues = getValues();
    saveToStorage(currentValues);
  }, [watchedValues, getValues]);

  // Also save when form data changes to ensure all updates are captured
  useEffect(() => {
    const currentValues = getValues();
    if (
      currentValues.primaryTraveler.name ||
      currentValues.primaryTraveler.email ||
      currentValues.primaryTraveler.phone ||
      currentValues.primaryTraveler.dateOfBirth ||
      currentValues.primaryTraveler.documentType ||
      currentValues.primaryTraveler.documentNumber ||
      currentValues.extraTravelers.some(
        (traveler) =>
          traveler.name ||
          traveler.dateOfBirth ||
          traveler.documentType ||
          traveler.documentNumber,
      )
    ) {
      saveToStorage(currentValues);
    }
  }, [formData, getValues]);

  const onSubmit = (data: PersonalInfoFormData) => {
    console.log("Form Data:", data);
    console.log("Reservation Data:", reservationData);

    // Collect all traveler information
    const allTravelers = [
      {
        name: data.primaryTraveler.name,
        email: data.primaryTraveler.email,
        phone: data.primaryTraveler.phone,
        dateOfBirth: data.primaryTraveler.dateOfBirth,
        documentType: data.primaryTraveler.documentType,
        documentNumber: data.primaryTraveler.documentNumber,
        isPrimary: true,
      },
      ...data.extraTravelers.map((traveler, index) => ({
        name: traveler.name,
        email: "", // Extra travelers don't need email/phone
        phone: "",
        dateOfBirth: traveler.dateOfBirth,
        documentType: traveler.documentType,
        documentNumber: traveler.documentNumber,
        isPrimary: false,
        travelerNumber: index + 2,
      })),
    ];

    console.log("All Travelers:", allTravelers);

    // Update booking context with personal info and calculated totals
    updateFormData({
      personalInfo: {
        firstName: data.primaryTraveler.name.split(" ")[0] || "",
        lastName: data.primaryTraveler.name.split(" ").slice(1).join(" ") || "",
        email: data.primaryTraveler.email,
        phone: data.primaryTraveler.phone,
        previousTravelInfo: data.previousTravelInfo,
      },
      // Add all travelers information for the next step
      allTravelers: allTravelers,
      // Add calculated totals for the next step
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
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              {/* Primary Traveler Information */}
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex flex-col justify-start items-start gap-5">
                  <div className="self-stretch inline-flex justify-start items-center gap-2">
                    <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                      <TranslatedText
                        text={personalInfoData.text.primaryTravelerTitle}
                        english={personalInfoData.text.primaryTravelerTitleEn}
                      />
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                      <Controller
                        name="primaryTraveler.name"
                        control={control}
                        rules={{ required: "Traveler name is required" }}
                        render={({ field }) => (
                          <FormInput
                            label={t(
                              personalInfoData.formFields.travelerName.label,
                              "Traveler Name (as in passport or ID)",
                            )}
                            placeholder={
                              personalInfoData.formFields.travelerName
                                .placeholder
                            }
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.primaryTraveler?.name?.message}
                          />
                        )}
                      />
                      <Controller
                        name="primaryTraveler.email"
                        control={control}
                        rules={{
                          required: t(
                            "El correo electrónico es obligatorio",
                            "Email is required",
                          ),
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: t(
                              "Dirección de correo electrónico no válida",
                              "Invalid email address",
                            ),
                          },
                        }}
                        render={({ field }) => (
                          <FormInput
                            label={t(
                              personalInfoData.formFields.email.label,
                              "Traveler Email",
                            )}
                            type="email"
                            placeholder={
                              personalInfoData.formFields.email.placeholder
                            }
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.primaryTraveler?.email?.message}
                          />
                        )}
                      />
                    </div>
                    <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                      <Controller
                        name="primaryTraveler.phone"
                        control={control}
                        rules={{ required: "Phone number is required" }}
                        render={({ field }) => (
                          <FormInput
                            label={t(
                              personalInfoData.formFields.phone.label,
                              "Traveler Phone Number",
                            )}
                            type="tel"
                            placeholder={
                              personalInfoData.formFields.phone.placeholder
                            }
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.primaryTraveler?.phone?.message}
                          />
                        )}
                      />
                      <Controller
                        name="primaryTraveler.dateOfBirth"
                        control={control}
                        rules={{ required: "Date of birth is required" }}
                        render={({ field }) => (
                          <FormInput
                            label={t(
                              personalInfoData.formFields.dateOfBirth.label,
                              "Date of Birth",
                            )}
                            type="date"
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.primaryTraveler?.dateOfBirth?.message}
                          />
                        )}
                      />
                    </div>
                    <div className="self-stretch flex flex-col justify-start items-start gap-4">
                      <div className="self-stretch flex flex-col justify-center items-start gap-4">
                        <div className="self-stretch inline-flex justify-start items-center gap-2">
                          <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                            {t(
                              personalInfoData.formFields.documentType.label,
                              "Document Type",
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="self-stretch flex flex-col justify-start items-start gap-4">
                        <div className="self-stretch flex flex-col justify-start items-start gap-4">
                          <Controller
                            name="primaryTraveler.documentType"
                            control={control}
                            rules={{ required: "Document type is required" }}
                            render={({ field }) => (
                              <>
                                <DocumentTypeRadio
                                  id="primaryID"
                                  name="primaryDocType"
                                  value="ID"
                                  selectedValue={field.value}
                                  onChange={field.onChange}
                                  label={t(
                                    personalInfoData.formFields.documentType.id,
                                    "ID Card",
                                  )}
                                />
                                <DocumentTypeRadio
                                  id="primaryPassport"
                                  name="primaryDocType"
                                  value="Passport"
                                  selectedValue={field.value}
                                  onChange={field.onChange}
                                  label={t(
                                    personalInfoData.formFields.documentType
                                      .passport,
                                    "Passport",
                                  )}
                                />
                              </>
                            )}
                          />
                          {errors.primaryTraveler?.documentType && (
                            <div className="text-red-500 text-sm font-normal font-['Poppins']">
                              {errors.primaryTraveler.documentType.message}
                            </div>
                          )}
                        </div>
                        <div className="self-stretch flex flex-col justify-start items-start gap-2">
                          <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                            {t(
                              personalInfoData.formFields.documentNumber.label,
                              "Document Number",
                            )}
                          </div>
                          <Controller
                            name="primaryTraveler.documentNumber"
                            control={control}
                            rules={{ required: "Document number is required" }}
                            render={({ field }) => (
                              <>
                                <input
                                  type="text"
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder={
                                    personalInfoData.formFields.documentNumber
                                      .placeholder
                                  }
                                  className={`self-stretch h-14 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 w-full ${
                                    errors.primaryTraveler?.documentNumber
                                      ? "outline-red-500"
                                      : "outline-zinc-200 focus:outline-[#6AAD3C]"
                                  }`}
                                />
                                {errors.primaryTraveler?.documentNumber && (
                                  <div className="text-red-500 text-sm font-normal font-['Poppins']">
                                    {
                                      errors.primaryTraveler.documentNumber
                                        .message
                                    }
                                  </div>
                                )}
                              </>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Previous Travel Information */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                        {t(
                          personalInfoData.formFields.previousTravelInfo.label,
                          "Previous travel information with GoGame (important details for flights/hotels)",
                        )}
                      </div>
                      <Controller
                        name="previousTravelInfo"
                        control={control}
                        render={({ field }) => (
                          <textarea
                            value={field.value}
                            onChange={field.onChange}
                            placeholder={
                              personalInfoData.formFields.previousTravelInfo
                                .placeholder
                            }
                            className="self-stretch h-24 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-zinc-200 text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 focus:outline-[#6AAD3C] resize-none"
                            rows={4}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Extra Travelers Information - Show correct number of travelers */}
              {hasMultipleTravelers && (
                <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                  <div className="self-stretch inline-flex justify-start items-center gap-2">
                    <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                      <TranslatedText
                        text={personalInfoData.text.extraTravelerTitle}
                        english="Accompanying Fan"
                      />{" "}
                      ({reservationData.totalPeople - 1})
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-6">
                    {Array.from(
                      { length: reservationData.totalPeople - 1 },
                      (_, index) => (
                        <div
                          key={index}
                          className="self-stretch flex flex-col justify-start items-start gap-4 border border-gray-200 rounded-lg p-4"
                        >
                          <div className="self-stretch inline-flex justify-start items-center gap-2">
                            <div className="justify-start text-neutral-800 text-base font-semibold font-['Poppins'] leading-loose">
                              <TranslatedText text="Fanático/a" english="Fan" />{" "}
                              {index + 2}
                            </div>
                          </div>
                          <div className="self-stretch flex flex-col justify-start items-start gap-4">
                            <div className="self-stretch flex flex-col md:inline-flex md:flex-row justify-start items-start gap-4 md:gap-6">
                              <Controller
                                name={`extraTravelers.${index}.name`}
                                control={control}
                                rules={{
                                  required: `Traveler ${
                                    index + 2
                                  } name is required`,
                                }}
                                render={({ field }) => (
                                  <FormInput
                                    label={t(
                                      personalInfoData.formFields.travelerName
                                        .label,
                                      "Traveler Name (as in passport or ID)",
                                    )}
                                    placeholder={
                                      personalInfoData.formFields.travelerName
                                        .placeholder
                                    }
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={
                                      errors.extraTravelers?.[index]?.name
                                        ?.message
                                    }
                                  />
                                )}
                              />
                              <Controller
                                name={`extraTravelers.${index}.dateOfBirth`}
                                control={control}
                                rules={{
                                  required: `Traveler ${
                                    index + 2
                                  } date of birth is required`,
                                }}
                                render={({ field }) => (
                                  <FormInput
                                    label={t(
                                      personalInfoData.formFields.dateOfBirth
                                        .label,
                                      "Date of Birth",
                                    )}
                                    type="date"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={
                                      errors.extraTravelers?.[index]
                                        ?.dateOfBirth?.message
                                    }
                                  />
                                )}
                              />
                            </div>
                            <div className="self-stretch flex flex-col justify-start items-start gap-4">
                              <div className="self-stretch flex flex-col justify-center items-start gap-4">
                                <div className="self-stretch inline-flex justify-start items-center gap-2">
                                  <div className="justify-start text-neutral-800 text-base font-semibold font-['Poppins'] leading-loose">
                                    {t(
                                      personalInfoData.formFields.documentType
                                        .label,
                                      "Document Type",
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                  <Controller
                                    name={`extraTravelers.${index}.documentType`}
                                    control={control}
                                    rules={{
                                      required: `Traveler ${
                                        index + 2
                                      } document type is required`,
                                    }}
                                    render={({ field }) => (
                                      <>
                                        <DocumentTypeRadio
                                          id={`extra${index}ID`}
                                          name={`extra${index}DocType`}
                                          value="ID"
                                          selectedValue={field.value}
                                          onChange={field.onChange}
                                          label={t(
                                            personalInfoData.formFields
                                              .documentType.id,
                                            "ID Card",
                                          )}
                                        />
                                        <DocumentTypeRadio
                                          id={`extra${index}Passport`}
                                          name={`extra${index}DocType`}
                                          value="Passport"
                                          selectedValue={field.value}
                                          onChange={field.onChange}
                                          label={t(
                                            personalInfoData.formFields
                                              .documentType.passport,
                                            "Passport",
                                          )}
                                        />
                                      </>
                                    )}
                                  />
                                  {errors.extraTravelers?.[index]
                                    ?.documentType && (
                                    <div className="text-red-500 text-sm font-normal font-['Poppins']">
                                      {
                                        errors.extraTravelers?.[index]
                                          ?.documentType?.message
                                      }
                                    </div>
                                  )}
                                </div>
                                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                  <div className="justify-start text-neutral-800 text-base font-medium font-['Poppins'] leading-relaxed">
                                    {t(
                                      personalInfoData.formFields.documentNumber
                                        .label,
                                      "Document Number",
                                    )}
                                  </div>
                                  <Controller
                                    name={`extraTravelers.${index}.documentNumber`}
                                    control={control}
                                    rules={{
                                      required: `Traveler ${
                                        index + 2
                                      } document number is required`,
                                    }}
                                    render={({ field }) => (
                                      <>
                                        <input
                                          type="text"
                                          value={field.value}
                                          onChange={field.onChange}
                                          placeholder={
                                            personalInfoData.formFields
                                              .documentNumber.placeholder
                                          }
                                          className={`self-stretch h-14 px-4 py-3 bg-white rounded-lg outline-1 outline-offset-[-1px] text-base font-normal font-['Poppins'] leading-normal placeholder:text-zinc-500 w-full ${
                                            errors.extraTravelers?.[index]
                                              ?.documentNumber
                                              ? "outline-red-500"
                                              : "outline-zinc-200 focus:outline-[#6AAD3C]"
                                          }`}
                                        />
                                        {errors.extraTravelers?.[index]
                                          ?.documentNumber && (
                                          <div className="text-red-500 text-sm font-normal font-['Poppins']">
                                            {
                                              errors.extraTravelers?.[index]
                                                ?.documentNumber?.message
                                            }
                                          </div>
                                        )}
                                      </>
                                    )}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

              {/* Reservation Summary */}
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                    <TranslatedText
                      text={personalInfoData.text.reservationTitle}
                      english="Your Reservation Summary"
                    />
                  </div>
                </div>
                <div className="w-full p-3 md:p-6 bg-white rounded-xl outline-1 outline-offset-[-1px] outline-green-50 flex flex-col justify-start items-start gap-3 md:gap-5">
                  <div className="self-stretch inline-flex justify-start items-center gap-20">
                    <div className="flex-1 flex justify-start items-center gap-4">
                      <div className="flex-1 inline-flex flex-col justify-start items-start gap-1.5">
                        <div className="justify-center text-neutral-800 text-lg font-medium font-['Poppins'] leading-loose">
                          <TranslatedText
                            text={personalInfoData.text.flightHotel}
                            english={personalInfoData.text.flightHotelEn}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch py-3 md:py-5 border-t border-b border-gray-200 flex flex-col md:inline-flex md:flex-row justify-start items-start gap-6 md:gap-12">
                      <div className="flex-1 md:w-96 md:border-r md:border-gray-200 inline-flex flex-col justify-center items-center gap-4 md:gap-8">
                        <div className="self-stretch inline-flex justify-start items-center gap-4 md:gap-20">
                          <div className="flex justify-start items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 p-3 md:p-4 bg-[#F1F9EC] rounded-[5.14px] flex justify-start items-center gap-3">
                              <FaPlane className="w-6 h-6 md:w-8 md:h-8 text-[#6AAD3C]" />
                            </div>
                            <div className="flex-1 md:w-32 inline-flex flex-col justify-start items-start gap-1.5">
                              <div className="justify-center text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-none whitespace-nowrap">
                                {t(
                                  personalInfoData.text.departure,
                                  personalInfoData.text.departureEn,
                                )}
                                : {reservationData.departureCity}
                              </div>
                              <div className="self-stretch justify-center text-zinc-500 text-xs md:text-sm font-normal font-['Poppins'] leading-relaxed">
                                {reservationData.departureDate}
                              </div>
                              {reservationData.departureTimeRange && (
                                <div className="self-stretch justify-center text-zinc-400 text-xs font-normal font-['Poppins'] leading-relaxed">
                                  {reservationData.departureTimeRange}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 inline-flex flex-col justify-center items-center gap-4 md:gap-8">
                        <div className="self-stretch inline-flex justify-start items-center gap-4 md:gap-20">
                          <div className="flex justify-start items-center gap-3 md:gap-4">
                            <div className="w-12 h-12 md:w-16 md:h-16 p-3 md:p-4 bg-[#F1F9EC] rounded-[5.14px] flex justify-start items-center gap-3">
                              <FaPlane className="w-6 h-6 md:w-8 md:h-8 text-[#6AAD3C] transform rotate-180" />
                            </div>
                            <div className="flex-1 md:w-32 inline-flex flex-col justify-start items-start gap-1.5">
                              <div className="justify-center text-neutral-800 text-sm md:text-base font-medium font-['Poppins'] leading-none whitespace-nowrap">
                                {t(
                                  personalInfoData.text.arrival,
                                  personalInfoData.text.arrivalEn,
                                )}
                                :{" "}
                                {t(
                                  personalInfoData.text.backTo,
                                  personalInfoData.text.backToEn,
                                )}{" "}
                                {reservationData.departureCity}
                              </div>
                              <div className="self-stretch justify-center text-zinc-500 text-xs md:text-sm font-normal font-['Poppins'] leading-relaxed">
                                {reservationData.returnDate}
                              </div>
                              {reservationData.arrivalTimeRange && (
                                <div className="self-stretch justify-center text-zinc-400 text-xs font-normal font-['Poppins'] leading-relaxed">
                                  {reservationData.arrivalTimeRange}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch pb-3 md:pb-5 border-b border-gray-200 flex flex-col justify-start items-start gap-2.5">
                      {/* Mobile View */}
                      <div className="block md:hidden w-full space-y-3">
                        {/* Package Row */}
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                            {pricingData.getPackageName(
                              formData.selectedSport as
                                | "football"
                                | "basketball",
                              formData.selectedPackage as
                                | "standard"
                                | "premium",
                            ) || "Package"}
                          </span>
                          <div className="text-right">
                            <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                              {reservationData.basePrice}€ x
                              {reservationData.totalPeople}
                            </div>
                            <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                              {reservationData.packageTotal.toFixed(2)}€
                            </div>
                          </div>
                        </div>

                        {/* Individual Extras Rows - Group costs, not per person */}
                        {formData.extras &&
                          formData.extras
                            .filter(
                              (extra) => extra.isSelected && !extra.isIncluded,
                            )
                            .map((extra) => (
                              <div
                                key={extra.id}
                                className="flex justify-between items-center py-2 border-b border-gray-100"
                              >
                                <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                  {extra.name} x{extra.quantity}
                                </span>
                                <div className="text-right">
                                  <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                                    {extra.price}€
                                  </div>
                                  <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                    {(extra.price * extra.quantity).toFixed(2)}€
                                  </div>
                                </div>
                              </div>
                            ))}

                        {/* Flight Schedule Row */}
                        {reservationData.flightScheduleTotal > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                              <TranslatedText
                                text={
                                  personalInfoData.text
                                    .flightScheduleAdjustments
                                }
                                english={
                                  personalInfoData.text
                                    .flightScheduleAdjustmentsEn
                                }
                              />
                            </span>
                            <div className="text-right">
                              <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                                {reservationData.flightScheduleCost}€ x
                                {reservationData.totalPeople}
                              </div>
                              <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                {reservationData.flightScheduleTotal.toFixed(2)}
                                €
                              </div>
                            </div>
                          </div>
                        )}

                        {/* League Additional Cost Row */}
                        {reservationData.leagueTotal > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                              <TranslatedText
                                text={personalInfoData.text.europeanCompetition}
                                english={
                                  personalInfoData.text.europeanCompetitionEn
                                }
                              />
                            </span>
                            <div className="text-right">
                              <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                                {reservationData.leagueCost}€ x
                                {reservationData.totalPeople}
                              </div>
                              <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                {reservationData.leagueTotal.toFixed(2)}€
                              </div>
                            </div>
                          </div>
                        )}

                        {/* League Removal Row */}
                        {reservationData.removalTotal > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                              <TranslatedText
                                text={personalInfoData.text.leagueRemovals}
                                english={personalInfoData.text.leagueRemovalsEn}
                              />
                            </span>
                            <div className="text-right">
                              <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                                {reservationData.removalCostPerPerson}€ x
                                {reservationData.totalPeople}
                              </div>
                              <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                {reservationData.removalTotal.toFixed(2)}€
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Single Traveler Supplement Row (Mobile) */}
                        {reservationData.singleTravelerSupplement > 0 && (
                          <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                              <TranslatedText
                                text={
                                  personalInfoData.text.singleTravelerSupplement
                                }
                                english={
                                  personalInfoData.text
                                    .singleTravelerSupplementEn
                                }
                              />
                            </span>
                            <div className="text-right">
                              <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                                50€
                              </div>
                              <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                {reservationData.singleTravelerSupplement.toFixed(
                                  2,
                                )}
                                €
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Subtotal Row */}
                        <div className="flex justify-between items-center py-4 border-t-2 border-lime-400 bg-lime-50 rounded-lg px-3">
                          <span className="text-lg font-bold font-['Poppins'] text-gray-800">
                            <TranslatedText
                              text={personalInfoData.text.totalCost}
                              english="Total Cost"
                            />
                          </span>
                          <div className="text-right">
                            <div className="text-xl font-bold font-['Poppins'] text-lime-700">
                              {reservationData.grandTotal.toFixed(2)}€
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop View */}
                      <div className="hidden md:block w-full">
                        <div className="w-full grid grid-cols-4 gap-4 border-b-2 border-gray-300 pb-4 mb-2">
                          <div className="text-center text-base font-bold font-['Poppins'] leading-none text-gray-700">
                            <TranslatedText
                              text={personalInfoData.text.concept}
                              english={personalInfoData.text.conceptEn}
                            />
                          </div>
                          <div className="text-center text-base font-bold font-['Poppins'] leading-none text-gray-700">
                            <TranslatedText
                              text={personalInfoData.text.price}
                              english={personalInfoData.text.priceEn}
                            />
                          </div>
                          <div className="text-center text-base font-bold font-['Poppins'] leading-none text-gray-700">
                            <TranslatedText
                              text={personalInfoData.text.quantity}
                              english={personalInfoData.text.quantityEn}
                            />
                          </div>
                          <div className="text-right text-base font-bold font-['Poppins'] leading-none text-gray-700">
                            Total
                          </div>
                        </div>

                        {/* Package Row */}
                        <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                          <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                            {pricingData.getPackageName(
                              formData.selectedSport as
                                | "football"
                                | "basketball",
                              formData.selectedPackage as
                                | "standard"
                                | "premium",
                            ) || "Package"}
                          </div>
                          <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                            {reservationData.basePrice}€
                          </div>
                          <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                            x{reservationData.totalPeople}
                          </div>
                          <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                            {reservationData.packageTotal.toFixed(2)}€
                          </div>
                        </div>

                        {/* Extras Rows - Group costs, not per person */}
                        {formData.extras &&
                          formData.extras
                            .filter(
                              (extra) => extra.isSelected && !extra.isIncluded,
                            )
                            .map((extra) => (
                              <div
                                key={extra.id}
                                className="w-full grid grid-cols-4 gap-4 py-2 border-b border-gray-100"
                              >
                                <div className="text-left text-neutral-800 text-sm font-medium font-['Poppins'] leading-none">
                                  {extra.name}
                                </div>
                                <div className="text-center text-neutral-800 text-sm font-normal font-['Poppins'] leading-none">
                                  {extra.price}€
                                </div>
                                <div className="text-center text-neutral-800 text-sm font-normal font-['Poppins'] leading-none">
                                  x{extra.quantity}
                                </div>
                                <div className="text-right text-neutral-800 text-sm font-medium font-['Poppins'] leading-none">
                                  {(extra.price * extra.quantity).toFixed(2)}€
                                </div>
                              </div>
                            ))}

                        {/* Flight Schedule Row */}
                        {reservationData.flightScheduleTotal > 0 && (
                          <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                            <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                              <TranslatedText
                                text={
                                  personalInfoData.text
                                    .flightScheduleAdjustments
                                }
                                english={
                                  personalInfoData.text
                                    .flightScheduleAdjustmentsEn
                                }
                              />
                            </div>
                            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              {reservationData.flightScheduleCost}€
                            </div>
                            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              x{reservationData.totalPeople}
                            </div>
                            <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                              {reservationData.flightScheduleTotal.toFixed(2)}€
                            </div>
                          </div>
                        )}

                        {/* League Additional Cost Row */}
                        {reservationData.leagueTotal > 0 && (
                          <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                            <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                              <TranslatedText
                                text={personalInfoData.text.europeanCompetition}
                                english={
                                  personalInfoData.text.europeanCompetitionEn
                                }
                              />
                            </div>
                            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              {reservationData.leagueCost}€
                            </div>
                            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              x{reservationData.totalPeople}
                            </div>
                            <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                              {reservationData.leagueTotal.toFixed(2)}€
                            </div>
                          </div>
                        )}

                        {/* League Removal Row */}
                        {reservationData.removalTotal > 0 && (
                          <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                            <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                              <TranslatedText
                                text={personalInfoData.text.leagueRemovals}
                                english={personalInfoData.text.leagueRemovalsEn}
                              />
                            </div>
                            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              {reservationData.removalCostPerPerson}€
                            </div>
                            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              x{reservationData.totalPeople}
                            </div>
                            <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                              {reservationData.removalTotal.toFixed(2)}€
                            </div>
                          </div>
                        )}

                        {/* Single Traveler Supplement Row (Desktop) */}
                        {reservationData.singleTravelerSupplement > 0 && (
                          <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
                            <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                              <TranslatedText
                                text={
                                  personalInfoData.text.singleTravelerSupplement
                                }
                                english={
                                  personalInfoData.text
                                    .singleTravelerSupplementEn
                                }
                              />
                            </div>
                            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              50€
                            </div>
                            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                              -
                            </div>
                            <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                              {reservationData.singleTravelerSupplement.toFixed(
                                2,
                              )}
                              €
                            </div>
                          </div>
                        )}

                        {/* Subtotal Row */}
                        <div className="w-full grid grid-cols-4 gap-4 py-3 border-t-2 border-gray-300">
                          <div className="text-left text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                            <TranslatedText
                              text={personalInfoData.text.subtotal}
                              english={personalInfoData.text.subtotalEn}
                            />
                          </div>
                          <div className="text-center text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                            -
                          </div>
                          <div className="text-center text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                            -
                          </div>
                          <div className="text-right text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
                            {reservationData.grandTotal.toFixed(2)}€
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Total Cost Summary */}
                    <div className="w-full bg-gradient-to-r from-lime-50 to-green-50 rounded-xl p-6 mt-6 border-2 border-lime-200 shadow-sm">
                      <div className="space-y-3">
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-bold text-gray-800 font-['Poppins']">
                            <TranslatedText
                              text={personalInfoData.text.letsGo}
                              english={personalInfoData.text.letsGoEn}
                            />
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-2 border-b border-lime-200">
                            <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                              <TranslatedText
                                text={personalInfoData.text.packageTotal}
                                english={personalInfoData.text.packageTotalEn}
                              />
                            </span>
                            <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                              {reservationData.packageTotal.toFixed(2)}€
                            </span>
                          </div>

                          {reservationData.extrasTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-lime-200">
                              <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                <TranslatedText
                                  text={personalInfoData.text.extrasTotal}
                                  english={personalInfoData.text.extrasTotalEn}
                                />
                              </span>
                              <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                                {reservationData.extrasTotal.toFixed(2)}€
                              </span>
                            </div>
                          )}

                          {reservationData.flightScheduleTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-lime-200">
                              <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                <TranslatedText
                                  text={
                                    personalInfoData.text.flightScheduleTotal
                                  }
                                  english={
                                    personalInfoData.text.flightScheduleTotalEn
                                  }
                                />
                              </span>
                              <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                                {reservationData.flightScheduleTotal.toFixed(2)}
                                €
                              </span>
                            </div>
                          )}

                          {reservationData.leagueTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-lime-200">
                              <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                <TranslatedText
                                  text={
                                    personalInfoData.text.europeanCompetition
                                  }
                                  english={
                                    personalInfoData.text.europeanCompetitionEn
                                  }
                                />
                              </span>
                              <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                                {reservationData.leagueTotal.toFixed(2)}€
                              </span>
                            </div>
                          )}

                          {reservationData.singleTravelerSupplement > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-lime-200">
                              <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                <TranslatedText
                                  text={
                                    personalInfoData.text
                                      .singleTravelerSupplement
                                  }
                                  english={
                                    personalInfoData.text
                                      .singleTravelerSupplementEn
                                  }
                                />
                              </span>
                              <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                                {reservationData.singleTravelerSupplement.toFixed(
                                  2,
                                )}
                                €
                              </span>
                            </div>
                          )}

                          {reservationData.removalTotal > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-lime-200">
                              <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                                <TranslatedText
                                  text={personalInfoData.text.leagueRemovals}
                                  english={
                                    personalInfoData.text.leagueRemovalsEn
                                  }
                                />
                              </span>
                              <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                                {reservationData.removalTotal.toFixed(2)}€
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="border-t-2 border-lime-400 pt-4 mt-4">
                          <div className="flex justify-between items-center">
                            <span className=" text-xl font-bold font-['Poppins'] text-gray-800">
                              <TranslatedText
                                text={personalInfoData.text.totalCost}
                                english="Total Cost"
                              />
                            </span>
                            <span className=" text-2xl font-bold font-['Poppins'] text-lime-700">
                              {reservationData.grandTotal.toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods
              <div className="self-stretch px-3 md:px-5 py-4 md:py-6 bg-white rounded-lg flex flex-col justify-start items-start gap-4 md:gap-5">
                <div className="self-stretch inline-flex justify-start items-center gap-2">
                  <div className="justify-start text-neutral-800 text-lg font-semibold font-['Poppins'] leading-loose">
                    {personalInfoData.text.paymentMethodTitle}
                  </div>
                </div>

                <Controller
                  name="paymentMethod"
                  control={control}
                  rules={{ required: "Payment method is required" }}
                  render={({ field }) => (
                    <>
                      <PaymentMethodCard
                        value="credit"
                        selectedValue={field.value}
                        onChange={field.onChange}
                        label={personalInfoData.paymentMethods[0].label}
                      >
                        <div className="flex justify-start items-center gap-3">
                          <div className="w-16 p-2 rounded-[2.92px] outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <Image
                              src="/stepper/icon/visa.png"
                              alt="Visa"
                              width={64}
                              height={32}
                              className="h-auto w-full"
                            />
                          </div>
                          <div className="w-16 h-8 p-2 rounded-[2.91px] outline-1 outline-offset-[-1px] outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <Image
                              src="/stepper/icon/mastercard.png"
                              alt="Mastercard"
                              width={64}
                              height={32}
                              className="h-6 w-auto"
                            />
                          </div>
                        </div>
                      </PaymentMethodCard>

                      <PaymentMethodCard
                        value="google"
                        selectedValue={field.value}
                        onChange={field.onChange}
                        label={personalInfoData.paymentMethods[1].label}
                      >
                        <div className="flex justify-start items-center gap-2.5">
                          <div className="p-2 mr-8 rounded outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <Image
                              src="/stepper/icon/gpay.png"
                              alt="Google Pay"
                              className="h-6 w-auto scale-300"
                              width={100}
                              height={100}
                              quality={100}
                            />
                          </div>
                        </div>
                      </PaymentMethodCard>

                      <PaymentMethodCard
                        value="apple"
                        selectedValue={field.value}
                        onChange={field.onChange}
                        label={personalInfoData.paymentMethods[2].label}
                      >
                        <div className="w-20 flex justify-start items-center gap-2.5">
                          <div className="flex-1 p-2 rounded outline-green-50 inline-flex flex-col justify-center items-center gap-2">
                            <Image
                              src="/stepper/icon/apay.png"
                              alt="Apple Pay"
                              className="h-6 w-auto"
                              width={100}
                              height={100}
                              quality={100}
                            />
                          </div>
                        </div>
                      </PaymentMethodCard>
                    </>
                  )}
                />
                {errors.paymentMethod && (
                  <div className="text-red-500 text-sm font-normal font-['Poppins']">
                    {errors.paymentMethod.message}
                  </div>
                )}
              </div> */}
            </div>
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
