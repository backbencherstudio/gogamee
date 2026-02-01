"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllPackages,
  getStartingPrice,
  PackageItem,
  StartingPriceItem,
} from "../../../../../services/packageService";
import { useLanguage } from "../../../../context/LanguageContext";
import { TranslatedText } from "../../../_components/TranslatedText";

interface PackageTableProps {
  initialPackages?: PackageItem[];
  initialStartingPrices?: {
    football: StartingPriceItem | null;
    basketball: StartingPriceItem | null;
  };
}

export default function PackageTable({
  initialPackages = [],
  initialStartingPrices,
}: PackageTableProps) {
  const { language, translateText } = useLanguage();
  const [selectedSport, setSelectedSport] = useState<"football" | "basketball">(
    "football",
  );
  // const [selectedDuration, setSelectedDuration] = useState<1 | 2 | 3 | 4>(1); // Removed duration filter state
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [translatedPackages, setTranslatedPackages] = useState<PackageItem[]>(
    [],
  );
  const [startingPrices, setStartingPrices] = useState<{
    football: StartingPriceItem | null;
    basketball: StartingPriceItem | null;
  }>(
    initialStartingPrices || {
      football: null,
      basketball: null,
    },
  );

  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const [loading, setLoading] = useState<boolean>(!initialPackages.length);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages, sports, and starting prices from API
  useEffect(() => {
    if (initialPackages.length > 0 && initialStartingPrices) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch packages for selected sport (excluding Starting Price packages)
        const response = await getAllPackages(selectedSport);

        if (response && response.success && Array.isArray(response.data)) {
          // Filter out Starting Price packages
          const filteredPackages = response.data.filter(
            (pkg) => pkg.included !== "Starting Price",
          );
          setPackages(filteredPackages);
        } else {
          // Fallback for legacy response if applicable, or error
          // Assuming new ApiResponse structure always
          if (Array.isArray(response)) {
            // Legacy support just in case
            const filteredPackages = (response as any[]).filter(
              (pkg) => pkg.included !== "Starting Price",
            );
            setPackages(filteredPackages);
          } else {
            setError("Failed to fetch packages");
          }
        }
        // Fetch starting prices (only if not provided)
        if (!initialStartingPrices) {
          const [footballPriceRes, basketballPriceRes] = await Promise.all([
            getStartingPrice("football"),
            getStartingPrice("basketball"),
          ]);

          if (footballPriceRes.success && basketballPriceRes.success) {
            const footballPrice = footballPriceRes.data?.[0] || null;
            const basketballPrice = basketballPriceRes.data?.[0] || null;
            setStartingPrices({
              football: footballPrice,
              basketball: basketballPrice,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load packages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (initialPackages.length === 0) {
      fetchData();
    }
  }, [selectedSport, initialPackages, initialStartingPrices]);

  // Handle language switching locally using DB fields
  useEffect(() => {
    if (language === "es") {
      // Map packages to use Spanish fields if available, otherwise fallback to English
      const spanishPackages = packages.map((pkg) => ({
        ...pkg,
        included: pkg.included_es || pkg.included,
        description: pkg.description_es || pkg.description,
      }));
      setTranslatedPackages(spanishPackages);
    } else {
      // Use original packages (English)
      setTranslatedPackages(packages);
    }
  }, [language, packages]);

  // Helper functions that now accept duration as argument
  // const getUniqueFeaturesForDuration = (duration: number) => { ... } // Removed unused helper

  const getFilteredPackagesForDuration = (duration: number) => {
    return translatedPackages.filter(
      (pkg) => pkg.sport === selectedSport && pkg.duration === duration,
    );
  };

  // Helper to get Price value
  const getPriceValue = (type: string, duration: number) => {
    const currentPrices = startingPrices[selectedSport];
    if (!currentPrices) return "";

    const durationKey = String(duration) as "1" | "2" | "3" | "4";
    const priceEntry = currentPrices.pricesByDuration?.[durationKey];
    if (!priceEntry) return "";

    if (type.toLowerCase() === "combined") return "-";

    const price =
      type === "standard" ? priceEntry.standard : priceEntry.premium;
    const fromLabel = language === "en" ? "From " : "Desde ";
    return `${fromLabel}${price}${getCurrencySymbol(currentPrices.currency)}`;
  };

  // Helper to get all packages (features) for a specific plan and duration
  const getPackagesForPlan = (type: string, duration: number) => {
    return translatedPackages.filter(
      (pkg) =>
        pkg.sport === selectedSport &&
        pkg.duration === duration &&
        pkg.plan === type.toLowerCase(),
    );
  };

  // Helper to format text with bold numbers
  const formatWithBoldNumbers = (text: string) => {
    if (!text) return text;

    // Split text by numbers and format them as bold
    const parts = text.split(/(\d+)/g);
    return parts.map((part, index) => {
      // Check if the part is a number
      if (/^\d+$/.test(part)) {
        return (
          <span key={index} className="font-bold">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const getCurrencySymbol = (currency?: string) => {
    if (currency === "usd") return "$";
    if (currency === "gbp") return "£";
    return "€";
  };

  return (
    <div className="w-full  py-12 md:py-24 bg-[#FCFEFB] inline-flex flex-col justify-start items-center gap-8 md:gap-12">
      <div className="flex flex-col justify-start items-center gap-6">
        <div className="flex flex-col justify-start items-center gap-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="flex flex-col justify-start items-center gap-2 md:gap-3">
              <div className="text-center justify-start text-zinc-950 text-2xl md:text-5xl font-semibold font-['Poppins'] leading-tight md:leading-[57.60px]">
                <TranslatedText
                  text="Tipos de packs disponibles"
                  english="Types of packs offered"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="inline-flex justify-start items-center gap-4 md:gap-5">
          <button
            type="button"
            className={`justify-start text-base md:text-lg font-['Poppins'] leading-loose focus:outline-none transition-colors duration-150 cursor-pointer ${selectedSport === "football" ? "text-neutral-800 font-medium" : "text-zinc-500 font-normal"}`}
            onClick={() => setSelectedSport("football")}
            aria-pressed={selectedSport === "football"}
            disabled={loading}
          >
            <TranslatedText text="Fútbol" english="Football" />
          </button>
          <button
            type="button"
            aria-label="Toggle sport"
            data-pressed={selectedSport === "basketball"}
            data-size="lg"
            data-state="Default"
            className={`w-11 h-6 p-0.5 bg-[#76C043] rounded-xl flex ${selectedSport === "basketball" ? "justify-end" : "justify-start"} items-center overflow-hidden cursor-pointer focus:outline-none transition-all duration-150 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() =>
              setSelectedSport(
                selectedSport === "football" ? "basketball" : "football",
              )
            }
            disabled={loading}
          >
            <span className="w-5 h-5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] block transition-transform duration-150" />
          </button>
          <button
            type="button"
            className={`justify-start text-base md:text-lg font-['Poppins'] leading-loose focus:outline-none transition-colors duration-150 cursor-pointer ${selectedSport === "basketball" ? "text-neutral-800 font-medium" : "text-zinc-500 font-normal"}`}
            onClick={() => setSelectedSport("basketball")}
            aria-pressed={selectedSport === "basketball"}
            disabled={loading}
          >
            <TranslatedText text="Basket" english="Basketball" />
          </button>
        </div>

        {/* Duration Selection Removed - showing all tables */}
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="self-stretch">
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-neutral-600 text-lg font-medium">
                Loading packages...
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col justify-center items-center py-12 gap-4">
              <div className="text-red-600 text-lg font-medium">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : translatedPackages.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-neutral-600 text-lg font-medium">
                No packages available for {selectedSport}.
              </div>
            </div>
          ) : (
            <>
              {([1, 2, 3, 4] as const).map((duration) => {
                // const durationFeatures = getUniqueFeaturesForDuration(duration); // Removed unused variable
                const hasPackages =
                  getFilteredPackagesForDuration(duration).length > 0;

                return (
                  <div key={duration} className="w-full mb-12">
                    {/* Duration Header */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl md:text-2xl font-bold text-[#76C043]">
                        {duration}{" "}
                        <TranslatedText text="Noches" english="Nights" />
                      </h3>
                    </div>

                    {/* Mobile cards (only on small screens) */}
                    <div className="md:hidden w-full max-w-[1200px] mx-auto space-y-6 px-4">
                      {["Standard", "Premium", "Combined"].map((type) => (
                        <div
                          key={type}
                          className="w-full rounded-2xl bg-white outline-[6px] outline-offset-[-6px] outline-green-50"
                        >
                          <div className="p-4 border-b border-slate-200">
                            <div className="inline-flex px-2 py-1.5 bg-[#F1F9EC] rounded-4xl outline-1 outline-offset-[-1px] outline-[#76C043] items-center justify-center gap-2.5 mb-1">
                              <span className="text-[#76C043] text-xs font-medium font-['Poppins']">
                                <TranslatedText
                                  text={
                                    type === "Standard"
                                      ? "Pack Estándar"
                                      : "Pack Premium"
                                  }
                                  english={`${type} pack`}
                                />
                              </span>
                            </div>
                            <div className="text-zinc-950 text-lg font-bold font-['Poppins']">
                              <TranslatedText
                                text={
                                  type === "Standard"
                                    ? selectedSport === "football"
                                      ? "Estándar GoGame Kickoff"
                                      : "Estándar GoGame Slam"
                                    : type === "Premium"
                                      ? selectedSport === "football"
                                        ? "Premium GoGame Legend"
                                        : "Premium GoGame MVP"
                                      : "Pack Combinado" // Fallback for Combined
                                }
                                english={
                                  type === "Standard"
                                    ? selectedSport === "football"
                                      ? "Standard GoGame Kickoff"
                                      : "Standard GoGame Slam"
                                    : type === "Premium"
                                      ? selectedSport === "football"
                                        ? "Premium GoGame Legend"
                                        : "Premium GoGame MVP"
                                      : "Combined Pack" // Fallback for Combined
                                }
                              />
                            </div>
                          </div>
                          <div className="divide-y divide-slate-200">
                            {/* Duration Row */}
                            <div className="px-4 py-3 flex items-start gap-3 bg-gray-50/50">
                              <div className="min-w-[140px] text-neutral-600 text-sm font-medium font-['Poppins']">
                                <TranslatedText
                                  text="Duración"
                                  english="Duration"
                                />
                              </div>
                              <div className="flex-1 text-neutral-900 text-sm font-bold font-['Poppins']">
                                {duration}{" "}
                                <TranslatedText
                                  text="Noches"
                                  english="Nights"
                                />
                              </div>
                            </div>

                            {/* Included Features List (Mobile) */}
                            <div className="px-4 py-3 flex flex-col gap-3 bg-white">
                              <div className="text-[#76C043] text-sm font-bold font-['Poppins'] uppercase tracking-wider">
                                <TranslatedText
                                  text="Qué incluye"
                                  english="Included"
                                />
                              </div>
                              <p className="text-sm text-neutral-800 font-['Poppins'] leading-relaxed">
                                {getPackagesForPlan(type, duration).length > 0
                                  ? getPackagesForPlan(type, duration)
                                      .map((pkg) => pkg.included)
                                      .filter(Boolean)
                                      .join(", ")
                                  : null}
                                {getPackagesForPlan(type, duration).length ===
                                  0 && (
                                  <span className="text-neutral-400 italic">
                                    <TranslatedText
                                      text="Sin características incluidas"
                                      english="No features included"
                                    />
                                  </span>
                                )}
                              </p>
                            </div>

                            {/* Price Row */}
                            <div className="px-4 py-3 flex items-start gap-3 bg-green-50/30">
                              <div className="min-w-[140px] text-neutral-600 text-sm font-medium font-['Poppins']">
                                <TranslatedText
                                  text="Precio"
                                  english="Starting Price"
                                />
                              </div>
                              <div className="flex-1 text-neutral-900 text-sm font-normal font-['Poppins']">
                                <>
                                  <span className="font-normal">
                                    <TranslatedText
                                      text="Desde "
                                      english="From "
                                    />
                                  </span>
                                  <span className="font-bold text-lg text-[#76C043]">
                                    {getPriceValue(
                                      type.toLowerCase(),
                                      duration,
                                    ).replace(/^(From|Desde)\s*/, "")}
                                  </span>
                                </>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop table (md and up) */}
                    <div className="hidden md:block w-full max-w-[1200px] mx-auto my-8">
                      <div className="overflow-x-auto rounded outline-[6px] outline-offset-[-6px] outline-green-50 bg-white">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="md:w-96 border-b border-slate-200">
                              <th className="w-56 md:w-96 self-stretch text-start  pl-3 md:pl-6 text-neutral-800 text-lg md:text-3xl font-bold font-['Poppins'] whitespace-nowrap leading-loose border-r border-slate-200">
                                <TranslatedText
                                  text="Compara nuestros packs"
                                  english="Compare packs"
                                />
                              </th>
                              {["Standard", "Premium", "Combined"].map(
                                (type, idx) => (
                                  <th
                                    key={type}
                                    className={`w-56 md:w-96 p-3 md:p-6 bg-white align-top text-center ${idx < 2 ? "border-r border-slate-200" : ""}`}
                                  >
                                    <div className="flex flex-col items-center gap-2">
                                      <div
                                        className={`inline-flex px-2 md:px-3 py-1.5 md:py-2 bg-[#F1F9EC] rounded-4xl outline-1 outline-offset-[-1px] outline-[#76C043] items-center justify-center gap-2.5 mb-1`}
                                      >
                                        <span
                                          className={`text-[#76C043] text-xs md:text-sm font-medium font-['Poppins'] flex items-center justify-center`}
                                        >
                                          <TranslatedText
                                            text={
                                              type === "Standard"
                                                ? "Pack Estándar"
                                                : "Pack Premium"
                                            }
                                            english={`${type} pack`}
                                          />
                                        </span>
                                      </div>
                                      <span className="text-lg md:text-2xl font-bold font-['Poppins'] text-zinc-950">
                                        <TranslatedText
                                          text={
                                            type === "Standard"
                                              ? selectedSport === "football"
                                                ? "Estándar GoGame Kickoff"
                                                : "Estándar GoGame Slam"
                                              : selectedSport === "football"
                                                ? selectedSport === "football"
                                                  ? "Premium GoGame Legend"
                                                  : "Premium GoGame MVP"
                                                : "Pack Combinado"
                                          }
                                          english={
                                            type === "Standard"
                                              ? selectedSport === "football"
                                                ? "Standard GoGame Kickoff"
                                                : "Standard GoGame Slam"
                                              : type === "Premium"
                                                ? selectedSport === "football"
                                                  ? "Premium GoGame Legend"
                                                  : "Premium GoGame MVP"
                                                : "Combined Pack"
                                          }
                                        />
                                      </span>
                                    </div>
                                  </th>
                                ),
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {/* Duration Row */}
                            <tr>
                              <th className="w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-base md:text-lg font-medium font-['Poppins'] text-neutral-800 text-left bg-gray-50/50 align-middle border-r">
                                <TranslatedText
                                  text="Duración"
                                  english="Duration"
                                />
                              </th>
                              {["standard", "premium", "combined"].map(
                                (type, idx) => (
                                  <td
                                    key={type}
                                    className={`w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-sm md:text-base font-bold font-['Poppins'] text-neutral-800 bg-gray-50/50 align-middle ${idx < 2 ? "border-r border-slate-200" : ""}`}
                                  >
                                    {duration}{" "}
                                    <TranslatedText
                                      text="Noches"
                                      english="Nights"
                                    />
                                  </td>
                                ),
                              )}
                            </tr>

                            {/* Included Row with List */}
                            <tr>
                              <th className="w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-base md:text-lg font-medium font-['Poppins'] text-neutral-800 text-left align-middle border-r">
                                <TranslatedText
                                  text="Qué incluye"
                                  english="Included"
                                />
                              </th>
                              {["standard", "premium", "combined"].map(
                                (type, idx) => {
                                  const packagesForPlan = getPackagesForPlan(
                                    type,
                                    duration,
                                  );

                                  return (
                                    <td
                                      key={type}
                                      className={`w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 bg-white align-top ${idx < 2 ? "border-r border-slate-200" : ""}`}
                                    >
                                      <p className="text-sm md:text-base text-neutral-800 font-['Poppins'] leading-relaxed">
                                        {packagesForPlan.length > 0 ? (
                                          packagesForPlan
                                            .map((pkg) => pkg.included)
                                            .filter(Boolean)
                                            .join(", ")
                                        ) : (
                                          <span className="text-neutral-400 italic">
                                            <TranslatedText
                                              text="Sin características incluidas"
                                              english="No features included"
                                            />
                                          </span>
                                        )}
                                      </p>
                                    </td>
                                  );
                                },
                              )}
                            </tr>

                            {/* Price Row */}
                            <tr>
                              <th className="w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-base md:text-lg font-medium font-['Poppins'] text-neutral-800 text-left bg-[#F1F9EC] align-middle border-r">
                                <TranslatedText
                                  text="Precio"
                                  english="Starting Price"
                                />
                              </th>
                              {["standard", "premium", "combined"].map(
                                (type, idx) => (
                                  <td
                                    key={type}
                                    className={`w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-sm md:text-base font-normal font-['Poppins'] text-neutral-800 bg-[#F1F9EC] align-middle ${idx < 2 ? "border-r border-slate-200" : ""}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-normal">
                                        <TranslatedText
                                          text="Desde "
                                          english="From "
                                        />
                                      </span>
                                      <span className="font-bold text-lg text-[#76C043]">
                                        {getPriceValue(type, duration).replace(
                                          /^(From|Desde)\s*/,
                                          "",
                                        )}
                                      </span>
                                    </div>
                                  </td>
                                ),
                              )}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
      <Link href="/book">
        <div className="w-44 px-4 py-2.5 bg-[#76C043] hover:bg-lime-600 rounded-[999px] inline-flex justify-center items-center gap-2.5 cursor-pointer transition-all">
          <div className="text-center justify-start text-white text-lg font-normal font-['Inter'] leading-7">
            <TranslatedText text="Reserva ahora" english="Book Now" />
          </div>
        </div>
      </Link>
    </div>
  );
}
