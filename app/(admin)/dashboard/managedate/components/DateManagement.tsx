"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Save,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  X,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import AppData from "../../../../lib/appdata";
import { useToast } from "../../../../../components/ui/toast";
import {
  getStartingPrice,
  type StartingPriceItem,
} from "../../../../../services/packageService";
import {
  getAllDates,
  updateDate,
  createDate,
  deleteDate,
  DateManagementItem,
} from "../../../../../services/dateManagementService";
import {
  formatDateForAPI,
  formatApiDateForComparison,
  createCalendarDate,
} from "../../../../../lib/dateUtils";

// Date restriction interface for calendar-based system
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

// Competition type interface
interface CompetitionType {
  id: string;
  name: string;
  restrictions: DateRestrictions;
}

// Price editing interface
type SportOption = "football" | "basketball" | "both";

interface PriceEditData {
  date: string;
  // We now support editing all sports at once
  prices: {
    football: { standard: number | null; premium: number | null };
    basketball: { standard: number | null; premium: number | null };
    combined: { standard: number | null; premium: number | null };
  };
  apiItemId?: string;
}

const FALLBACK_DURATION_PRICES = {
  football: {
    "1": { standard: 379, premium: 1499 },
    "2": { standard: 379, premium: 1499 },
    "3": { standard: 379, premium: 1499 },
    "4": { standard: 379, premium: 1499 },
  },
  basketball: {
    "1": { standard: 359, premium: 1479 },
    "2": { standard: 359, premium: 1479 },
    "3": { standard: 359, premium: 1479 },
    "4": { standard: 359, premium: 1479 },
  },
  combined: {
    "1": { standard: 738, premium: 2978 },
    "2": { standard: 738, premium: 2978 },
    "3": { standard: 738, premium: 2978 },
    "4": { standard: 738, premium: 2978 },
  },
} satisfies Record<
  "football" | "basketball" | "combined",
  Record<"1" | "2" | "3" | "4", { standard: number; premium: number }>
>;

export default function DateManagement() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Helper to update URL
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const [competitionTypes, setCompetitionTypes] = useState<CompetitionType[]>(
    [],
  );

  const [selectedCompetition, setSelectedCompetition] = useState<string>(
    searchParams.get("league") || "national",
  );

  const [selectedSport, setSelectedSport] = useState<SportOption>(
    (searchParams.get("sport") as SportOption) || "football",
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const param = searchParams.get("month");
    if (param) {
      const date = new Date(param + "-02"); // Avoid timezone issues
      if (!isNaN(date.getTime())) return date;
    }
    return new Date();
  });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceEditData, setPriceEditData] = useState<PriceEditData | null>(
    null,
  );
  const [editingPrices, setEditingPrices] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<
    "1" | "2" | "3" | "4"
  >((searchParams.get("duration") as "1" | "2" | "3" | "4") || "1");
  const [basePrices, setBasePrices] = useState<{
    football: StartingPriceItem | null;
    basketball: StartingPriceItem | null;
    combined: StartingPriceItem | null;
  }>({
    football: null,
    basketball: null,
    combined: null,
  });

  const getCurrencySymbol = (currency?: string): string => {
    if (!currency) return "€";
    const normalized = currency.toLowerCase();
    if (
      normalized === "usd" ||
      normalized === "dollar" ||
      normalized === "us dollar"
    )
      return "$";
    if (
      normalized === "gbp" ||
      normalized === "pound" ||
      normalized === "british pound"
    )
      return "£";
    if (normalized === "eur" || normalized === "euro" || normalized === "€")
      return "€";
    return currency;
  };

  const getBasePrice = useCallback(
    (
      sport: SportOption,
      packageType: "standard" | "premium",
      durationKey?: "1" | "2" | "3" | "4",
    ): number => {
      const duration = durationKey ?? selectedDuration;
      const baseKey = sport === "both" ? "combined" : sport;
      const item = basePrices[baseKey];
      const durationPrices = item?.pricesByDuration?.[duration];

      if (durationPrices) {
        return packageType === "standard"
          ? durationPrices.standard
          : durationPrices.premium;
      }

      const fallback =
        FALLBACK_DURATION_PRICES[baseKey][duration] ??
        FALLBACK_DURATION_PRICES[baseKey]["1"];
      return fallback ? fallback[packageType] : 0;
    },
    [basePrices, selectedDuration],
  );

  const getSportCurrency = useCallback(
    (sport: SportOption): string | undefined => {
      const baseKey = sport === "both" ? "combined" : sport;
      return basePrices[baseKey]?.currency;
    },
    [basePrices],
  );

  // API data state
  const [apiDateData, setApiDateData] = useState<
    (DateManagementItem & { duration: "1" | "2" | "3" | "4" })[]
  >([]);
  const [isLoadingApiData, setIsLoadingApiData] = useState(true);
  const [isSavingApiData, setIsSavingApiData] = useState(false);

  // Month names
  const MONTH_NAMES = [
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

  const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Load API date data
  const loadApiDateData = useCallback(
    async (options?: { isBackground?: boolean }) => {
      try {
        if (!options?.isBackground) {
          setIsLoadingApiData(true);
        }

        const year = currentMonth.getFullYear();
        const monthName = MONTH_NAMES[currentMonth.getMonth()]; // e.g., "January"

        const data = await getAllDates({
          months: [monthName],
          year: year,
          sportName: selectedSport,
          league: selectedCompetition,
          duration: selectedDuration,
        });

        // Ensure data is valid array
        const validData = Array.isArray(data) ? data : [];

        setApiDateData(
          validData.map((item: any) => {
            // Derive status based on selected sport
            let derivedStatus = "enabled";
            const sportName = selectedSport;

            if (item.sports) {
              if (sportName === "both") {
                // If combined exists, check it, otherwise check if both exist?
                // Typically 'both' view might rely on combined status or aggregate.
                // Let's rely on 'combined' if present, or fallback to 'disabled'
                derivedStatus = item.sports.combined?.status || "disabled";
              } else {
                derivedStatus = item.sports[sportName]?.status || "disabled";
              }
            } else if (item.status) {
              // Fallback if status is at root
              derivedStatus = item.status;
            }

            return {
              ...item,
              duration: (item.duration ?? "1") as "1" | "2" | "3" | "4",
              sportname: item.sportName || selectedSport,
              status: derivedStatus,
            };
          }),
        );
      } catch (error) {
        console.error("Error loading API date data:", error);
        setApiDateData([]); // Set empty array on error
        addToast({
          type: "error",
          title: "Error",
          description: "Failed to load date data from API",
          duration: 5000,
        });
      } finally {
        if (!options?.isBackground) {
          setIsLoadingApiData(false);
        }
      }
    },
    [
      addToast,
      currentMonth,
      selectedSport,
      selectedCompetition,
      selectedDuration,
    ],
  );

  // Load data from AppData, base prices from package service, and API data
  useEffect(() => {
    loadDateRestrictions();
    // loadBasePrices(); // Removed as per user request (backend handles merging)
    loadApiDateData();
  }, [loadApiDateData]);

  const loadDateRestrictions = () => {
    // Load from AppData
    const allRestrictions = AppData.dateRestrictions.getAllRestrictions();

    const competitionTypesData = [
      {
        id: "national",
        name: "National Leagues",
        restrictions: allRestrictions.national,
      },
      {
        id: "european",
        name: "European Leagues",
        restrictions: allRestrictions.european,
      },
    ];

    setCompetitionTypes(competitionTypesData);
  };

  // Load base prices from package service
  const loadBasePrices = async () => {
    try {
      const [footballPriceRes, basketballPriceRes, combinedPriceRes] =
        await Promise.all([
          getStartingPrice("football"),
          getStartingPrice("basketball"),
          getStartingPrice("combined"),
        ]);

      setBasePrices({
        football:
          footballPriceRes.success && footballPriceRes.data?.length
            ? footballPriceRes.data[0]
            : null,
        basketball:
          basketballPriceRes.success && basketballPriceRes.data?.length
            ? basketballPriceRes.data[0]
            : null,
        combined:
          combinedPriceRes.success && combinedPriceRes.data?.length
            ? combinedPriceRes.data[0]
            : null,
      });
    } catch (error) {
      console.error("Error loading base prices:", error);
    }
  };

  // Calendar utility functions
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = (date: Date): (number | null)[] => {
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

    return days;
  };

  const getDateStatus = (
    day: number | null,
    month: Date,
  ): "enabled" | "blocked" | "neutral" => {
    if (!day) return "neutral";

    const date = createCalendarDate(month.getFullYear(), month.getMonth(), day);
    const dateString = formatDateForAPI(date);

    // Find API data for this date, selected competition, sport, AND duration
    // Each duration has independent date entries - filtering by duration ensures
    // that dates enabled for one duration don't affect other durations
    const apiDateItem = apiDateData.find((item) => {
      if (!item?.date) return false;
      const itemDateString = formatApiDateForComparison(item.date);
      return (
        itemDateString === dateString &&
        item.league === selectedCompetition &&
        item.sportName === selectedSport &&
        item.duration === selectedDuration
      ); // Critical: each duration has its own date entries
    });

    if (apiDateItem) {
      return apiDateItem.status === "enabled" ? "enabled" : "blocked";
    }

    // For durations beyond 1-night, do not fallback to static data
    if (selectedDuration !== "1") {
      return "neutral";
    }

    // Fallback to AppData only for legacy 1-night defaults if available
    const selectedComp = competitionTypes.find(
      (comp) => comp.id === selectedCompetition,
    );
    if (!selectedComp || !selectedComp.restrictions) return "neutral";

    // Ensure arrays exist before calling includes
    const enabledDates = selectedComp.restrictions.enabledDates || [];
    const blockedDates = selectedComp.restrictions.blockedDates || [];

    if (Array.isArray(enabledDates) && enabledDates.includes(dateString)) {
      return "enabled";
    }
    if (Array.isArray(blockedDates) && blockedDates.includes(dateString)) {
      return "blocked";
    }
    return "neutral";
  };

  const handleDateClick = async (day: number, month: Date) => {
    if (!isEditing) return;

    const date = createCalendarDate(month.getFullYear(), month.getMonth(), day);
    const dateString = formatDateForAPI(date);

    // Find existing API data for this date, competition, sport, AND duration
    // Each duration has completely independent date entries - same date can exist for multiple durations
    const existingItem = Array.isArray(apiDateData)
      ? apiDateData.find((item) => {
          const itemDateString = formatApiDateForComparison(item.date);
          return (
            itemDateString === dateString &&
            item.league === selectedCompetition &&
            item.sportName === selectedSport &&
            item.duration === selectedDuration
          ); // Critical: filter by duration to allow same date for different durations
        })
      : undefined;

    try {
      setIsSavingApiData(true);

      if (existingItem) {
        // Update existing item
        // Update existing item - toggle status for specific sport
        const newStatus =
          existingItem.status === "enabled" ? "blocked" : "enabled";
        await updateDate(existingItem.id, {
          sportName: selectedSport,
          status: newStatus === "enabled" ? "enabled" : "disabled", // Align with schema enum
        });

        // Update local state
        setApiDateData((prev) => {
          if (!Array.isArray(prev)) return [];
          return prev.map((item) =>
            item.id === existingItem.id ? { ...item, status: newStatus } : item,
          );
        });
      } else {
        // Create new item via API - this creates a completely independent entry for the selected duration
        // Even if the same date exists for other durations, this creates a new entry for this specific duration
        try {
          // Set time to 12:00 UTC to avoid timezone shifting the calendar day
          const utcNoon = new Date(
            Date.UTC(
              date.getFullYear(),
              date.getMonth(),
              date.getDate(),
              12,
              0,
              0,
              0,
            ),
          );
          const footballStandardBase =
            selectedSport === "both"
              ? getBasePrice("both", "standard")
              : getBasePrice("football", "standard");
          const footballPremiumBase =
            selectedSport === "both"
              ? getBasePrice("both", "premium")
              : getBasePrice("football", "premium");
          const basketballStandardBase =
            selectedSport === "both"
              ? getBasePrice("both", "standard")
              : getBasePrice("basketball", "standard");
          const basketballPremiumBase =
            selectedSport === "both"
              ? getBasePrice("both", "premium")
              : getBasePrice("basketball", "premium");

          const newDateData = {
            date: utcNoon.toISOString(),
            // status field not needed at root for new simplified POST, handled by sportName
            league: selectedCompetition,
            sportName: selectedSport, // camelCase
            duration: selectedDuration,
            prices: {
              standard:
                selectedSport === "both"
                  ? footballStandardBase + basketballStandardBase // Base logic approximation
                  : selectedSport === "football"
                    ? footballStandardBase
                    : basketballStandardBase,
              premium:
                selectedSport === "both"
                  ? footballPremiumBase + basketballPremiumBase
                  : selectedSport === "football"
                    ? footballPremiumBase
                    : basketballPremiumBase,
            },
          };

          const createdItem = await createDate(newDateData);

          // Update local state with the created item
          setApiDateData((prev) => [
            ...prev,
            {
              ...createdItem,
              status: "enabled",
              duration: createdItem.duration ?? selectedDuration,
            },
          ]);

          addToast({
            type: "success",
            title: "Date Created",
            description: "New date has been created successfully",
            duration: 3000,
          });
        } catch (createError) {
          console.error("Error creating new date:", createError);
          addToast({
            type: "error",
            title: "Error",
            description: "Failed to create new date",
            duration: 5000,
          });
        }
      }

      await loadApiDateData({ isBackground: true });
      setHasChanges(true);
    } catch (error) {
      console.error("Error updating date status:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to update date status",
        duration: 5000,
      });
    } finally {
      setIsSavingApiData(false);
    }
  };

  // Handle price editing
  const handlePriceClick = (day: number, month: Date) => {
    if (!editingPrices) return;

    const date = createCalendarDate(month.getFullYear(), month.getMonth(), day);
    const dateString = formatDateForAPI(date);

    // Find API data for this date, competition, and selected duration (sport doesn't matter for fetching item as it contains all sports)
    const apiDateItem = apiDateData.find((item) => {
      const itemDateString = formatApiDateForComparison(item.date);
      return (
        itemDateString === dateString &&
        item.league === selectedCompetition &&
        // item.sportName === selectedSport && // We want the item regardless of sport, but finding by generic criteria is safer.
        // Actually, the API returns items filtered by sport.
        // Wait, did we filter by sport in getAllDates? Yes.
        // So apiDateData ONLY contains items for the selectedSport.
        // However, the backend 'getAll' returns the full 'sports' object in the document.
        // So even if we filtered by sportName='football', the document *should* have other sports if they exist in DB.
        // BUT the API request *sent* 'sport=football'.
        // Does the backend filter the returned *fields*? No, it returns `DateManagement.find(query)`.
        // So the `sports` object is complete.
        // Let's rely on finding consistent item.
        item.league === selectedCompetition &&
        item.duration === selectedDuration
      );
    });

    if (!apiDateItem || apiDateItem.status !== "enabled") {
      addToast({
        type: "warning",
        title: "Date Not Enabled",
        description:
          "Please enable this date first before setting custom prices",
        duration: 4000,
      });
      return;
    }

    // The GET API returns a simplified structure with 'prices' field
    // containing the merged custom/base prices for the selected sport
    const prices = apiDateItem.prices || { standard: 0, premium: 0 };

    // Map the single 'prices' object to the sport-specific structure
    const targetSport = selectedSport === "both" ? "combined" : selectedSport;

    setPriceEditData({
      date: dateString,
      prices: {
        football:
          targetSport === "football"
            ? prices
            : { standard: null, premium: null },
        basketball:
          targetSport === "basketball"
            ? prices
            : { standard: null, premium: null },
        combined:
          targetSport === "combined"
            ? prices
            : { standard: null, premium: null },
      },
      apiItemId: apiDateItem.id,
    });
    setShowPriceModal(true);
  };

  const handleSavePrice = async () => {
    if (!priceEditData || !priceEditData.apiItemId) return;

    try {
      setIsSavingApiData(true);

      const updates: Promise<any>[] = [];

      // Helper to push update if valid
      const queueUpdate = (
        sport: "football" | "basketball" | "combined",
        prices: { standard: number | null; premium: number | null },
      ) => {
        // Only update if at least one price is set and valid (or 0)
        // We assume 0 is a valid override (free?) or maybe clearing?
        // Let's assume we send whatever is in the inputs.
        // If null, we might want to NOT send it, or send 0?
        // Backend expects numbers.
        const std = prices.standard ?? 0;
        const prm = prices.premium ?? 0;

        // Simplify: Always update all 3 distinct sports to ensure consistency if user edited them
        const payload = {
          sportName: sport,
          prices: {
            standard: std,
            premium: prm,
          },
        };
        updates.push(updateDate(priceEditData.apiItemId!, payload));
      };

      const targetSport = selectedSport === "both" ? "combined" : selectedSport;
      // @ts-ignore
      queueUpdate(targetSport, priceEditData.prices[targetSport]);

      await Promise.all(updates);

      // Local update optimization (optional, but good for instant feedback before reload)
      // Actually we just reload silently now.

      setShowPriceModal(false);
      setPriceEditData(null);
      setHasChanges(true);

      addToast({
        type: "success",
        title: "Success!",
        description: "All prices updated successfully",
        duration: 3000,
      });

      await loadApiDateData({ isBackground: true });
    } catch (error) {
      console.error("Error saving prices:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to update prices",
        duration: 5000,
      });
    } finally {
      setIsSavingApiData(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Update AppData with new restrictions and custom prices
      const selectedComp = competitionTypes.find(
        (comp) => comp.id === selectedCompetition,
      );
      if (selectedComp) {
        const competitionType = selectedComp.id as "european" | "national";

        AppData.dateRestrictions.updateRestrictions(competitionType, {
          enabledDates: selectedComp.restrictions.enabledDates,
          blockedDates: selectedComp.restrictions.blockedDates,
          customPrices: selectedComp.restrictions.customPrices,
        });

        console.log(
          `Updated ${competitionType} restrictions and prices:`,
          selectedComp.restrictions,
        );
      }

      setIsEditing(false);
      setEditingPrices(false);
      setHasChanges(false);

      // Show success message
      addToast({
        type: "success",
        title: "Success!",
        description:
          "Date restrictions and custom prices updated successfully!",
        duration: 4000,
      });
    } catch (error) {
      console.error("Error saving date restrictions:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Error saving date restrictions. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPrices(false);
    setHasChanges(false);
    loadDateRestrictions(); // Reload original data
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditPrices = () => {
    setEditingPrices(true);
  };

  const handleResetDuration = async (duration: "1" | "2" | "3" | "4") => {
    // Confirm before resetting
    const confirmMessage = `Are you sure you want to reset all data for ${duration} Night${duration === "1" ? "" : "s"} package?\n\nThis will delete all enabled dates, blocked dates, and custom prices for:\n- ${selectedCompetition === "national" ? "National" : "European"} Leagues\n- ${selectedSport === "football" ? "Football" : selectedSport === "basketball" ? "Basketball" : "Both"}\n- ${duration} Night${duration === "1" ? "" : "s"} duration\n\nThis action cannot be undone.`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsSavingApiData(true);

      // Find all dates for this duration, competition, and sport
      const datesToDelete = Array.isArray(apiDateData)
        ? apiDateData.filter(
            (item) =>
              item.league === selectedCompetition &&
              item.sportName === selectedSport &&
              item.duration === duration,
          )
        : [];

      // Delete all matching dates
      if (datesToDelete.length > 0) {
        await Promise.all(
          datesToDelete.map((item) =>
            deleteDate(item.id, { sportName: item.sportName }),
          ),
        );
      }

      // Reload data to refresh the UI
      await loadApiDateData({ isBackground: true });

      addToast({
        type: "success",
        title: "Reset Complete",
        description: `All data for ${duration} Night${duration === "1" ? "" : "s"} package has been reset successfully`,
        duration: 4000,
      });

      setHasChanges(true);
    } catch (error) {
      console.error("Error resetting duration data:", error);
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to reset duration data. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSavingApiData(false);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prevMonth) => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + (direction === "prev" ? -1 : 1));

      const monthStr = `${newMonth.getFullYear()}-${String(
        newMonth.getMonth() + 1,
      ).padStart(2, "0")}`;
      updateFilter("month", monthStr);

      return newMonth;
    });
  };

  const selectedCompetitionData = competitionTypes.find(
    (comp) => comp.id === selectedCompetition,
  );
  const calendarDays = generateCalendarDays(currentMonth);

  return (
    <div className="py-4 px-4 md:pl-10 md:pr-8 min-h-screen mb-4">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header Section */}
        <div className="flex items-start flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-2xl md:text-3xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-4 md:pt-8">
              Enable/Block Dates
            </h1>
            <p className="text-gray-600 font-['Poppins'] text-sm md:text-base">
              Manage specific dates for different competition types using the
              calendar interface
            </p>
          </div>
        </div>

        {/* Competition Type Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <span className="text-gray-700 font-medium font-['Poppins'] text-sm md:text-base">
              Select Competition Type
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              {competitionTypes.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => {
                    setSelectedCompetition(comp.id);
                    updateFilter("league", comp.id);
                  }}
                  className={`px-3 py-2 md:px-4 text-xs md:text-sm lg:text-base rounded-md font-medium font-['Poppins'] transition-all duration-200 ${
                    selectedCompetition === comp.id
                      ? "bg-[#76C043] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {comp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendar Interface */}
        {selectedCompetitionData && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:gap-6">
              {/* Header with Edit/Save buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 md:gap-3">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#76C043]" />
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 font-['Poppins']">
                    {selectedCompetitionData.name}
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {!isEditing && !editingPrices ? (
                    <>
                      <button
                        onClick={handleEdit}
                        className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base"
                      >
                        <Calendar className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Calendar</span>
                        <span className="sm:hidden">Edit</span>
                      </button>
                      <button
                        onClick={handleEditPrices}
                        className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base"
                      >
                        <DollarSign className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit Prices</span>
                        <span className="sm:hidden">Prices</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleCancel}
                        className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving || isSavingApiData || !hasChanges}
                        className={`flex items-center justify-center gap-2 px-3 py-2 md:px-4 rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base ${
                          hasChanges && !isSaving && !isSavingApiData
                            ? "bg-[#76C043] hover:bg-lime-600 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {isSaving || isSavingApiData ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Saving...</span>
                            <span className="sm:hidden">Save</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              Save Changes
                            </span>
                            <span className="sm:hidden">Save</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Sport Selection */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                <div className="flex flex-col gap-3">
                  <span className="text-gray-700 font-medium font-['Poppins'] text-sm md:text-base">
                    Select Sport
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setSelectedSport("football");
                        updateFilter("sport", "football");
                      }}
                      className={`px-4 py-2 md:px-6 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${
                        selectedSport === "football"
                          ? "bg-[#76C043] text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      <span>⚽</span>
                      <span>Football</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSport("basketball");
                        updateFilter("sport", "basketball");
                      }}
                      className={`px-4 py-2 md:px-6 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${
                        selectedSport === "basketball"
                          ? "bg-[#76C043] text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      <span>🏀</span>
                      <span>Basketball</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSport("both");
                        updateFilter("sport", "both");
                      }}
                      className={`px-4 py-2 md:px-6 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${
                        selectedSport === "both"
                          ? "bg-[#76C043] text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      <span>⚽🏀</span>
                      <span>Both</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200">
                <div className="flex flex-col gap-3">
                  <span className="text-gray-700 font-medium font-['Poppins'] text-sm md:text-base">
                    Select Package Duration
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-2">
                      {(["1", "2", "3", "4"] as const).map((duration) => (
                        <button
                          key={duration}
                          onClick={() => {
                            setSelectedDuration(duration);
                            updateFilter("duration", duration);
                          }}
                          className={`px-4 py-2 md:px-6 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${
                            selectedDuration === duration
                              ? "bg-[#76C043] text-white"
                              : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          <span>{duration}</span>
                          <span>Night{duration === "1" ? "" : "s"}</span>
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleResetDuration(selectedDuration)}
                      disabled={isSavingApiData}
                      className={`px-3 py-2 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${
                        isSavingApiData
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                      }`}
                      title={`Reset all data for ${selectedDuration} Night${selectedDuration === "1" ? "" : "s"} package`}
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Calendar Display */}
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-base md:text-lg font-medium text-gray-900 font-['Poppins']">
                    Calendar Management
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                    </button>
                    <span className="text-base md:text-lg font-medium text-gray-900 font-['Poppins'] min-w-[150px] md:min-w-[200px] text-center">
                      {MONTH_NAMES[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="bg-gray-50 p-2 md:p-4 rounded-lg">
                  {/* Week day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEK_DAYS.map((day) => (
                      <div
                        key={day}
                        className="text-center text-xs md:text-sm font-medium text-gray-600 font-['Poppins'] py-1 md:py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar days */}
                  <div className="grid grid-cols-7 gap-1">
                    {isLoadingApiData
                      ? Array.from({ length: 35 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-auto min-h-[2rem] md:min-h-[3rem] w-full rounded-lg bg-gray-100 animate-pulse border-2 border-transparent"
                          ></div>
                        ))
                      : calendarDays.map((day, index) => {
                          if (!day) {
                            return (
                              <div key={index} className="h-8 md:h-12"></div>
                            );
                          }

                          const status = getDateStatus(day, currentMonth);
                          const isClickable = isEditing || editingPrices;
                          const date = createCalendarDate(
                            currentMonth.getFullYear(),
                            currentMonth.getMonth(),
                            day,
                          );
                          const dateString = formatDateForAPI(date);

                          // Check for custom prices from API data for selected sport and duration
                          const apiDateItem = apiDateData.find((item) => {
                            const itemDateString = formatApiDateForComparison(
                              item.date,
                            );
                            return (
                              itemDateString === dateString &&
                              item.league === selectedCompetition &&
                              item.sportName === selectedSport &&
                              item.duration === selectedDuration
                            );
                          });

                          // Check if this date has custom prices
                          const hasCustomPrices = apiDateItem?.prices
                            ? apiDateItem.prices.standard > 0 ||
                              apiDateItem.prices.premium > 0
                            : false;

                          // Get currency symbol
                          const currencySymbol = getCurrencySymbol(
                            getSportCurrency(selectedSport) ??
                              basePrices.football?.currency ??
                              basePrices.basketball?.currency ??
                              basePrices.combined?.currency ??
                              "euro",
                          );

                          // Get prices for selected sport
                          let displayStandard: number | null = null;
                          let displayPremium: number | null = null;

                          if (apiDateItem && apiDateItem.prices) {
                            displayStandard = apiDateItem.prices.standard;
                            displayPremium = apiDateItem.prices.premium;
                          }

                          const baseStandard = getBasePrice(
                            selectedSport,
                            "standard",
                          );
                          const basePremium = getBasePrice(
                            selectedSport,
                            "premium",
                          );

                          if (status === "enabled") {
                            if (
                              displayStandard == null ||
                              displayStandard === 0
                            ) {
                              displayStandard = baseStandard;
                            }
                            if (
                              displayPremium == null ||
                              displayPremium === 0
                            ) {
                              displayPremium = basePremium;
                            }
                          }

                          const shouldDisplayPrices =
                            status === "enabled" &&
                            displayStandard !== null &&
                            displayPremium !== null &&
                            (displayStandard !== 0 || displayPremium !== 0);

                          const standardToDisplay = displayStandard ?? 0;
                          const premiumToDisplay = displayPremium ?? 0;

                          return (
                            <div key={index} className="relative">
                              <button
                                onClick={() => {
                                  if (isEditing) {
                                    handleDateClick(day, currentMonth);
                                  } else if (editingPrices) {
                                    handlePriceClick(day, currentMonth);
                                  }
                                }}
                                disabled={!isClickable}
                                className={`h-auto min-h-[2rem] md:min-h-[3rem] w-full rounded-lg border-2 font-medium font-['Poppins'] transition-all duration-200 flex flex-col items-center justify-center p-1 ${
                                  isClickable
                                    ? "cursor-pointer hover:opacity-80"
                                    : "cursor-default"
                                } ${
                                  status === "enabled"
                                    ? "bg-green-100 border-green-500 text-green-700"
                                    : status === "blocked"
                                      ? "bg-red-100 border-red-500 text-red-700"
                                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                              >
                                <div className="text-xs md:text-sm font-semibold">
                                  {day}
                                </div>
                                {/* Display prices (custom or base) */}
                                {shouldDisplayPrices && (
                                  <div className="flex items-center justify-center gap-1 mt-0.5 w-full px-0.5">
                                    <span className="text-[10px] md:text-[11px]">
                                      {selectedSport === "football"
                                        ? "⚽"
                                        : selectedSport === "basketball"
                                          ? "🏀"
                                          : "⚽🏀"}
                                    </span>
                                    <span className="text-[10px] md:text-[11px] font-medium">
                                      {currencySymbol}
                                      {Math.round(standardToDisplay)}
                                      <span className="text-[9px] md:text-[10px] opacity-75">
                                        /{currencySymbol}
                                        {Math.round(premiumToDisplay)}
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </button>

                              {/* Custom price indicator */}
                              {hasCustomPrices && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                  <DollarSign className="w-2 h-2 text-white" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs md:text-sm font-['Poppins']">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                    <span className="text-green-700">Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                    <span className="text-red-700">Blocked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-white border-2 border-gray-300 rounded"></div>
                    <span className="text-gray-700">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-2 h-2 text-white" />
                    </div>
                    <span className="text-blue-700">Custom Price</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {/* <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2 font-['Poppins']">
                  Current Configuration (
                  {selectedSport === "football"
                    ? "⚽ Football"
                    : selectedSport === "basketball"
                      ? "🏀 Basketball"
                      : "⚽🏀 Both"}
                  )
                </h3>
                <div className="text-xs md:text-sm text-gray-600 font-['Poppins'] space-y-1">
                  <p>
                    <strong>API Data:</strong>{" "}
                    {
                      apiDateData.filter(
                        (item) =>
                          item.league === selectedCompetition &&
                          item.sportName === selectedSport &&
                          item.duration === selectedDuration,
                      ).length
                    }{" "}
                    dates loaded
                  </p>
                  <p>
                    <strong>Enabled Dates:</strong>{" "}
                    {
                      apiDateData.filter(
                        (item) =>
                          item.league === selectedCompetition &&
                          item.sportName === selectedSport &&
                          item.duration === selectedDuration &&
                          item.status === "enabled",
                      ).length
                    }{" "}
                    dates
                  </p>
                  <p>
                    <strong>Blocked Dates:</strong>{" "}
                    {
                      apiDateData.filter(
                        (item) =>
                          item.league === selectedCompetition &&
                          item.sportName === selectedSport &&
                          item.duration === selectedDuration &&
                          item.status === "blocked",
                      ).length
                    }{" "}
                    dates
                  </p>
                  <p>
                    <strong>Custom Prices:</strong>{" "}
                    {
                      apiDateData.filter((item) => {
                        const isInRange =
                          item.league === selectedCompetition &&
                          (selectedSport === "both" ||
                            item.sportName === selectedSport) &&
                          item.duration === selectedDuration;

                        if (!isInRange) return false;

                        // @ts-ignore
                        const sports = item.sports || {};

                        const hasCustom = (
                          sport: "football" | "basketball" | "combined",
                        ) => {
                          // @ts-ignore
                          const s = sports[sport];
                          if (!s) return false;
                          const std = Number(s.standard);
                          const prem = Number(s.premium);
                          return std > 0 || prem > 0;
                        };

                        if (selectedSport === "both") {
                          return (
                            hasCustom("football") ||
                            hasCustom("basketball") ||
                            hasCustom("combined")
                          );
                        }
                        // @ts-ignore
                        return hasCustom(selectedSport);
                      }).length
                    }{" "}
                    dates
                  </p>
                </div>
              </div> */}
            </div>
          </div>
        )}

        {/* Preview Sectionn */}
        {/* <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 lg:p-6 shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#76C043]" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 font-['Poppins']">
              Live Preview
            </h2>
          </div>

          <div className="text-xs md:text-sm text-gray-600 font-['Poppins']">
            <p className="mb-2">
              These settings will be applied to the booking system. Users will
              only be able to select departure dates that are enabled in the
              calendar.
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-blue-800 font-medium text-xs md:text-sm">
                Changes will take effect immediately after saving. Test the
                booking flow to see the updated date restrictions.
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Price Editing Modal */}
      {showPriceModal && priceEditData && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-20 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPriceModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">
                Set Custom Prices
              </h2>
              <button
                onClick={() => setShowPriceModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 font-['Poppins']">
                  <strong>Date:</strong>{" "}
                  {new Date(priceEditData.date).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-600 font-medium mt-1">
                  ✏️ Editing prices for{" "}
                  {selectedSport === "both"
                    ? "Combined"
                    : selectedSport === "football"
                      ? "Football"
                      : "Basketball"}{" "}
                  Package
                </p>

                {/* Debug info for selected sport */}
                {/* <div className="mt-3 text-xs text-gray-500 space-y-1">
                  {(["football", "basketball", "combined"] as const)
                    .filter((s) => {
                      if (selectedSport === "both") return s === "combined";
                      return s === selectedSport;
                    })
                    .map((sport) => (
                      <div key={sport} className="flex justify-between">
                        <span className="capitalize">{sport} Base:</span>
                        <span>
                          {basePrices[sport]
                            ? `${getCurrencySymbol(basePrices[sport]?.currency)}${Math.round(getBasePrice(sport === "combined" ? "both" : sport, "standard", selectedDuration))}/${getCurrencySymbol(basePrices[sport]?.currency)}${Math.round(getBasePrice(sport === "combined" ? "both" : sport, "premium", selectedDuration))}`
                            : "Not loaded"}
                        </span>
                      </div>
                    ))}
                </div> */}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 font-['Poppins']">
                    Updating Prices For:
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 font-['Poppins'] capitalize">
                    {selectedSport === "both"
                      ? "Combined Package"
                      : `${selectedSport} Package`}{" "}
                    ({selectedDuration} Night
                    {selectedDuration === "1" ? "" : "s"})
                  </span>
                </div>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                {(["football", "basketball", "combined"] as const)
                  .filter((s) => {
                    if (selectedSport === "both") return s === "combined";
                    return s === selectedSport;
                  })
                  .map((sport) => (
                    <div
                      key={sport}
                      className="border-gray-200 border rounded-lg p-4 bg-white shadow-sm"
                    >
                      <h3 className="text-sm font-semibold text-gray-800 mb-3 capitalize flex items-center gap-2">
                        {sport === "football"
                          ? "⚽ Football Package"
                          : sport === "basketball"
                            ? "🏀 Basketball Package"
                            : "⚽🏀 Combined Package"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1 font-['Poppins']">
                            Standard (
                            {getCurrencySymbol(
                              getSportCurrency(
                                sport === "combined" ? "both" : sport,
                              ) ?? "euro",
                            )}
                            )
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={priceEditData.prices[sport].standard ?? ""}
                            onChange={(e) => {
                              const value = e.target.value.trim();
                              const numValue =
                                value === "" ? null : Number(value);
                              setPriceEditData((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      prices: {
                                        ...prev.prices,
                                        [sport]: {
                                          ...prev.prices[sport],
                                          standard: isNaN(numValue as number)
                                            ? null
                                            : numValue,
                                        },
                                      },
                                    }
                                  : null,
                              );
                            }}
                            placeholder={`Base: ${getCurrencySymbol(getSportCurrency(sport === "combined" ? "both" : sport) ?? "euro")}${Math.round(getBasePrice(sport === "combined" ? "both" : sport, "standard"))}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm font-['Poppins']"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1 font-['Poppins']">
                            Premium (
                            {getCurrencySymbol(
                              getSportCurrency(
                                sport === "combined" ? "both" : sport,
                              ) ?? "euro",
                            )}
                            )
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={priceEditData.prices[sport].premium ?? ""}
                            onChange={(e) => {
                              const value = e.target.value.trim();
                              const numValue =
                                value === "" ? null : Number(value);
                              setPriceEditData((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      prices: {
                                        ...prev.prices,
                                        [sport]: {
                                          ...prev.prices[sport],
                                          premium: isNaN(numValue as number)
                                            ? null
                                            : numValue,
                                        },
                                      },
                                    }
                                  : null,
                              );
                            }}
                            placeholder={`Base: ${getCurrencySymbol(getSportCurrency(sport === "combined" ? "both" : sport) ?? "euro")}${Math.round(getBasePrice(sport === "combined" ? "both" : sport, "premium"))}`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm font-['Poppins']"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={() => setShowPriceModal(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSavePrice}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200"
                >
                  <DollarSign className="w-4 h-4" />
                  Save All Prices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
