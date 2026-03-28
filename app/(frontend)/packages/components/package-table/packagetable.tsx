"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getStartingPrice,
  getComparisonFeatures,
  PackageItem,
  StartingPriceItem,
  Feature,
} from "../../../../../services/packageService";

interface PackageTableProps {
  initialPackages?: PackageItem[];
  initialStartingPrices?: {
    football: StartingPriceItem | null;
    basketball: StartingPriceItem | null;
    combined?: StartingPriceItem | null;
  };
  initialComparisonFeatures?: {
    football: Feature[];
    basketball: Feature[];
  };
}

export default function PackageTable({
  initialPackages = [],
  initialStartingPrices,
  initialComparisonFeatures,
}: PackageTableProps) {
  const [selectedSport, setSelectedSport] = useState<"football" | "basketball">(
    "football",
  );
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [startingPrices, setStartingPrices] = useState<{
    football: StartingPriceItem | null;
    basketball: StartingPriceItem | null;
    combined: StartingPriceItem | null;
  }>(
    initialStartingPrices
      ? {
          football: initialStartingPrices.football || null,
          basketball: initialStartingPrices.basketball || null,
          combined: initialStartingPrices.combined || null,
        }
      : {
          football: null,
          basketball: null,
          combined: null,
        },
  );

  const [loading, setLoading] = useState<boolean>(!initialStartingPrices);
  const [error, setError] = useState<string | null>(null);
  const [comparisonFeatures, setComparisonFeatures] = useState<{
    football: Feature[];
    basketball: Feature[];
  }>(
    initialComparisonFeatures || {
      football: [],
      basketball: [],
    },
  );


  // Fetch missing data from API
  useEffect(() => {
    // If we have all initial data, no need to fetch
    if (initialStartingPrices && initialComparisonFeatures) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Combined price call removed as per redundancy request
        const [
          footballPriceRes,
          basketballPriceRes,
          footballFeaturesRes,
          basketballFeaturesRes,
        ] = await Promise.all([
          getStartingPrice("football"),
          getStartingPrice("basketball"),
          getComparisonFeatures("football"),
          getComparisonFeatures("basketball"),
        ]);

        // Set starting prices (only if not provided)
        if (!initialStartingPrices) {
          const footballPrice = footballPriceRes.data?.[0] || null;
          const basketballPrice = basketballPriceRes.data?.[0] || null;

          setStartingPrices({
            football: footballPrice,
            basketball: basketballPrice,
            combined: null, // Removed combined
          });
        }

        // Fetch comparison features if they were not provided as initial data
        if (!initialComparisonFeatures) {
          setComparisonFeatures({
            football: footballFeaturesRes.data?.features || [],
            basketball: basketballFeaturesRes.data?.features || [],
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load table data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialStartingPrices, initialComparisonFeatures]);

  // Helper to get Price value
  const getPriceValue = (type: string, duration: number) => {
    const currentPrices = startingPrices[selectedSport];

    if (!currentPrices) return "-";

    const durationKey = String(duration) as "1" | "2" | "3" | "4";
    const priceEntry = currentPrices.pricesByDuration?.[durationKey];
    if (!priceEntry) return "-";

    const price =
      type === "standard"
        ? priceEntry.standard
        : type === "premium"
          ? priceEntry.premium
          : priceEntry.standard;

    return `Desde ${price}${getCurrencySymbol(currentPrices.currency)}`;
  };

  const getCurrencySymbol = (currency?: string) => {
    if (currency === "usd") return "$";
    if (currency === "gbp") return "£";
    return "€";
  };

  // Helper to format text with bold numbers
  const formatWithBoldNumbers = (text: string) => {
    if (!text) return text;
    const parts = text.split(/(\d+)/g);
    return parts.map((part, index) => {
      if (/^\d+$/.test(part)) {
        return <span key={index} className="font-bold">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="w-full py-12 md:py-24 bg-[#FCFEFB] inline-flex flex-col justify-start items-center gap-8 md:gap-12">
      <div className="flex flex-col justify-start items-center gap-6">
        <div className="flex flex-col justify-start items-center gap-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="flex flex-col justify-start items-center gap-2 md:gap-3">
              <div className="text-center justify-start text-zinc-950 text-2xl md:text-5xl font-semibold font-['Poppins'] leading-tight md:leading-[57.60px]">
                Tipos de packs disponibles
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="self-stretch flex flex-col justify-start items-center gap-6 w-full max-w-[1200px] mx-auto px-4">
        {/* Sport Switch Toggle */}
        <div className="flex items-center gap-6 select-none">
          <span
            className={`text-base md:text-lg font-['Poppins'] cursor-pointer transition-colors duration-300 ${
              selectedSport === "football"
                ? "text-[#011228] font-bold"
                : "text-zinc-400 font-medium"
            }`}
            onClick={() => setSelectedSport("football")}
          >
            Fútbol
          </span>

          <div
            className={`w-12 h-6 bg-[#76C043] rounded-full relative cursor-pointer shadow-inner transition-colors duration-300`}
            onClick={() =>
              setSelectedSport(
                selectedSport === "football" ? "basketball" : "football",
              )
            }
          >
            <div
              className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                selectedSport === "football" ? "translate-x-0" : "translate-x-6"
              }`}
            />
          </div>

          <span
            className={`text-base md:text-lg font-['Poppins'] cursor-pointer transition-colors duration-300 ${
              selectedSport === "basketball"
                ? "text-[#011228] font-bold"
                : "text-zinc-400 font-medium"
            }`}
            onClick={() => setSelectedSport("basketball")}
          >
            Basket
          </span>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-neutral-600 text-lg font-medium">Cargando packs...</div>
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center py-12 gap-4">
            <div className="text-red-600 text-lg font-medium">{error}</div>
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-lime-600 text-white rounded-lg hover:bg-lime-700 transition-colors">Intentar de nuevo</button>
          </div>
        ) : (
          <div className="w-full">
            {/* Mobile cards */}
            <div className="md:hidden w-full max-w-[1200px] mx-auto space-y-6 px-4">
              {["Standard", "Premium"].map((type) => (
                <div key={type} className="w-full rounded-2xl bg-white outline-[6px] outline-offset-[-6px] outline-green-50 shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex flex-col justify-center items-center">
                    <div className="text-zinc-950 text-lg font-bold font-['Poppins']">
                      {type === "Standard"
                        ? selectedSport === "football" ? "Estándar GoGame Kickoff" : "Estándar GoGame Slam"
                        : selectedSport === "football" ? "Premium GoGame Legend" : "Premium GoGame MVP"}
                    </div>
                    <div className="inline-flex px-2 py-1.5 bg-[#F1F9EC] rounded-4xl outline-1 outline-offset-[-1px] outline-[#76C043] items-center justify-center gap-2.5 mt-2">
                      <span className="text-[#76C043] text-xs font-medium font-['Poppins']">
                        {type === "Standard" ? "Pack Estándar" : "Pack Premium"}
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {(comparisonFeatures[selectedSport] || []).map((feature, fIdx) => (
                      <div key={fIdx} className={`px-4 py-3 flex flex-col justify-center items-center gap-3 ${fIdx % 2 !== 0 ? "bg-gray-50/30" : "bg-white"}`}>
                        <div className="text-[#76C043] text-sm font-bold font-['Poppins'] uppercase tracking-wider">{feature.category}</div>
                        <div className="text-sm text-neutral-800 font-['Poppins'] leading-relaxed text-center">
                          {formatWithBoldNumbers(type.toLowerCase() === "standard" ? feature.standard : feature.premium)}
                        </div>
                      </div>
                    ))}
                    <div className="px-4 py-3 flex items-start gap-3 bg-green-50/30">
                      <div className="flex-1 flex flex-col items-center justify-center text-neutral-900 text-sm font-normal font-['Poppins']">
                        <div className="text-xs text-neutral-500 mb-1">Precio</div>
                        <span className="font-bold text-lg text-[#76C043]">
                          {getPriceValue(type.toLowerCase(), 1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block w-full max-w-[1200px] mx-auto my-8">
              <div className="overflow-x-auto rounded outline-[6px] outline-offset-[-6px] outline-green-50 bg-white border border-slate-100">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="w-56 md:w-96 p-6 text-center text-neutral-800 text-lg md:text-2xl font-bold font-['Poppins'] whitespace-nowrap leading-loose border-r border-slate-200">
                        <p>Compara nuestros packs</p>
                      </th>
                      {["Standard", "Premium"].map((type, idx) => (
                        <th key={type} className={`w-56 md:w-96 p-3 md:p-6 bg-white align-top text-center ${idx < 1 ? "border-r border-slate-200" : ""}`}>
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-lg md:text-2xl font-bold font-['Poppins'] text-zinc-950">
                              {type === "Standard"
                                ? selectedSport === "football" ? "Estándar GoGame Kickoff" : "Estándar GoGame Slam"
                                : selectedSport === "football" ? "Premium GoGame Legend" : "Premium GoGame MVP"}
                            </span>
                            <div className="inline-flex px-2 md:px-3 py-1.5 md:py-2 bg-[#F1F9EC] rounded-4xl outline-1 outline-offset-[-1px] outline-[#76C043] items-center justify-center gap-2.5 mt-2">
                              <span className="text-[#76C043] text-xs md:text-sm font-medium font-['Poppins']">
                                {type === "Standard" ? "Pack Estándar" : "Pack Premium"}
                              </span>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(comparisonFeatures[selectedSport] || []).map((feature, fIdx) => (
                      <tr key={fIdx}>
                        <th className={`w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-base md:text-lg font-medium font-['Poppins'] text-neutral-800 text-left align-middle border-r ${fIdx % 2 !== 0 ? "bg-gray-50/50" : "bg-white"}`}>
                          {feature.category}
                        </th>
                        {["standard", "premium"].map((type, idx) => (
                          <td key={type} className={`w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 align-top ${idx < 1 ? "border-r border-slate-200" : ""} ${fIdx % 2 !== 0 ? "bg-gray-50/50" : "bg-white"}`}>
                            <div className="text-sm md:text-base text-neutral-800 font-['Poppins'] leading-relaxed">
                              {formatWithBoldNumbers(type === "standard" ? feature.standard : feature.premium)}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr>
                      <th className="w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-base md:text-lg font-medium font-['Poppins'] text-neutral-800 text-left bg-[#F1F9EC] align-middle border-r">
                        Precio
                      </th>
                      {["standard", "premium"].map((type, idx) => (
                        <td key={type} className={`w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-sm md:text-base font-normal font-['Poppins'] text-neutral-800 bg-[#F1F9EC] align-middle ${idx < 1 ? "border-r border-slate-200" : ""}`}>
                          <div className="flex items-center gap-2 justify-center md:justify-start">
                            <span className="font-bold text-lg text-[#76C043]">
                              {getPriceValue(type, 1)}
                            </span>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <Link href="/book">
        <div className="w-44 px-4 py-2.5 bg-[#76C043] hover:bg-lime-600 rounded-[999px] inline-flex justify-center items-center gap-2.5 cursor-pointer transition-all shadow-lg shadow-green-100 hover:shadow-xl hover:shadow-green-200">
          <div className="text-center justify-start text-white text-lg font-normal font-['Inter'] leading-7">
            Reserva ahora
          </div>
        </div>
      </Link>
    </div>
  );
}
