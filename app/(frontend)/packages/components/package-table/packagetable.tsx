'use client'
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllPackages, getAvailableSports, PackageItem } from "../../../../../services/packageService";

export default function PackageTable() {
  const [selectedSport, setSelectedSport] = useState<'football' | 'basketball'>('football');
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [availableSports, setAvailableSports] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch packages and sports from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch available sports
        const sportsResponse = await getAvailableSports();
        if (sportsResponse.success) {
          setAvailableSports(sportsResponse.data);
        }

        // Fetch packages for selected sport
        const packagesResponse = await getAllPackages(selectedSport);
        if (packagesResponse.success && packagesResponse.list) {
          setPackages(packagesResponse.list);
        } else {
          setError('Failed to fetch packages');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load packages. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSport]);

  // Filter packages by selected sport
  const filteredPackages = packages.filter(pkg => pkg.sport === selectedSport);

  // Extract features (row labels) from the filtered packages
  const features = filteredPackages.map((item) => item.category);

  // Helper to get value for a feature and type
  const getValue = (feature: string, type: 'standard' | 'premium') => {
    const found = filteredPackages.find((item) => item.category === feature);
    return found ? found[type] : '';
  };

  // Helper to format text with bold numbers
  const formatWithBoldNumbers = (text: string) => {
    if (!text) return text;
    
    // Split text by numbers and format them as bold
    const parts = text.split(/(\d+)/g);
    return parts.map((part, index) => {
      // Check if the part is a number
      if (/^\d+$/.test(part)) {
        return <span key={index} className="font-bold">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="w-full  py-12 md:py-24 bg-[#FCFEFB] inline-flex flex-col justify-start items-center gap-8 md:gap-12">
      <div className="flex flex-col justify-start items-center gap-6">
        <div className="flex flex-col justify-start items-center gap-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="flex flex-col justify-start items-center gap-2 md:gap-3">
              <div className="text-center justify-start text-zinc-950 text-2xl md:text-5xl font-semibold font-['Poppins'] leading-tight md:leading-[57.60px]">Types of packs offered</div>
            </div>
          </div>
        </div>
        <div className="inline-flex justify-start items-center gap-4 md:gap-5">
          <button
            type="button"
            className={`justify-start text-base md:text-lg font-['Poppins'] leading-loose focus:outline-none transition-colors duration-150 cursor-pointer ${selectedSport === 'football' ? 'text-neutral-800 font-medium' : 'text-zinc-500 font-normal'}`}
            onClick={() => setSelectedSport('football')}
            aria-pressed={selectedSport === 'football'}
            disabled={loading}
          >
            Football
          </button>
          <button
            type="button"
            aria-label="Toggle sport"
            data-pressed={selectedSport === 'basketball'}
            data-size="lg"
            data-state="Default"
            className={`w-11 h-6 p-0.5 bg-[#76C043] rounded-xl flex ${selectedSport === 'basketball' ? 'justify-end' : 'justify-start'} items-center overflow-hidden cursor-pointer focus:outline-none transition-all duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => setSelectedSport(selectedSport === 'football' ? 'basketball' : 'football')}
            disabled={loading}
          >
            <span className="w-5 h-5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] block transition-transform duration-150" />
          </button>
          <button
            type="button"
            className={`justify-start text-base md:text-lg font-['Poppins'] leading-loose focus:outline-none transition-colors duration-150 cursor-pointer ${selectedSport === 'basketball' ? 'text-neutral-800 font-medium' : 'text-zinc-500 font-normal'}`}
            onClick={() => setSelectedSport('basketball')}
            aria-pressed={selectedSport === 'basketball'}
            disabled={loading}
          >
            Basketball
          </button>
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="self-stretch">
          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-neutral-600 text-lg font-medium">Loading packages...</div>
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
          ) : filteredPackages.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-neutral-600 text-lg font-medium">No packages available for {selectedSport}.</div>
            </div>
          ) : (
            <>
              {/* Mobile cards (only on small screens) */}
              <div className="md:hidden w-full max-w-[1200px] mx-auto my-6 space-y-6 px-4">
                {["Standard", "Premium"].map((type) => (
              <div key={type} className="w-full rounded-2xl bg-white outline-[6px] outline-offset-[-6px] outline-green-50">
                <div className="p-4 border-b border-slate-200">
                  <div className="inline-flex px-2 py-1.5 bg-[#F1F9EC] rounded-4xl outline-1 outline-offset-[-1px] outline-[#76C043] items-center justify-center gap-2.5 mb-1">
                    <span className="text-[#76C043] text-xs font-medium font-['Poppins']">{type} pack</span>
                  </div>
                  <div className="text-zinc-950 text-lg font-bold font-['Poppins']">
                    {type === 'Standard' ? (selectedSport === 'football' ? 'Standard GoGame Kickoff' : 'Standard GoGame Slam') : (selectedSport === 'football' ? 'Premium GoGame Legend' : 'Premium GoGame MVP')}
                  </div>
                </div>
                <div className="divide-y divide-slate-200">
                  {features.map((feature) => (
                    <div key={feature} className="px-4 py-3 flex items-start gap-3">
                      <div className="min-w-[140px] text-neutral-600 text-sm font-medium font-['Poppins']">{feature}</div>
                      <div className="flex-1 text-neutral-900 text-sm font-normal font-['Poppins']">
                        {feature === 'Starting Price' ? (
                          <>
                            <span className="font-normal">From </span>
                            <span className="font-bold">{getValue(feature, (type.toLowerCase() as 'standard' | 'premium')).replace('From ', '')}</span>
                          </>
                        ) : (
                          formatWithBoldNumbers(getValue(feature, (type.toLowerCase() as 'standard' | 'premium')))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table (md and up) */}
          {/* --- Table starts here, do not edit below this line --- */}
          <div className="hidden md:block w-full max-w-[1200px] mx-auto my-8 md:my-12">
            <div className="overflow-x-auto rounded outline-[6px] outline-offset-[-6px] outline-green-50 bg-white">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="md:w-96 border-b border-slate-200">
                    <th className="w-56 md:w-96 self-stretch text-start  pl-3 md:pl-6 text-neutral-800 text-lg md:text-3xl font-bold font-['Poppins'] whitespace-nowrap leading-loose border-r border-slate-200">
                      Compare packs
                    </th>
                    {["Standard", "Premium"].map((type, idx) => (
                      <th
                        key={type}
                        className={`w-56 md:w-96 p-3 md:p-6 bg-white align-bottom ${idx < 1 ? 'border-r border-slate-200' : ''}`}
                      >
                        <div className="flex flex-col items-start gap-2">
                          <div
                            className={`inline-flex px-2 md:px-3 py-1.5 md:py-2 bg-[#F1F9EC] rounded-4xl outline-1 outline-offset-[-1px] outline-[#76C043] items-center justify-center gap-2.5 mb-1`}
                          >
                            <span className={`text-[#76C043] text-xs md:text-sm font-medium font-['Poppins'] flex items-center justify-center`}>
                              {type} pack
                            </span>
                          </div>
                          <span className="text-lg md:text-2xl font-bold font-['Poppins'] text-zinc-950">
                            {type === 'Standard' ? (selectedSport === 'football' ? 'Standard GoGame Kickoff' : 'Standard GoGame Slam') : (selectedSport === 'football' ? 'Premium GoGame Legend' : 'Premium GoGame MVP')}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {features.map((feature) => (
                    <tr key={feature}>
                      <th className="w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-base md:text-lg font-medium font-['Poppins'] text-neutral-800 text-left bg-white align-middle border-r ">
                        {feature}
                      </th>
                      {["standard", "premium"].map((type, idx) => (
                        <td
                          key={type}
                          className={`w-56 md:w-96 p-3 md:p-6 border-b border-slate-200 text-sm md:text-base font-normal font-['Poppins'] text-neutral-800 bg-white align-middle ${idx < 1 ? 'border-r border-slate-200' : ''}`}
                        >
                          {feature === 'Starting Price' ? (
                            <>
                              <span className="font-normal">From </span>
                              <span className="font-bold">{getValue(feature, type as 'standard' | 'premium').replace('From ', '')}</span>
                            </>
                          ) : (
                            formatWithBoldNumbers(getValue(feature, type as 'standard' | 'premium'))
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
              {/* --- Table ends here, do not edit above this line --- */}
            </>
          )}
        </div>
      </div>
      <Link href="/book">
        <div className="w-44 px-4 py-2.5 bg-[#76C043] hover:bg-lime-600 rounded-[999px] inline-flex justify-center items-center gap-2.5 cursor-pointer transition-all">
          <div className="text-center justify-start text-white text-lg font-normal font-['Inter'] leading-7">Book Now</div>
        </div>
      </Link>
    </div>
  );
}
