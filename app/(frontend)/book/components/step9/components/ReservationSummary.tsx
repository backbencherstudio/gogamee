import React from "react";
import { FaPlane } from "react-icons/fa";
import { TranslatedText } from "../../../../_components/TranslatedText";
import { PricingSummary } from "./PricingSummary";

interface ReservationSummaryProps {
  reservationData: any;
  personalInfoData: any;
  formData: any;
  t: (es: string, en: string) => string;
}

export const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  reservationData,
  personalInfoData,
  formData,
  t,
}) => {
  return (
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
          <PricingSummary
            reservationData={reservationData}
            formData={{
              selectedSport: formData.selectedSport,
              selectedPackage: formData.selectedPackage,
              extras: formData.extras || null,
            }}
          />
        </div>
      </div>
    </div>
  );
};
