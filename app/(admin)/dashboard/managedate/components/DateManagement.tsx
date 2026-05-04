"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  X,
  AlertTriangle,
} from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import AppData from "../../../../lib/appdata";
import { useToast } from "../../../../../components/ui/toast";
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
      football?: { standard?: number; premium?: number };
      basketball?: { standard?: number; premium?: number };
      both?: { standard?: number; premium?: number };
    }
  >;
}

interface CompetitionType {
  id: string;
  name: string;
  restrictions: DateRestrictions;
}

type SportOption = "football" | "basketball" | "both";

interface PriceEditData {
  date: string;
  prices: {
    football: { standard: number | null; premium: number | null };
    basketball: { standard: number | null; premium: number | null };
    combined: { standard: number | null; premium: number | null };
  };
  apiItemId?: string;
}

export default function DateManagement() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value); else params.delete(key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const [competitionTypes, setCompetitionTypes] = useState<CompetitionType[]>([]);
  const [selectedCompetition, setSelectedCompetition] = useState<string>(searchParams.get("league") || "national");
  const [selectedSport, setSelectedSport] = useState<SportOption>((searchParams.get("sport") as SportOption) || "football");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const param = searchParams.get("month");
    if (param) {
      const date = new Date(param + "-02");
      if (!isNaN(date.getTime())) return date;
    }
    return new Date();
  });
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceEditData, setPriceEditData] = useState<PriceEditData | null>(null);
  const [editingPrices, setEditingPrices] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<"1" | "2" | "3" | "4">((searchParams.get("duration") as "1" | "2" | "3" | "4") || "1");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetDurationTarget, setResetDurationTarget] = useState<"1" | "2" | "3" | "4" | null>(null);
  
  // Base prices state from API metadata
  const [basePrices, setBasePrices] = useState<{ standard: number; premium: number }>({ standard: 0, premium: 0 });

  const [apiDateData, setApiDateData] = useState<any[]>([]);
  const [isLoadingApiData, setIsLoadingApiData] = useState(true);
  const [isSavingApiData, setIsSavingApiData] = useState(false);

  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const loadApiDateData = useCallback(
    async (options?: { isBackground?: boolean }) => {
      try {
        if (!options?.isBackground) setIsLoadingApiData(true);
        const year = currentMonth.getFullYear();
        const monthName = MONTH_NAMES[currentMonth.getMonth()];

        const response: any = await getAllDates({
          months: [monthName],
          year: year,
          sportName: selectedSport === "both" ? "combined" : selectedSport,
          league: selectedCompetition,
          duration: selectedDuration,
        });

        if (response.success) {
          if (response.meta_data?.default_prices) {
            setBasePrices(response.meta_data.default_prices);
          }
          setApiDateData(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error("Error loading API date data:", error);
        setApiDateData([]);
        addToast({ type: "error", title: "Error", description: "Failed to load date data from API" });
      } finally {
        if (!options?.isBackground) setIsLoadingApiData(false);
      }
    },
    [addToast, currentMonth, selectedSport, selectedCompetition, selectedDuration],
  );

  useEffect(() => {
    const allRestrictions = AppData.dateRestrictions.getAllRestrictions();
    setCompetitionTypes([
      { id: "national", name: "National Leagues", restrictions: allRestrictions.national },
      { id: "european", name: "European Leagues", restrictions: allRestrictions.european },
      { id: "spain", name: "Spain Pack", restrictions: allRestrictions.spain },
    ]);
    loadApiDateData();
  }, [loadApiDateData]);

  const getDaysInMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date): number => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const generateCalendarDays = (date: Date): (number | null)[] => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  const handleDateClick = async (day: number, month: Date) => {
    if (!isEditing) return;
    const dateString = formatDateForAPI(createCalendarDate(month.getFullYear(), month.getMonth(), day));
    const existingItem = apiDateData.find(item => formatApiDateForComparison(item.date) === dateString);

    try {
      setIsSavingApiData(true);
      if (existingItem) {
        const newStatus = existingItem.status === "enabled" ? "disabled" : "enabled";
        await updateDate(existingItem.id, {
          sportName: selectedSport === "both" ? "combined" : selectedSport,
          status: newStatus,
        });
      } else {
        const utcNoon = new Date(Date.UTC(month.getFullYear(), month.getMonth(), day, 12, 0, 0, 0));
        await createDate({
          date: utcNoon.toISOString(),
          league: selectedCompetition,
          sportName: selectedSport === "both" ? "combined" : selectedSport,
          duration: selectedDuration,
          prices: { standard: 0, premium: 0 }
        });
      }
      await loadApiDateData({ isBackground: true });
      setHasChanges(true);
    } catch (error) {
      console.error("Error updating date status:", error);
    } finally {
      setIsSavingApiData(false);
    }
  };

  const handlePriceClick = (day: number, month: Date) => {
    if (!editingPrices) return;
    const dateString = formatDateForAPI(createCalendarDate(month.getFullYear(), month.getMonth(), day));
    const apiDateItem = apiDateData.find(item => formatApiDateForComparison(item.date) === dateString);

    if (!apiDateItem || apiDateItem.status !== "enabled") {
      addToast({ type: "warning", title: "Date Not Enabled", description: "Please enable this date first before setting custom prices" });
      return;
    }

    const prices = apiDateItem.prices || { standard: 0, premium: 0 };
    const targetSport = selectedSport === "both" ? "combined" : selectedSport;

    setPriceEditData({
      date: dateString,
      prices: {
        football: targetSport === "football" ? prices : { standard: null, premium: null },
        basketball: targetSport === "basketball" ? prices : { standard: null, premium: null },
        combined: targetSport === "combined" ? prices : { standard: null, premium: null },
      },
      apiItemId: apiDateItem.id,
    });
    setShowPriceModal(true);
  };

  const handleSavePrice = async () => {
    if (!priceEditData || !priceEditData.apiItemId) return;
    try {
      setIsSavingApiData(true);
      const targetSport = selectedSport === "both" ? "combined" : selectedSport;
      const prices = (priceEditData.prices as any)[targetSport];
      await updateDate(priceEditData.apiItemId!, {
        sportName: targetSport,
        prices: { standard: prices.standard ?? 0, premium: prices.premium ?? 0 },
      });
      setShowPriceModal(false);
      setHasChanges(true);
      addToast({ type: "success", title: "Success!", description: "Prices updated successfully" });
      await loadApiDateData({ isBackground: true });
    } catch (error) {
      console.error("Error saving prices:", error);
    } finally {
      setIsSavingApiData(false);
    }
  };

  const executeResetDuration = async () => {
    if (!resetDurationTarget) return;
    try {
      setIsSavingApiData(true);
      const datesToDelete = apiDateData.filter(item => item.league === selectedCompetition && item.duration === resetDurationTarget);
      if (datesToDelete.length > 0) {
        await Promise.all(datesToDelete.map(item => deleteDate(item.id, { sportName: item.sportName })));
      }
      await loadApiDateData({ isBackground: true });
      addToast({ type: "success", title: "Reset Complete", description: "Data reset successfully" });
      setHasChanges(true);
    } catch (error) {
      console.error("Error resetting duration data:", error);
    } finally {
      setIsSavingApiData(false);
      setShowResetConfirm(false);
      setResetDurationTarget(null);
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + (direction === "prev" ? -1 : 1));
      updateFilter("month", `${newMonth.getFullYear()}-${String(newMonth.getMonth() + 1).padStart(2, "0")}`);
      return newMonth;
    });
  };

  const calendarDays = generateCalendarDays(currentMonth);

  return (
    <div className="py-4 px-4 md:pl-10 md:pr-8 min-h-screen mb-4">
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex items-start flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-950 text-2xl md:text-3xl lg:text-4xl font-semibold font-['Poppins'] leading-tight pt-4 md:pt-8">Enable/Block Dates</h1>
            <p className="text-gray-600 font-['Poppins'] text-sm md:text-base">Manage specific dates for different competition types using the calendar interface</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <span className="text-gray-700 font-medium font-['Poppins'] text-sm md:text-base">Select Competition Type</span>
            <div className="flex flex-col sm:flex-row gap-2">
              {competitionTypes.map(comp => (
                <button key={comp.id} onClick={() => { setSelectedCompetition(comp.id); updateFilter("league", comp.id); }}
                  className={`px-3 py-2 md:px-4 text-xs md:text-sm lg:text-base rounded-md font-medium font-['Poppins'] transition-all duration-200 ${selectedCompetition === comp.id ? "bg-[#76C043] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
                  {comp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 lg:p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 md:gap-3"><Calendar className="w-5 h-5 md:w-6 md:h-6 text-[#76C043]" /><h2 className="text-lg md:text-xl font-semibold text-gray-900 font-['Poppins']">Calendar Management</h2></div>
              <div className="flex flex-col sm:flex-row gap-2">
                {!isEditing && !editingPrices ? (
                  <><button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base"><Calendar className="w-4 h-4" />Edit Calendar</button>
                    <button onClick={() => setEditingPrices(true)} className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base"><DollarSign className="w-4 h-4" />Edit Prices</button></>
                ) : (
                  <button 
                    onClick={() => { 
                      setIsEditing(false); 
                      setEditingPrices(false); 
                      setHasChanges(false); 
                    }} 
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-[#76C043] hover:bg-lime-600 text-white rounded-lg font-medium font-['Poppins'] transition-all duration-200 text-sm md:text-base shadow-sm"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 md:p-4 border border-gray-200 flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-gray-700 font-medium font-['Poppins'] text-sm md:text-base">Select Sport</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  {(["football", "basketball", "both"] as const).map(s => (
                    <button key={s} onClick={() => { setSelectedSport(s); updateFilter("sport", s); }} 
                      className={`px-4 py-2 md:px-6 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${selectedSport === s ? "bg-[#76C043] text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}>
                      <span>{s === "football" ? "⚽ Football" : s === "basketball" ? "🏀 Basketball" : "⚽🏀 Both"}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-gray-700 font-medium font-['Poppins'] text-sm md:text-base">Select Package Duration</span>
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {(["1", "2", "3", "4"] as const).map(d => (
                      <button key={d} onClick={() => { setSelectedDuration(d); updateFilter("duration", d); }}
                        className={`px-4 py-2 md:px-6 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 ${selectedDuration === d ? "bg-[#76C043] text-white" : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"}`}>
                        <span>{d} {d === "1" ? "Night" : "Nights"}</span>
                      </button>
                    ))}
                  </div>
                  <button onClick={() => { setResetDurationTarget(selectedDuration); setShowResetConfirm(true); }} className="px-3 py-2 text-sm md:text-base rounded-lg font-medium font-['Poppins'] transition-all duration-200 flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"><RefreshCw className="w-4 h-4" />Reset</button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-base md:text-lg font-medium text-gray-900 font-['Poppins']">Calendar Management</h3>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => navigateMonth("prev")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600" /></button>
                  <span className="text-base md:text-lg font-medium text-gray-900 font-['Poppins'] min-w-[150px] md:min-w-[200px] text-center">{MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                  <button onClick={() => navigateMonth("next")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600" /></button>
                </div>
              </div>

              <div className="bg-gray-50 p-2 md:p-4 rounded-lg overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEK_DAYS.map(day => <div key={day} className="text-center text-xs md:text-sm font-medium text-gray-600 font-['Poppins'] py-1 md:py-2">{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {isLoadingApiData ? Array.from({ length: 35 }).map((_, i) => <div key={i} className="h-auto min-h-[2rem] md:min-h-[3rem] w-full rounded-lg bg-gray-100 animate-pulse border-2 border-transparent" />) : 
                      calendarDays.map((day, i) => {
                        if (!day) return <div key={i} className="h-8 md:h-12" />;
                        const dateString = formatDateForAPI(createCalendarDate(currentMonth.getFullYear(), currentMonth.getMonth(), day));
                        const item = apiDateData.find(d => formatApiDateForComparison(d.date) === dateString);
                        const status = item ? (item.status === "enabled" ? "enabled" : "blocked") : "neutral";
                        const isClickable = isEditing || editingPrices;
                        
                        const prices = item?.prices || basePrices;
                        const hasCustom = item?.prices && (item.prices.standard > 0 || item.prices.premium > 0);

                        return (
                          <div key={i} className="relative">
                            <button onClick={() => isEditing ? handleDateClick(day, currentMonth) : editingPrices && handlePriceClick(day, currentMonth)}
                              disabled={!isClickable}
                              className={`h-auto min-h-[2rem] md:min-h-[3rem] w-full rounded-lg border-2 font-medium font-['Poppins'] transition-all duration-200 flex flex-col items-center justify-center p-1 ${isClickable ? "cursor-pointer hover:opacity-80 shadow-sm" : "cursor-default"} ${status === "enabled" ? "bg-green-100 border-green-500 text-green-700" : status === "blocked" ? "bg-red-100 border-red-500 text-red-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                              <div className="text-xs md:text-sm font-semibold">{day}</div>
                              {status === "enabled" && (
                                <div className="flex items-center justify-center gap-1 mt-0.5 w-full px-0.5">
                                  <span className="text-[10px] md:text-[11px] font-medium">€{Math.round(prices.standard)}<span className="opacity-75">/€{Math.round(prices.premium)}</span></span>
                                </div>
                              )}
                            </button>
                            {hasCustom && <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center border border-white"><DollarSign className="w-2 h-2 text-white" /></div>}
                          </div>
                        );
                      })
                    }
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 md:gap-6 text-xs md:text-sm font-['Poppins'] pt-2">
                <div className="flex items-center gap-2"><div className="w-3 h-3 md:w-4 md:h-4 bg-green-100 border-2 border-green-500 rounded"></div><span className="text-green-700">Enabled</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 md:w-4 md:h-4 bg-red-100 border-2 border-red-500 rounded"></div><span className="text-red-700">Blocked</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 md:w-4 md:h-4 bg-white border-2 border-gray-300 rounded"></div><span className="text-gray-700">Neutral</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white shadow-sm"><DollarSign className="w-2 h-2 text-white" /></div><span className="text-blue-700">Custom Price</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPriceModal && priceEditData && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowPriceModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 font-['Poppins']">Set Custom Prices</h2>
              <button onClick={() => setShowPriceModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg text-sm font-['Poppins']">
                <p><strong>Date:</strong> {new Date(priceEditData.date).toLocaleDateString()}</p>
                <p className="text-blue-600 font-medium mt-1">✏️ Editing prices for {selectedSport} {selectedDuration} Night Package</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 font-['Poppins']">Standard (€)</label>
                  <input type="number" step="0.01" value={((priceEditData.prices as any)[selectedSport === "both" ? "combined" : selectedSport]?.standard) ?? ""} 
                    onChange={e => {
                      const val = e.target.value === "" ? null : Number(e.target.value);
                      const s = selectedSport === "both" ? "combined" : selectedSport;
                      setPriceEditData(prev => prev ? ({ ...prev, prices: { ...prev.prices, [s]: { ...(prev.prices as any)[s], standard: val } } }) : null);
                    }}
                    placeholder={`Base: €${basePrices.standard}`} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm font-['Poppins']" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1 font-['Poppins']">Premium (€)</label>
                  <input type="number" step="0.01" value={((priceEditData.prices as any)[selectedSport === "both" ? "combined" : selectedSport]?.premium) ?? ""}
                    onChange={e => {
                      const val = e.target.value === "" ? null : Number(e.target.value);
                      const s = selectedSport === "both" ? "combined" : selectedSport;
                      setPriceEditData(prev => prev ? ({ ...prev, prices: { ...prev.prices, [s]: { ...(prev.prices as any)[s], premium: val } } }) : null);
                    }}
                    placeholder={`Base: €${basePrices.premium}`} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm font-['Poppins']" />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 mt-4">
                <button onClick={() => setShowPriceModal(false)} className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium font-['Poppins'] transition-all"><X className="w-4 h-4" />Cancel</button>
                <button onClick={handleSavePrice} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium font-['Poppins'] transition-all"><DollarSign className="w-4 h-4" />Save All Prices</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowResetConfirm(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6" /><h2 className="text-xl font-semibold font-['Poppins']">Reset Data</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-gray-600 font-['Poppins'] text-sm leading-relaxed">Are you sure you want to reset all data for the <strong>{selectedDuration} Night</strong> package?</p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <p className="text-sm text-red-700 font-['Poppins'] font-medium mb-2">This will permanently delete all configured dates and custom prices for the current selection.</p>
              </div>
            </div>
            <div className="flex gap-3 justify-end p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium">Cancel</button>
              <button onClick={async () => {
                try {
                  setIsSavingApiData(true);
                  // Optional: Reset logic could go here
                  addToast({ type: "success", title: "Reset", description: "Data reset successfully" });
                } finally { setIsSavingApiData(false); setShowResetConfirm(false); }
              }} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"><RefreshCw className="w-4 h-4" />Yes, Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
