"use client";
import { pricingData, personalInfoData } from "../../../../../lib/appdata";
import { BOOKING_CONSTANTS } from "../../../context/BookingContext";

interface PricingSummaryProps {
  reservationData: {
    totalPeople: number;
    basePrice: number;
    packageTotal: number;
    extrasTotal: number;
    flightScheduleCost: number;
    flightScheduleTotal: number;
    leagueCost: number;
    leagueTotal: number;
    removalCostPerPerson: number;
    removalTotal: number;
    singleTravelerSupplement: number;
    grandTotal: number;
  };
  formData: {
    selectedSport: string | null;
    selectedPackage: string | null;
    extras: Array<{
      id: string;
      name: string;
      nameEn?: string;
      price: number;
      isSelected: boolean;
      isIncluded?: boolean;
      quantity: number;
    }> | null;
  };
}

export function PricingSummary({
  reservationData,
  formData,
}: PricingSummaryProps) {
  return (
    <>
      <div className="self-stretch pb-3 md:pb-5 border-b border-gray-200 flex flex-col justify-start items-start gap-2.5">
        {/* Mobile View */}
        <div className="md:hidden w-full">
          <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                {pricingData.getPackageName(
                  formData.selectedSport as "football" | "basketball",
                  formData.selectedPackage as "standard" | "premium",
                ) || personalInfoData.text.packageFallback}
              </span>
              <div className="text-right">
                <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                  {reservationData.basePrice}€ x {reservationData.totalPeople}
                </div>
                <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                  {reservationData.packageTotal.toFixed(2)}€
                </div>
              </div>
            </div>

            {/* Individual Extras Rows - Group costs, not per person */}
            {formData.extras &&
              formData.extras
                .filter((extra) => extra.isSelected && !extra.isIncluded)
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
                  {personalInfoData.text.flightScheduleAdjustments}
                </span>
                <div className="text-right">
                  <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                    {reservationData.flightScheduleCost}€ x{" "}
                    {reservationData.totalPeople}
                  </div>
                  <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                    {reservationData.flightScheduleTotal.toFixed(2)}€
                  </div>
                </div>
              </div>
            )}

            {/* League Additional Cost Row */}
            {reservationData.leagueTotal > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                  {personalInfoData.text.europeanCompetition}
                </span>
                <div className="text-right">
                  <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                    {reservationData.leagueCost}€ x{" "}
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
                  {personalInfoData.text.leagueRemovals}
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
                  {personalInfoData.text.singleTravelerSupplement}
                </span>
                <div className="text-right">
                  <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                    {BOOKING_CONSTANTS.SINGLE_TRAVELER_SUPPLEMENT}€
                  </div>
                  <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                    {reservationData.singleTravelerSupplement.toFixed(2)}€
                  </div>
                </div>
              </div>
            )}

            {/* Booking Fee Row (Mobile) */}
            {BOOKING_CONSTANTS.BOOKING_FEE > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                  Tarifa de Reserva
                </span>
                <div className="text-right">
                  <div className="text-neutral-800 text-sm font-normal font-['Poppins']">
                    {BOOKING_CONSTANTS.BOOKING_FEE}€
                  </div>
                  <div className="text-neutral-800 text-sm font-medium font-['Poppins']">
                    {BOOKING_CONSTANTS.BOOKING_FEE.toFixed(2)}€
                  </div>
                </div>
              </div>
            )}

            {/* Subtotal Row */}
            <div className="flex justify-between items-center py-4 border-t-2 border-lime-400 bg-lime-50 rounded-lg px-3">
              <span className="text-lg font-bold font-['Poppins'] text-gray-800">
                {personalInfoData.text.totalCost}
              </span>
              <div className="text-right">
                <div className="text-xl font-bold font-['Poppins'] text-lime-700">
                  {reservationData.grandTotal.toFixed(2)}€
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block w-full">
          <div className="w-full grid grid-cols-4 gap-4 border-b-2 border-gray-300 pb-4 mb-2">
            <div className="text-center text-base font-bold font-['Poppins'] leading-none text-gray-700">
              {personalInfoData.text.concept}
            </div>
            <div className="text-center text-base font-bold font-['Poppins'] leading-none text-gray-700">
              {personalInfoData.text.price}
            </div>
            <div className="text-center text-base font-bold font-['Poppins'] leading-none text-gray-700">
              {personalInfoData.text.quantity}
            </div>
            <div className="text-right text-base font-bold font-['Poppins'] leading-none text-gray-700">
              {personalInfoData.text.total}
            </div>
          </div>

          {/* Package Row */}
          <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
            <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
              {pricingData.getPackageName(
                formData.selectedSport as "football" | "basketball",
                formData.selectedPackage as "standard" | "premium",
              ) || personalInfoData.text.packageFallback}
            </div>
            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
              {reservationData.basePrice}€
            </div>
            <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
              x{reservationData.totalPeople}
            </div>
            <div className="text-right text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
              {reservationData.packageTotal.toFixed(2)}€
            </div>
          </div>

          {/* Extras Rows - Group costs, not per person */}
          {formData.extras &&
            formData.extras
              .filter((extra) => extra.isSelected && !extra.isIncluded)
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
                {personalInfoData.text.flightScheduleAdjustments}
              </div>
              <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                {reservationData.flightScheduleCost}€
              </div>
              <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                x{reservationData.totalPeople}
              </div>
              <div className="text-right text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                {reservationData.flightScheduleTotal.toFixed(2)}€
              </div>
            </div>
          )}

          {/* League Additional Cost Row */}
          {reservationData.leagueTotal > 0 && (
            <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
              <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                {personalInfoData.text.europeanCompetition}
              </div>
              <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                {reservationData.leagueCost}€
              </div>
              <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                x{reservationData.totalPeople}
              </div>
              <div className="text-right text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                {reservationData.leagueTotal.toFixed(2)}€
              </div>
            </div>
          )}

          {/* League Removal Row */}
          {reservationData.removalTotal > 0 && (
            <div className="w-full grid grid-cols-4 gap-4 py-3 border-b border-gray-100">
              <div className="text-left text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                {personalInfoData.text.leagueRemovals}
              </div>
              <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                {reservationData.removalCostPerPerson}€
              </div>
              <div className="text-center text-neutral-800 text-base font-normal font-['Poppins'] leading-none">
                x{reservationData.totalPeople}
              </div>
              <div className="text-right text-neutral-800 text-base font-medium font-['Poppins'] leading-none">
                {reservationData.removalTotal.toFixed(2)}€
              </div>
            </div>
          )}

          {/* Single Traveler Supplement Row (Desktop) */}
          {reservationData.singleTravelerSupplement > 0 && (
            <div className="w-full grid grid-cols-4 gap-4 border-b-2 border-gray-200 py-3">
              <div className="text-base font-medium font-['Poppins'] leading-none text-neutral-800">
                {personalInfoData.text.singleTravelerSupplement}
              </div>
              <div className="text-base font-medium font-['Poppins'] leading-none text-neutral-800 text-center">
                {BOOKING_CONSTANTS.SINGLE_TRAVELER_SUPPLEMENT}€
              </div>
              <div className="text-base font-medium font-['Poppins'] leading-none text-neutral-800 text-center">
                x1
              </div>
              <div className="text-base font-medium font-['Poppins'] leading-none text-neutral-800 text-end">
                {reservationData.singleTravelerSupplement.toFixed(2)}€
              </div>
            </div>
          )}

          {/* Booking Fee Row (Desktop) */}
          {BOOKING_CONSTANTS.BOOKING_FEE > 0 && (
            <div className="w-full grid grid-cols-4 gap-4 py-3">
              <div className="text-base font-medium font-['Poppins'] leading-none text-neutral-800">
                Tarifa de Reserva
              </div>
              <div className="text-base font-normal font-['Poppins'] leading-none text-neutral-800 text-center">
                {BOOKING_CONSTANTS.BOOKING_FEE}€
              </div>
              <div className="text-base font-normal font-['Poppins'] leading-none text-neutral-800 text-center">
                x1
              </div>
              <div className="text-base font-medium font-['Poppins'] leading-none text-neutral-800 text-end">
                {BOOKING_CONSTANTS.BOOKING_FEE.toFixed(2)}€
              </div>
            </div>
          )}

          {/* Subtotal Row */}
          <div className="w-full grid grid-cols-4 gap-4 py-3 border-t-2 border-gray-300">
            <div className="text-left text-neutral-800 text-base font-semibold font-['Poppins'] leading-none">
              {personalInfoData.text.subtotal}
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

      {/* Total Cost Summary Card */}
      <div className="w-full bg-gradient-to-r from-lime-50 to-green-50 rounded-xl p-6 mt-6 border-2 border-lime-200 shadow-sm">
        <div className="space-y-3">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-800 font-['Poppins']">
              {personalInfoData.text.letsGo}
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-lime-200">
              <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                {personalInfoData.text.packageTotal}
              </span>
              <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                {reservationData.packageTotal.toFixed(2)}€
              </span>
            </div>

            {reservationData.extrasTotal > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-lime-200">
                <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                  {personalInfoData.text.extrasTotal}
                </span>
                <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                  {reservationData.extrasTotal.toFixed(2)}€
                </span>
              </div>
            )}

            {reservationData.flightScheduleTotal > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-lime-200">
                <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                  {personalInfoData.text.flightScheduleTotal}
                </span>
                <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                  {reservationData.flightScheduleTotal.toFixed(2)}€
                </span>
              </div>
            )}

            {reservationData.leagueTotal > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-lime-200">
                <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                  {personalInfoData.text.europeanCompetition}
                </span>
                <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                  {reservationData.leagueTotal.toFixed(2)}€
                </span>
              </div>
            )}

            {reservationData.singleTravelerSupplement > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-lime-200">
                <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                  {personalInfoData.text.singleTravelerSupplement}
                </span>
                <span className="text-neutral-800 text-sm font-semibold font-['Poppins']">
                  {reservationData.singleTravelerSupplement.toFixed(2)}€
                </span>
              </div>
            )}

            {reservationData.removalTotal > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-lime-200">
                <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                  {personalInfoData.text.leagueRemovals}
                </span>
                <span className="text-neutral-800 text-sm font-medium font-['Poppins']">
                  {reservationData.removalTotal.toFixed(2)}€
                </span>
              </div>
            )}
          </div>

          <div className="border-t-2 border-lime-400 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className=" text-xl font-bold font-['Poppins'] text-gray-800">
                {personalInfoData.text.totalCost}
              </span>
              <span className=" text-2xl font-bold font-['Poppins'] text-lime-700">
                {reservationData.grandTotal.toFixed(2)}€
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
