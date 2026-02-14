"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useFormContext } from "react-hook-form";
import { useBooking } from "../../context/BookingContext";
import { TranslatedText } from "../../../_components/TranslatedText";
import { useLanguage } from "../../../../context/LanguageContext";
import { getAllDates } from "../../../../../services/dateManagementService";
import {
  getStartingPrice,
  StartingPriceItem,
} from "../../../../../services/packageService";
import {
  formatDateForAPI,
  formatApiDateForComparison,
} from "../../../../../lib/dateUtils";

// Types
interface DurationOption {
  days: number;
  nights: number;
}

interface DateRestrictions {
  enabledDates: string[]; // Array of date strings in YYYY-MM-DD format
  blockedDates: string[];
  customPrices: Record<
    string,
    {
      football?: {
        standard?: number;
        premium?: number;
      };
      basketball?: {
        standard?: number;
        premium?: number;
      };
      both?: {
        standard?: number;
        premium?: number;
      };
    }
  >;
}

interface ApiDateData {
  id: string;
  date: string;
  prices?: {
    standard: number;
    premium: number;
    combined?: number;
  };
  sportName: string;
  league: string;
  months?: string[];
  duration: "1" | "2" | "3" | "4";
  status?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  approve_status?: string;
}

type BaseSportKey = "football" | "basketball";
type SportKey = BaseSportKey | "combined";

// Constants
const DURATION_OPTIONS: DurationOption[] = [
  { days: 2, nights: 1 },
  { days: 3, nights: 2 },
  { days: 4, nights: 3 },
  { days: 5, nights: 4 },
];

const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Setiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const MONTH_NAMES_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const WEEK_DAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Dynamic pricing will be calculated based on sport, package, and nights

// Utility functions
const resetTimeToMidnight = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const isDateInPast = (date: Date): boolean => {
  const today = resetTimeToMidnight(new Date());
  const checkDate = resetTimeToMidnight(date);
  return checkDate < today;
};

const isDateAllowedForCompetition = (
  date: Date,
  restrictions: DateRestrictions,
): boolean => {
  // Use consistent date formatting
  const dateString = formatDateForAPI(date);

  // Check if date is explicitly blocked
  if (restrictions.blockedDates.includes(dateString)) {
    return false;
  }

  // Check if date is explicitly enabled
  return restrictions.enabledDates.includes(dateString);
};

export default function DateSection() {
  const { formData, updateFormData, nextStep } = useBooking();
  const { language } = useLanguage();
  const t = (es: string, en: string) => (language === "en" ? en : es);

  const MONTH_NAMES = language === "en" ? MONTH_NAMES_EN : MONTH_NAMES_ES;
  const WEEK_DAYS = language === "en" ? WEEK_DAYS_EN : WEEK_DAYS_ES;

  // Optional React Hook Form integration
  const formContext = useFormContext?.() || null;
  const setValue = formContext?.setValue;

  // Consistent default values
  const getDefaultValues = () => ({
    selectedDuration: 1,
    selectedStartDate: null as number | null,
    selectedMonth: null as number | null,
    selectedYear: null as number | null,
    currentDate: new Date(2024, 0, 1), // Use a fixed date initially
  });

  const defaultValues = getDefaultValues();

  // State
  const [selectedDuration, setSelectedDuration] = useState(
    defaultValues.selectedDuration,
  );
  const [selectedStartDate, setSelectedStartDate] = useState<number | null>(
    defaultValues.selectedStartDate,
  );
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    defaultValues.selectedMonth,
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(
    defaultValues.selectedYear,
  );
  const [currentDate, setCurrentDate] = useState(defaultValues.currentDate);
  const [isHydrated, setIsHydrated] = useState(false);
  const [apiDateData, setApiDateData] = useState<ApiDateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Package pricing state (from package API)
  const [packagePrices, setPackagePrices] = useState<{
    football: StartingPriceItem | null;
    basketball: StartingPriceItem | null;
    combined: StartingPriceItem | null;
  }>({
    football: null,
    basketball: null,
    combined: null,
  });
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  const getDurationKey = (nights: number): "1" | "2" | "3" | "4" => {
    if (nights <= 1) return "1";
    if (nights === 2) return "2";
    if (nights === 3) return "3";
    return "4";
  };

  const selectedDurationOption = DURATION_OPTIONS[selectedDuration];
  const selectedDurationKey = getDurationKey(selectedDurationOption.nights);

  // Get date restrictions based on API data and competition type
  const getDateRestrictions = useCallback((): DateRestrictions => {
    const enabledDates: string[] = [];
    const blockedDates: string[] = [];
    const customPrices: Record<
      string,
      {
        football?: {
          standard?: number;
          premium?: number;
        };
        basketball?: {
          standard?: number;
          premium?: number;
        };
        both?: {
          standard?: number;
          premium?: number;
        };
      }
    > = {};

    // Filter API data based on selected league and sport
    const filteredApiData = apiDateData.filter((item) => {
      // Match based on leagues array - European or National
      const hasEuropean = formData.leagues?.some(
        (l) => l.group === "European" && l.isSelected,
      );
      const hasNational = formData.leagues?.some(
        (l) => l.group === "National" && l.isSelected,
      );

      // If no leagues are selected, accept all dates
      // If leagues are selected, match the item's league
      const matchesLeague = (() => {
        if (!hasEuropean && !hasNational) return true; // No filter applied
        if (item.league === "both") return true; // Both league matches everything
        if (hasEuropean && item.league === "european") return true;
        if (hasNational && item.league === "national") return true;
        return false;
      })();

      const matchesSport = (() => {
        if (!formData.selectedSport) return true;
        if (formData.selectedSport === "both") {
          return item.sportName === "both";
        }
        return item.sportName === formData.selectedSport;
      })();
      const matchesDuration = (item.duration ?? "1") === selectedDurationKey;
      return matchesLeague && matchesSport && matchesDuration;
    });

    // Process API data
    filteredApiData.forEach((item) => {
      // Use consistent date formatting
      const dateString = formatApiDateForComparison(item.date);

      // Treat dates as enabled if status is missing or explicitly "enabled"
      // API may not return status field, so default to enabled
      const isEnabled = !item.status || item.status === "enabled";

      if (isEnabled) {
        if (!enabledDates.includes(dateString)) {
          enabledDates.push(dateString);
        }

        // Store custom prices for this date from new API structure
        // New API has prices: { standard, premium, combined } directly
        const hasPrices =
          item.prices &&
          (item.prices.standard || item.prices.premium || item.prices.combined);

        if (hasPrices) {
          const entry = customPrices[dateString] ?? {};

          // Assign prices based on sport
          if (item.sportName === "football") {
            entry.football = {
              standard: item.prices!.standard,
              premium: item.prices!.premium,
            };
          } else if (item.sportName === "basketball") {
            entry.basketball = {
              standard: item.prices!.standard,
              premium: item.prices!.premium,
            };
          } else if (item.sportName === "both") {
            entry.both = {
              standard: item.prices!.standard,
              premium: item.prices!.premium,
            };
          }

          if (Object.keys(entry).length > 0) {
            customPrices[dateString] = entry;
          }
        }
      } else {
        blockedDates.push(dateString);
      }
    });

    return {
      enabledDates,
      blockedDates,
      customPrices,
    };
  }, [
    formData.leagues,
    formData.selectedSport,
    apiDateData,
    selectedDurationKey,
  ]);

  const getCurrencySymbolFromCode = (currency?: string | null): string => {
    if (currency === "usd") return "$";
    if (currency === "gbp") return "£";
    return "€";
  };

  const getItemCurrencySymbol = useCallback(
    (item?: StartingPriceItem | null): string =>
      getCurrencySymbolFromCode(item?.currency),
    [],
  );

  const getBaseNightPrice = useCallback(
    (sport: SportKey, pkg: "standard" | "premium", nights: number): number => {
      const item = packagePrices[sport];
      if (!item) return 0;
      const durationKey = getDurationKey(nights);
      const entry = item.pricesByDuration?.[durationKey];
      if (!entry) return 0;
      return pkg === "standard" ? entry.standard : entry.premium;
    },
    [packagePrices],
  );

  const calculatePrice = useCallback(
    (nights: number, checkDate?: Date): string => {
      const sport = formData.selectedSport;
      const packageType = formData.selectedPackage;
      if (!packageType) return "€";

      let totalPrice = 0;
      let currencySymbol = "€";
      let hasCustomPrice = false;

      // Check for custom price if a specific date is provided
      if (checkDate) {
        const restrictions = getDateRestrictions();
        const dateString = formatDateForAPI(checkDate);
        const customPrice = restrictions.customPrices[dateString];

        if (customPrice) {
          if (sport === "both") {
            const combinedCustom =
              packageType === "standard"
                ? customPrice.both?.standard
                : customPrice.both?.premium;

            if (combinedCustom !== undefined) {
              totalPrice = combinedCustom;
              currencySymbol = getItemCurrencySymbol(
                packagePrices.combined ??
                  packagePrices.football ??
                  packagePrices.basketball,
              );
              hasCustomPrice = true;
            } else {
              const footballPrice =
                packageType === "standard"
                  ? customPrice.football?.standard
                  : customPrice.football?.premium;
              const basketballPrice =
                packageType === "standard"
                  ? customPrice.basketball?.standard
                  : customPrice.basketball?.premium;

              if (
                footballPrice !== undefined &&
                basketballPrice !== undefined
              ) {
                totalPrice = footballPrice + basketballPrice;
                currencySymbol = getItemCurrencySymbol(
                  packagePrices.football ?? packagePrices.basketball,
                );
                hasCustomPrice = true;
              } else if (
                footballPrice !== undefined ||
                basketballPrice !== undefined
              ) {
                const footballFinal =
                  footballPrice ??
                  getBaseNightPrice(
                    "football",
                    packageType as "standard" | "premium",
                    nights,
                  );
                const basketballFinal =
                  basketballPrice ??
                  getBaseNightPrice(
                    "basketball",
                    packageType as "standard" | "premium",
                    nights,
                  );
                totalPrice = footballFinal + basketballFinal;
                currencySymbol = getItemCurrencySymbol(
                  packagePrices.football ?? packagePrices.basketball,
                );
                hasCustomPrice = true;
              }
            }
          } else if (sport === "football") {
            const price =
              packageType === "standard"
                ? customPrice.football?.standard
                : customPrice.football?.premium;

            if (price !== undefined) {
              totalPrice = price;
              currencySymbol = getItemCurrencySymbol(packagePrices.football);
              hasCustomPrice = true;
            }
          } else if (sport === "basketball") {
            const price =
              packageType === "standard"
                ? customPrice.basketball?.standard
                : customPrice.basketball?.premium;

            if (price !== undefined) {
              totalPrice = price;
              currencySymbol = getItemCurrencySymbol(packagePrices.basketball);
              hasCustomPrice = true;
            }
          }

          // If custom price found and valid, return it
          if (hasCustomPrice && totalPrice > 0) {
            return `${totalPrice}${currencySymbol}`;
          }
        }
      }

      // Fallback to base price if no custom price found or no date provided
      if (sport === "both") {
        const combinedBase = getBaseNightPrice(
          "combined",
          packageType as "standard" | "premium",
          nights,
        );
        if (combinedBase > 0) {
          totalPrice = combinedBase;
          currencySymbol = getItemCurrencySymbol(packagePrices.combined);
        } else {
          const footballBase = getBaseNightPrice(
            "football",
            packageType as "standard" | "premium",
            nights,
          );
          const basketballBase = getBaseNightPrice(
            "basketball",
            packageType as "standard" | "premium",
            nights,
          );
          totalPrice = footballBase + basketballBase;
          currencySymbol = getItemCurrencySymbol(
            packagePrices.football ?? packagePrices.basketball,
          );
        }
      } else {
        totalPrice = getBaseNightPrice(
          sport as BaseSportKey,
          packageType as "standard" | "premium",
          nights,
        );
        currencySymbol = getItemCurrencySymbol(
          packagePrices[sport as BaseSportKey],
        );
      }

      if (totalPrice <= 0) return currencySymbol;
      return `${totalPrice}${currencySymbol}`;
    },
    [
      formData.selectedSport,
      formData.selectedPackage,
      packagePrices,
      getBaseNightPrice,
      getItemCurrencySymbol,
      getDateRestrictions,
    ],
  );

  // Fetch API data based on current calendar month/year display
  useEffect(() => {
    const fetchDateData = async () => {
      try {
        setIsLoading(true);

        // Get current month and year from calendar display
        const displayMonth = currentDate.getMonth(); // 0-11
        const displayYear = currentDate.getFullYear();

        // Convert month number to month name for API
        const monthNames = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
        const currentMonthName = monthNames[displayMonth];

        // Calculate next month for dual calendar display
        const nextMonthDate = new Date(displayYear, displayMonth + 1, 1);
        const nextMonth = nextMonthDate.getMonth();
        const nextYear = nextMonthDate.getFullYear();
        const nextMonthName = monthNames[nextMonth];

        // Fetch 2 consecutive months for dual calendar display
        const monthsToFetch = [currentMonthName, nextMonthName];

        // Determine league parameter from context
        const hasEuropean = formData.leagues?.some(
          (l) => l.group === "European" && l.isSelected,
        );
        const hasNational = formData.leagues?.some(
          (l) => l.group === "National" && l.isSelected,
        );
        let leagueParam = hasEuropean
          ? "european"
          : hasNational
            ? "national"
            : "national"; // Default to national if nothing selected

        // Get duration from selected duration option
        const durationParam = selectedDurationKey || "1";

        const data = await getAllDates({
          months: monthsToFetch,
          year: displayYear,
          sportName: formData.selectedSport || "",
          league: leagueParam,
          duration: durationParam,
        });

        setApiDateData(
          data.map((item) => ({
            ...item,
            duration: (item.duration ?? "1") as "1" | "2" | "3" | "4",
          })),
        );
      } catch (error) {
        console.error("Error fetching date data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isHydrated) {
      fetchDateData();
    }
  }, [
    currentDate,
    formData.selectedSport,
    formData.leagues,
    selectedDurationKey,
    isHydrated,
  ]); // Refetch when month/year, sport, league, or duration changes

  // Fetch package pricing data
  useEffect(() => {
    const fetchPackagePrices = async () => {
      try {
        setIsLoadingPrices(true);
        const [footballRes, basketballRes, combinedRes] = await Promise.all([
          getStartingPrice("football"),
          getStartingPrice("basketball"),
          getStartingPrice("combined"),
        ]);

        if (
          footballRes.success &&
          basketballRes.success &&
          combinedRes.success
        ) {
          setPackagePrices({
            football: footballRes.data?.[0] || null,
            basketball: basketballRes.data?.[0] || null,
            combined: combinedRes.data?.[0] || null,
          });
        }
      } catch (error) {
        console.error("Error fetching package prices:", error);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchPackagePrices();
  }, []);

  // Set proper current date after hydration
  useEffect(() => {
    setIsHydrated(true);
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  // Load existing data when component mounts or when BookingContext data changes
  useEffect(() => {
    if (isHydrated && formData.departureDate && formData.returnDate) {
      const startDate = new Date(formData.departureDate);
      const endDate = new Date(formData.returnDate);

      // Calculate duration from date difference
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // Find matching duration option
      const durationIndex = DURATION_OPTIONS.findIndex(
        (option) => option.days === diffDays,
      );

      setSelectedDuration(durationIndex >= 0 ? durationIndex : 1);
      setSelectedStartDate(startDate.getDate());
      setSelectedMonth(startDate.getMonth());
      setSelectedYear(startDate.getFullYear());
      setCurrentDate(
        new Date(startDate.getFullYear(), startDate.getMonth(), 1),
      );
    }
  }, [formData.departureDate, formData.returnDate, isHydrated]);

  // Ensure current month or later on mount
  useEffect(() => {
    if (isHydrated) {
      const today = new Date();
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const displayedMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );

      if (displayedMonth < currentMonth) {
        setCurrentDate(currentMonth);
      }
    }
  }, [currentDate, isHydrated]);

  // Update form data when selection changes (only if form context is available)
  useEffect(() => {
    if (
      setValue &&
      selectedStartDate &&
      selectedMonth !== null &&
      selectedYear !== null
    ) {
      const startDate = new Date(
        selectedYear,
        selectedMonth,
        selectedStartDate,
      );
      const duration = DURATION_OPTIONS[selectedDuration];
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + duration.days - 1);

      setValue("dateSelection", {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        duration: duration,
        nights: duration.nights,
      });
    }
  }, [
    selectedStartDate,
    selectedMonth,
    selectedYear,
    selectedDuration,
    setValue,
  ]);

  // Memoized calculations
  const nextMonth = useMemo(() => {
    const next = new Date(currentDate);
    next.setMonth(next.getMonth() + 1);
    return next;
  }, [currentDate]);

  const selectedDateRange = useMemo(() => {
    if (!selectedStartDate || selectedMonth === null || selectedYear === null) {
      return null;
    }

    const startDate = new Date(selectedYear, selectedMonth, selectedStartDate);
    const duration = DURATION_OPTIONS[selectedDuration].days;
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration - 1);

    return { startDate, endDate };
  }, [selectedStartDate, selectedMonth, selectedYear, selectedDuration]);

  // Event handlers
  const handleDateClick = useCallback(
    (day: number, monthIndex: number, year: number) => {
      const selectedDate = new Date(year, monthIndex, day);

      if (!isDateInPast(selectedDate)) {
        setSelectedStartDate(day);
        setSelectedMonth(monthIndex);
        setSelectedYear(year);
      }
    },
    [],
  );

  const handleDurationChange = useCallback((index: number) => {
    setSelectedDuration(index);
    // Clear selection when duration changes
    setSelectedStartDate(null);
    setSelectedMonth(null);
    setSelectedYear(null);
  }, []);

  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + (direction === "prev" ? -1 : 1));

      // Don't allow navigation to past months
      const today = new Date();
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const targetMonth = new Date(
        newDate.getFullYear(),
        newDate.getMonth(),
        1,
      );

      return targetMonth >= currentMonth ? newDate : prevDate;
    });
  }, []);

  // Helper functions
  const getDaysInMonth = useCallback((date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }, []);

  const generateCalendarDays = useCallback(
    (date: Date): (number | null)[] => {
      const daysInMonth = getDaysInMonth(date);
      const firstDay = getFirstDayOfMonth(date);
      const days: (number | null)[] = [];

      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }

      // Add days of the month
      for (let day = 1; day <= daysInMonth; day++) {
        days.push(day);
      }

      // Add empty cells to complete the last week
      const remainder = days.length % 7;
      if (remainder !== 0) {
        const cellsToAdd = 7 - remainder;
        for (let i = 0; i < cellsToAdd; i++) {
          days.push(null);
        }
      }

      return days;
    },
    [getDaysInMonth, getFirstDayOfMonth],
  );

  const getDateStatus = useCallback(
    (day: number | null, monthIndex: number, year: number) => {
      if (!day) {
        return { isSelected: false, isInRange: false, isDisabled: false };
      }

      const currentCheckDate = new Date(year, monthIndex, day);
      const restrictions = getDateRestrictions();

      // Check if date is in the past
      const isPast = isDateInPast(currentCheckDate);

      // Check if date is allowed for the competition type
      const isAllowed = isDateAllowedForCompetition(
        currentCheckDate,
        restrictions,
      );

      // Date is disabled if it's in the past OR not allowed for competition
      const isDisabled = isPast || !isAllowed;

      // Check selection status
      if (!selectedDateRange) {
        return { isSelected: false, isInRange: false, isDisabled };
      }

      const { startDate, endDate } = selectedDateRange;
      const isSelected =
        currentCheckDate >= startDate && currentCheckDate <= endDate;
      const isInRange =
        currentCheckDate > startDate && currentCheckDate < endDate;

      return { isSelected, isInRange, isDisabled };
    },
    [selectedDateRange, getDateRestrictions],
  );

  // Render functions
  const renderEmptyDay = useCallback(
    () => (
      <div className="w-12 h-12 inline-flex flex-col justify-center items-center">
        <div className="text-center text-zinc-950 text-sm font-medium font-['Poppins'] leading-tight">
          {" "}
        </div>
        <div className="text-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed">
          {" "}
        </div>
      </div>
    ),
    [],
  );

  const renderCalendarDay = useCallback(
    (
      day: number | null,
      monthIndex: number,
      year: number,
      isCurrentMonth: boolean = true,
    ) => {
      if (!day) return renderEmptyDay();

      const currentCheckDate = new Date(year, monthIndex, day);
      const { isSelected, isInRange, isDisabled } = getDateStatus(
        day,
        monthIndex,
        year,
      );
      const textColor = isDisabled ? "text-zinc-400" : "text-zinc-950";
      const cursorClass = isDisabled ? "cursor-not-allowed" : "cursor-pointer";

      const handleClick = () => {
        if (isCurrentMonth && !isDisabled) {
          handleDateClick(day, monthIndex, year);
        }
      };

      // Calculate price for the selected duration and this specific date
      // Pass the current date to check for custom prices
      const currentPrice = calculatePrice(
        DURATION_OPTIONS[selectedDuration].nights,
        currentCheckDate,
      );

      if (isSelected) {
        const bgColor = isInRange ? "bg-[#D5EBC5]" : "bg-[#76C043]";
        const textColorSelected = isInRange ? "text-lime-600" : "text-white";
        const outline =
          "rounded outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden";

        // Check if this is the start date (main selection) - only show price on start date
        const isStartDate =
          selectedDateRange &&
          currentCheckDate.getTime() === selectedDateRange.startDate.getTime();

        return (
          <div className={outline}>
            <div
              className={`w-12 h-12 ${bgColor} rounded inline-flex flex-col justify-center items-center cursor-pointer`}
              onClick={handleClick}
            >
              <div
                className={`text-center ${textColorSelected} text-sm font-medium font-['Poppins'] leading-tight`}
              >
                {day}
              </div>
              {isStartDate && (
                <div
                  className={`text-center ${textColorSelected} text-sm font-normal font-['Poppins'] leading-relaxed`}
                >
                  {currentPrice}
                </div>
              )}
            </div>
          </div>
        );
      }

      return (
        <div
          className={`w-12 h-12 rounded inline-flex flex-col justify-center items-center ${cursorClass}`}
          onClick={handleClick}
        >
          <div
            className={`text-center ${textColor} text-sm font-medium font-['Poppins'] leading-tight`}
          >
            {day}
          </div>
          {!isDisabled && (
            <div className="text-center text-lime-600 text-sm font-normal font-['Poppins'] leading-relaxed">
              {currentPrice}
            </div>
          )}
        </div>
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      getDateStatus,
      handleDateClick,
      renderEmptyDay,
      calculatePrice,
      selectedDuration,
    ],
  );

  const renderCalendarWeeks = useCallback(
    (days: (number | null)[], monthIndex: number, year: number) => {
      const weeks: (number | null)[][] = [];
      for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
      }

      return weeks.map((week, weekIndex) => (
        <div
          key={weekIndex}
          className="self-stretch inline-flex justify-start items-center"
        >
          {week.map((day, dayIndex) => {
            const { isSelected, isInRange } = getDateStatus(
              day,
              monthIndex,
              year,
            );

            if (isSelected && isInRange && day) {
              return (
                <div
                  key={dayIndex}
                  className="rounded outline-1 outline-offset-[-1px] outline-[#6AAD3C] overflow-hidden"
                >
                  {renderCalendarDay(day, monthIndex, year, true)}
                </div>
              );
            }

            return (
              <div key={dayIndex}>
                {renderCalendarDay(day, monthIndex, year, true)}
              </div>
            );
          })}
        </div>
      ));
    },
    [getDateStatus, renderCalendarDay],
  );

  const renderCalendarHeader = useCallback(
    (date: Date, showPrevNav: boolean, showNextNav: boolean) => (
      <div className="self-stretch inline-flex justify-between items-center">
        <div
          className={`w-8 h-8 bg-white rounded-full border border-white ${showPrevNav ? "cursor-pointer hover:bg-gray-50" : ""} flex items-center justify-center`}
          onClick={showPrevNav ? () => navigateMonth("prev") : undefined}
        >
          {showPrevNav && <FaChevronLeft size={12} className="text-zinc-950" />}
        </div>
        <div className="px-2 py-[5px] rounded-xl flex justify-start items-start gap-2.5">
          <div className="justify-center text-zinc-950 text-sm font-medium font-['Poppins'] leading-tight">
            {MONTH_NAMES[date.getMonth()]} {date.getFullYear()}
          </div>
        </div>
        <div
          className={`w-8 h-8 bg-white rounded-full border border-white ${showNextNav ? "cursor-pointer hover:bg-gray-50" : ""} flex items-center justify-center`}
          onClick={showNextNav ? () => navigateMonth("next") : undefined}
        >
          {showNextNav && (
            <FaChevronRight size={12} className="text-zinc-950" />
          )}
        </div>
      </div>
    ),
    [navigateMonth, MONTH_NAMES],
  );

  const renderWeekDaysHeader = useCallback(
    () => (
      <div className="self-stretch py-3 inline-flex justify-start items-center gap-6">
        {WEEK_DAYS.map((day) => (
          <div key={day} className="w-7 h-4 relative">
            <div className="w-7 h-4 left-0 top-0 absolute text-center justify-center text-zinc-950 text-xs font-medium font-['Poppins'] leading-none">
              {day}
            </div>
          </div>
        ))}
      </div>
    ),
    [WEEK_DAYS],
  );

  // Memoized calendar data
  const currentMonthDays = useMemo(
    () => generateCalendarDays(currentDate),
    [generateCalendarDays, currentDate],
  );
  const nextMonthDays = useMemo(
    () => generateCalendarDays(nextMonth),
    [generateCalendarDays, nextMonth],
  );

  // Show loading state
  if (isLoading || isLoadingPrices) {
    return (
      <div className="w-full xl:w-[894px] xl:min-h-[754px] px-4 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C] inline-flex flex-col justify-center items-center gap-6 min-h-[600px]">
        <div className="text-center text-neutral-800 text-xl font-medium font-['Poppins']">
          <TranslatedText
            text="Loading available dates..."
            english="Loading available dates..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full xl:w-[894px] xl:min-h-[754px] px-4 xl:px-6 py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C] inline-flex flex-col justify-start items-start gap-6 min-h-[600px]">
      <div className="self-stretch flex flex-col justify-center items-start gap-3">
        <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
          <div className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
            <TranslatedText
              text="Escoge tu día perfecto"
              english="Choose your perfect day"
            />
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          {/* Package and Price Info */}
          {formData.selectedSport && formData.selectedPackage && (
            <div className="w-full p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-gray-600 font-medium">
                  {formData.selectedPackage === "standard"
                    ? t("Pack Estándar", "Standard Package")
                    : t("Pack Premium", "Premium Package")}{" "}
                  -{" "}
                  {formData.selectedSport === "football"
                    ? t("Fútbol", "Football")
                    : formData.selectedSport === "basketball"
                      ? t("Basket", "Basketball")
                      : t("Ambos", "Both")}
                </div>
                <div className="text-lg font-bold text-lime-600">
                  <TranslatedText text="Desde" english="From" />{" "}
                  {calculatePrice(DURATION_OPTIONS[selectedDuration].nights)}
                </div>
                <div className="text-xs text-gray-500">
                  {DURATION_OPTIONS[selectedDuration].days} días,{" "}
                  {DURATION_OPTIONS[selectedDuration].nights} noches
                </div>
              </div>
            </div>
          )}

          {/* Duration Selectionn */}
          <div className="p-1 bg-white rounded-xl outline-1 outline-offset-[-1px] outline-gray-200 w-full overflow-x-auto">
            <div className="flex xl:inline-flex justify-start items-center gap-1 xl:gap-0 min-w-max xl:min-w-0">
              {DURATION_OPTIONS.map((option, index) => (
                <div
                  key={index}
                  className={`w-32 xl:w-36 px-4 xl:px-6 py-3 rounded-lg flex flex-col justify-start items-center cursor-pointer flex-shrink-0 ${
                    selectedDuration === index ? "bg-[#76C043]" : "bg-white"
                  }`}
                  onClick={() => handleDurationChange(index)}
                >
                  <div
                    className={`justify-center text-base xl:text-lg font-medium font-['Poppins'] leading-loose ${
                      selectedDuration === index ? "text-white" : "text-black"
                    }`}
                  >
                    {option.days}{" "}
                    {option.days === 1 ? t("día", "day") : t("días", "days")}
                  </div>
                  <div
                    className={`justify-center text-xs xl:text-sm font-normal font-['Poppins'] leading-relaxed ${
                      selectedDuration === index ? "text-white" : "text-black"
                    }`}
                  >
                    {option.nights}{" "}
                    {option.nights === 1
                      ? t("noche", "night")
                      : t("noches", "nights")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Sectioon */}
          <div className="self-stretch flex flex-col justify-start items-start gap-6">
            <div className="w-full p-4 xl:p-6 bg-white rounded-lg outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-start overflow-x-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 justify-start items-start gap-6 xl:gap-8 min-w-full xl:min-w-0">
                {/* Current Month Calendar */}
                <div className="xl:w-96 flex flex-col justify-start items-start gap-4 xl:gap-6">
                  {renderCalendarHeader(currentDate, true, false)}
                  <div className="mx-auto self-stretch flex flex-col justify-start items-start gap-3">
                    {renderWeekDaysHeader()}
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                      {renderCalendarWeeks(
                        currentMonthDays,
                        currentDate.getMonth(),
                        currentDate.getFullYear(),
                      )}
                    </div>
                  </div>
                </div>

                {/* Next Month Calendar */}
                <div className="w-full xl:w-96 flex flex-col justify-start items-start gap-4 xl:gap-6">
                  {renderCalendarHeader(nextMonth, false, true)}
                  <div className="mx-auto self-stretch flex flex-col justify-start items-start gap-3">
                    {renderWeekDaysHeader()}
                    <div className="self-stretch flex flex-col justify-start items-start gap-3">
                      {renderCalendarWeeks(
                        nextMonthDays,
                        nextMonth.getMonth(),
                        nextMonth.getFullYear(),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={() => {
            if (
              selectedStartDate &&
              selectedMonth !== null &&
              selectedYear !== null
            ) {
              const startDate = new Date(
                selectedYear,
                selectedMonth,
                selectedStartDate,
              );
              const duration = DURATION_OPTIONS[selectedDuration];
              const endDate = new Date(startDate);
              endDate.setDate(startDate.getDate() + duration.days - 1);

              // Get selected date price from apiDateData
              const selectedDateString = formatDateForAPI(startDate);
              const selectedDateData = apiDateData.find(
                (item) =>
                  formatApiDateForComparison(item.date) === selectedDateString,
              );

              const selectedDatePrice = selectedDateData?.prices || {
                standard: 0,
                premium: 0,
                combined: 0,
              };

              updateFormData({
                departureDate: startDate.toISOString(),
                returnDate: endDate.toISOString(),
                selectedDatePrice, // Save price for Step 9 to use
              });

              nextStep();
            }
          }}
          disabled={
            !selectedStartDate ||
            selectedMonth === null ||
            selectedYear === null
          }
          className={`w-44 h-11 px-3.5 py-1.5 rounded backdrop-blur-[5px] inline-flex justify-center items-center gap-2.5 transition-colors ${
            selectedStartDate && selectedMonth !== null && selectedYear !== null
              ? "bg-[#76C043] hover:bg-lime-600 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          <div className="text-center justify-start text-white text-base font-normal font-['Inter']">
            <TranslatedText text="Siguiente" english="Next" />
          </div>
        </button>
      </div>
    </div>
  );
}
