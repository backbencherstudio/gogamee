"use client";

import React, { useState } from "react";
import { useBooking } from "../../context/BookingContext";
import { BookingNavigation } from "../shared/navigation/BookingNavigation";
import { personalInfoData } from "../../../../lib/appdata";

export default function DataConfirmation() {
  const { nextStep } = useBooking();
  const [confirmedData, setConfirmedData] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const canProceed = confirmedData && acceptedTerms;

  const handleNext = () => {
    if (canProceed) {
      nextStep();
    }
  };

  return (
    <div className="w-full max-w-[894px] px-3 md:px-4 xl:px-6 py-4 md:py-6 xl:py-8 bg-[#F1F9EC] rounded-xl outline-1 outline-offset-[-1px] outline-[#6AAD3C]/20 inline-flex flex-col justify-start items-start gap-4 md:gap-6 min-h-[400px] xl:min-h-0">
      <div className="self-stretch flex flex-col justify-center items-start gap-3">
        <div className="self-stretch h-auto xl:h-12 flex flex-col justify-start items-start gap-3">
          <div className="justify-center text-neutral-800 text-2xl xl:text-3xl font-semibold font-['Poppins'] leading-8 xl:leading-10">
            {personalInfoData.text.confirmationTitle}
          </div>
        </div>

        <div className="self-stretch flex flex-col justify-start items-start gap-6 mt-4">
          <div className="w-full p-6 bg-white rounded-lg shadow-sm flex flex-col gap-6 border border-gray-100">
            {/* Confirmation Checkbox 1 */}
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={confirmedData}
                  onChange={(e) => setConfirmedData(e.target.checked)}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:bg-[#6AAD3C] checked:border-[#6AAD3C] transition-all"
                />
                <svg
                  className="pointer-events-none absolute left-1 top-1 h-4 w-4 stroke-white opacity-0 peer-checked:opacity-100 transition-opacity"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-neutral-700 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed select-none group-hover:text-black transition-colors">
                {personalInfoData.text.confirmationLabel1}
              </span>
            </label>

            {/* Confirmation Checkbox 2 */}
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center mt-1">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="peer h-6 w-6 cursor-pointer appearance-none rounded border border-gray-300 bg-white checked:bg-[#6AAD3C] checked:border-[#6AAD3C] transition-all"
                />
                <svg
                  className="pointer-events-none absolute left-1 top-1 h-4 w-4 stroke-white opacity-0 peer-checked:opacity-100 transition-opacity"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span className="text-neutral-700 text-base md:text-lg font-normal font-['Poppins'] leading-relaxed select-none group-hover:text-black transition-colors">
                {personalInfoData.text.confirmationLabel2}
              </span>
            </label>
          </div>

          <BookingNavigation
            onNext={handleNext}
            nextText={personalInfoData.text.confirm}
            className="w-full"
            nextDisabled={!canProceed}
          />
        </div>
      </div>
    </div>
  );
}
