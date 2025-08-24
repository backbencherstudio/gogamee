'use client'
import React, { useState } from "react";
import Link from "next/link";
import { travelPackages } from "../../../../lib/appdata";

export default function PackageTable() {
  const [selectedSport, setSelectedSport] = useState<'football' | 'basketball'>('football');

  // Filter packages by selected sport
  const filteredPackages = travelPackages.filter(pkg => pkg.sport === selectedSport);

  // Extract features (row labels) from the filtered packages
  const features = filteredPackages.map((item) => item.category);

  // Helper to get value for a feature and type
  const getValue = (feature: string, type: 'standard' | 'premium') => {
    const found = filteredPackages.find((item) => item.category === feature);
    return found ? found[type] : '';
  };

  return (
    <div className="w-full  py-24 bg-[#FCFEFB] inline-flex flex-col justify-start items-center gap-12">
      <div className="flex flex-col justify-start items-center gap-6">
        <div className="flex flex-col justify-start items-center gap-12">
          <div className="flex flex-col justify-start items-center gap-4">
            <div className="flex flex-col justify-start items-center gap-3">
              <div className="text-center justify-start text-zinc-950 text-5xl font-semibold font-['Poppins'] leading-[57.60px]">Types of packs offered</div>
            </div>
          </div>
        </div>
        <div className="inline-flex justify-start items-center gap-5">
          <button
            type="button"
            className={`justify-start text-lg font-['Poppins'] leading-loose focus:outline-none transition-colors duration-150 cursor-pointer ${selectedSport === 'football' ? 'text-neutral-800 font-medium' : 'text-zinc-500 font-normal'}`}
            onClick={() => setSelectedSport('football')}
            aria-pressed={selectedSport === 'football'}
          >
            Football
          </button>
          <button
            type="button"
            aria-label="Toggle sport"
            data-pressed={selectedSport === 'basketball'}
            data-size="lg"
            data-state="Default"
            className={`w-11 h-6 p-0.5 bg-[#76C043] rounded-xl flex ${selectedSport === 'basketball' ? 'justify-end' : 'justify-start'} items-center overflow-hidden cursor-pointer focus:outline-none transition-all duration-150`}
            onClick={() => setSelectedSport(selectedSport === 'football' ? 'basketball' : 'football')}
          >
            <span className="w-5 h-5 bg-white rounded-full shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] shadow-[0px_1px_3px_0px_rgba(16,24,40,0.10)] block transition-transform duration-150" />
          </button>
          <button
            type="button"
            className={`justify-start text-lg font-['Poppins'] leading-loose focus:outline-none transition-colors duration-150 cursor-pointer ${selectedSport === 'basketball' ? 'text-neutral-800 font-medium' : 'text-zinc-500 font-normal'}`}
            onClick={() => setSelectedSport('basketball')}
            aria-pressed={selectedSport === 'basketball'}
          >
            Basketball
          </button>
        </div>
      </div>
      <div className="self-stretch flex flex-col justify-start items-start gap-6">
        <div className="self-stretch">
          {/* --- Table starts here, do not edit below this line --- */}
          <div className="w-full max-w-[1200px] mx-auto my-12">
            <div className="overflow-x-auto rounded outline-[6px] outline-offset-[-6px] outline-green-50 bg-white">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="w-96 border-b border-slate-200">
                    <th className="w-96 self-stretch text-start  pl-6 text-neutral-800 text-3xl font-bold font-['Poppins'] whitespace-nowrap leading-loose border-r border-slate-200">
                      Compare packs
                    </th>
                    {["Standard", "Premium"].map((type, idx) => (
                      <th
                        key={type}
                        className={`w-96 p-6 bg-white align-bottom ${idx < 1 ? 'border-r border-slate-200' : ''}`}
                      >
                        <div className="flex flex-col items-start gap-2">
                          <div
                            className={`inline-block px-3 py-2 bg-[#F1F9EC] rounded-4xl outline-1 outline-offset-[-1px] outline-[#76C043] flex items-center justify-center gap-2.5 mb-1`}
                          >
                            <span className={`text-[#76C043] text-sm font-medium font-['Poppins'] flex items-center justify-center`}>
                              {type} pack
                            </span>
                          </div>
                          <span className="text-2xl font-bold font-['Poppins'] text-zinc-950">
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
                      <th className="w-96 p-6 border-b border-slate-200 text-lg font-medium font-['Poppins'] text-neutral-800 text-left bg-white align-middle border-r ">
                        {feature}
                      </th>
                      {["standard", "premium"].map((type, idx) => (
                        <td
                          key={type}
                          className={`w-96 p-6 border-b border-slate-200 text-base font-normal font-['Poppins'] text-neutral-800 bg-white align-middle ${idx < 1 ? 'border-r border-slate-200' : ''}`}
                        >
                          {feature === 'Starting Price' ? (
                            <>
                              <span className="font-normal">From </span>
                              <span className="font-semibold">{getValue(feature, type as 'standard' | 'premium').replace('From ', '')}</span>
                            </>
                          ) : (
                            getValue(feature, type as 'standard' | 'premium')
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
