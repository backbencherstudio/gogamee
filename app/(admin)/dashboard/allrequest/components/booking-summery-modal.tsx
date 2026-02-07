"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CalendarIcon,
  Users,
  Ticket,
  Mail,
  Phone,
  CreditCard,
  CheckCircle2,
  XCircle,
  Euro,
  Package,
  MapPin,
  Trophy,
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "../../../../../components/ui/toast";
import { updateBooking } from "../../../../../services/bookingService";
import Image from "next/image";

interface BookingData {
  id: string;
  status:
    | "pending"
    | "completed"
    | "cancelled"
    | "approved"
    | "rejected"
    | "confirmed";
  selectedSport: string;
  selectedPackage: string;
  selectedCity: string;
  selectedLeague: string;
  adults: number;
  kids: number;
  babies: number;
  totalPeople: number;
  departureDate: string;
  returnDate: string;
  departureDateFormatted: string;
  returnDateFormatted: string;
  departureTimeStart: number;
  departureTimeEnd: number;
  arrivalTimeStart: number;
  arrivalTimeEnd: number;
  departureTimeRange: string;
  arrivalTimeRange: string;
  removedLeagues: { id: string; name: string; country: string }[];
  removedLeaguesCount: number;
  hasRemovedLeagues: boolean;
  allExtras: {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    isSelected: boolean;
    quantity: number;
    maxQuantity?: number;
    isIncluded?: boolean;
    currency: string;
  }[];
  selectedExtras: {
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    isSelected: boolean;
    quantity: number;
    maxQuantity?: number;
    isIncluded?: boolean;
    currency: string;
  }[];
  selectedExtrasNames: string[];
  totalExtrasCost: number;
  extrasCount: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  cardNumber: string | null;
  expiryDate: string | null;
  cvv: string | null;
  cardholderName: string | null;
  bookingTimestamp: string;
  bookingDate: string;
  bookingTime: string;
  isBookingComplete: boolean;
  travelDuration: number;
  hasFlightPreferences: boolean;
  requiresEuropeanLeagueHandling: boolean;
  previousTravelInfo?: string;
  destinationCity?: string;
  assignedMatch?: string;
  allTravelers?: Array<{
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    documentType: "ID" | "Passport";
    documentNumber: string;
    isPrimary?: boolean;
    travelerNumber?: number;
  }>;
  totalCost: string;
  payment_status: string;
  priceBreakdown?: {
    packageCost: number;
    extrasCost: number;
    leagueRemovalCost: number;
    leagueSurcharge: number;
    flightPreferenceCost: number;
    singleTravelerSupplement: number;
    bookingFee: number;
    totalBaseCost: number;
    totalCost: number;
    currency: string;
    basePricePerPerson?: number;
    items?: {
      description: string;
      amount: number;
      quantity?: number;
      unitPrice?: number;
    }[];
  };
}

interface BookingSummaryModalProps {
  bookingData: BookingData;
  onStatusUpdate?: () => void;
}

export default function BookingSummaryModal({
  bookingData,
  onStatusUpdate,
}: BookingSummaryModalProps) {
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [destinationCity, setDestinationCity] = useState(
    bookingData.destinationCity || "",
  );
  const [assignedMatch, setAssignedMatch] = useState(
    bookingData.assignedMatch || "",
  );
  /* Local state for optimistic updates */
  const [status, setStatus] = useState(bookingData.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isTravelersExpanded, setIsTravelersExpanded] = useState(false);
  const formatCurrency = (value: number | null | undefined) => {
    const amount = Number(value ?? 0);
    return amount.toFixed(2);
  };

  // Update local state when bookingData changes
  const updateLocalState = useCallback(() => {
    setDestinationCity(bookingData.destinationCity || "");
    setAssignedMatch(bookingData.assignedMatch || "");
    setStatus(bookingData.status);
    setHasChanges(false); // Reset changes flag when data is updated
  }, [
    bookingData.destinationCity,
    bookingData.assignedMatch,
    bookingData.status,
  ]);

  // Update local state when component mounts or bookingData changes
  useEffect(() => {
    updateLocalState();
  }, [updateLocalState]);

  // Check for changes when input values change
  useEffect(() => {
    const currentDestinationCity = bookingData.destinationCity || "";
    const currentAssignedMatch = bookingData.assignedMatch || "";

    const hasChangesNow =
      destinationCity !== currentDestinationCity ||
      assignedMatch !== currentAssignedMatch;
    setHasChanges(hasChangesNow);
  }, [
    destinationCity,
    assignedMatch,
    bookingData.destinationCity,
    bookingData.assignedMatch,
  ]);

  // Force update local state when modal opens to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      updateLocalState();
    }
  }, [isOpen, updateLocalState]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm">
          View Booking Summary
        </Button>
      </DialogTrigger>
      <DialogContent className=" min-w-[50vw] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl">
        <DialogHeader className="border-b border-gray-100 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              {/* Client Name as Main Title */}
              <DialogTitle className="text-3xl font-bold text-gray-900 mb-2 font-['Poppins'] tracking-tight">
                {bookingData.fullName ||
                  `${bookingData.firstName} ${bookingData.lastName}`}
              </DialogTitle>

              {/* Package Type */}
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-[#6AAD3C]" />
                <p className="text-base font-semibold text-gray-700 capitalize font-['Poppins']">
                  {bookingData.selectedPackage} Package
                </p>
              </div>

              <DialogDescription className="text-gray-500 font-['Poppins'] text-sm">
                Reservation #{bookingData.id} • Registered on{" "}
                {bookingData.bookingDate}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Status Badge Removed per user request */}
            </div>
          </div>

          {/* Status Information Card */}
          {/* Status Information Card */}
          <div className="w-full p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-1.5 rounded ${
                    status === "completed" ||
                    status === "approved" ||
                    status === "confirmed"
                      ? "bg-emerald-100 text-emerald-700"
                      : status === "cancelled" || status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {status === "completed" ||
                  status === "approved" ||
                  status === "confirmed" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : status === "cancelled" || status === "rejected" ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Status
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {status === "completed" ||
                    status === "approved" ||
                    status === "confirmed"
                      ? "Confirmed"
                      : status === "cancelled" || status === "rejected"
                        ? "Cancelled"
                        : "Pending"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </p>
                <Badge
                  className={`mt-1 font-bold ${
                    bookingData.payment_status === "paid" ||
                    bookingData.payment_status === "succeeded"
                      ? "bg-emerald-600 text-white"
                      : bookingData.payment_status === "pending"
                        ? "bg-amber-500 text-white"
                        : "bg-red-500 text-white"
                  }`}
                >
                  {bookingData.payment_status === "paid" ||
                  bookingData.payment_status === "succeeded"
                    ? "Paid"
                    : bookingData.payment_status === "pending"
                      ? "Pending"
                      : bookingData.payment_status === "failed"
                        ? "Failed"
                        : bookingData.payment_status || "Unknown"}
                </Badge>
              </div>
            </div>

            <Separator className="my-3 opacity-50" />

            <div className="text-sm text-gray-600 italic">
              {bookingData.status === "pending"
                ? "This booking is currently under review by the logistics team."
                : bookingData.status === "completed" ||
                    bookingData.status === "approved"
                  ? "Everything is set! The customer has received their confirmation."
                  : "This booking was declined. The customer has been notified."}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Overview */}
          <Card className="border-none shadow-none bg-[#F1F9EC] rounded-2xl">
            <CardHeader className="pb-3 px-6 pt-6">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 font-['Poppins']">
                <div className="w-10 h-10 bg-[#6AAD3C] rounded-xl flex items-center justify-center shadow-sm">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                Trip Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Trophy className="h-5 w-5 text-[#6AAD3C]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Sport
                      </p>
                      <p className="text-base font-bold text-gray-900 font-['Poppins'] capitalize">
                        {bookingData.selectedSport}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <MapPin className="h-5 w-5 text-[#6AAD3C]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Departure City
                      </p>
                      <p className="text-base font-bold text-gray-900 font-['Poppins'] capitalize">
                        {bookingData.selectedCity}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Trophy className="h-5 w-5 text-[#6AAD3C]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Competition
                      </p>
                      <p className="text-base font-bold text-gray-900 font-['Poppins'] capitalize">
                        {bookingData.selectedLeague}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <Clock className="h-5 w-5 text-[#6AAD3C]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        Travel Duration
                      </p>
                      <p className="text-base font-bold text-gray-900 font-['Poppins']">
                        {bookingData.travelDuration} Nights
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 md:col-span-2 lg:col-span-1">
                  {(destinationCity || bookingData.destinationCity) && (
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        <MapPin className="h-5 w-5 text-[#6AAD3C]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          Target Destination
                        </p>
                        <Badge className="bg-[#6AAD3C] text-white font-bold font-['Poppins'] mt-1">
                          {destinationCity || bookingData.destinationCity}
                        </Badge>
                      </div>
                    </div>
                  )}
                  {(assignedMatch || bookingData.assignedMatch) && (
                    <div className="flex items-start gap-4 mt-2">
                      <div className="mt-1">
                        <Ticket className="h-5 w-5 text-[#6AAD3C]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          Assigned Match
                        </p>
                        <p className="text-sm font-bold text-gray-900 font-['Poppins'] mt-1">
                          {assignedMatch || bookingData.assignedMatch}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Dates */}
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 font-['Poppins']">
                <CalendarIcon className="h-5 w-5 text-[#6AAD3C]" />
                Travel Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="text-center flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Departure
                  </p>
                  <p className="text-base font-bold text-gray-900 font-['Poppins']">
                    {bookingData.departureDateFormatted}
                  </p>
                  <p className="text-xs text-[#6AAD3C] font-semibold mt-1">
                    {bookingData.departureTimeRange}
                  </p>
                </div>
                <div className="px-4 text-gray-300">
                  <CheckCircle2 className="h-4 w-4 rotate-90" />
                </div>
                <div className="text-center flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Return
                  </p>
                  <p className="text-base font-bold text-gray-900 font-['Poppins']">
                    {bookingData.returnDateFormatted}
                  </p>
                  <p className="text-xs text-[#6AAD3C] font-semibold mt-1">
                    {bookingData.returnDateFormatted
                      ? bookingData.arrivalTimeRange
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passengers */}
          <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 font-['Poppins']">
                <Users className="h-5 w-5 text-[#6AAD3C]" />
                Travelers
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Adults
                  </p>
                  <p className="text-xl font-bold text-gray-900 font-['Poppins']">
                    {bookingData.adults}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Kids
                  </p>
                  <p className="text-xl font-bold text-gray-900 font-['Poppins']">
                    {bookingData.kids}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                    Babies
                  </p>
                  <p className="text-xl font-bold text-gray-900 font-['Poppins']">
                    {bookingData.babies}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-2 bg-[#F1F9EC] rounded-lg text-center border border-[#6AAD3C]/10">
                <p className="text-sm font-bold text-[#6AAD3C] font-['Poppins']">
                  Total Group: {bookingData.totalPeople} People
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Excluded Competitions */}
          {bookingData.hasRemovedLeagues &&
            bookingData.removedLeagues &&
            bookingData.removedLeagues.length > 0 && (
              <Card className="border border-red-100 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 bg-red-50/50">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 font-['Poppins']">
                    <XCircle className="h-5 w-5 text-red-500" />
                    Excluded Leagues
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {bookingData.removedLeagues.map((league) => (
                      <Badge
                        key={league.id}
                        variant="secondary"
                        className="bg-red-50 text-red-700 border-red-100 py-1.5 px-3 font-medium flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {league.name} ({league.country})
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Selected Extras */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 font-['Poppins']">
                <Package className="h-5 w-5 text-[#6AAD3C]" />
                Selected Extras
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {bookingData.selectedExtras &&
              bookingData.selectedExtras.length > 0 ? (
                <div className="space-y-3">
                  {bookingData.selectedExtras.map((extra) => (
                    <div
                      key={extra.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-[#6AAD3C]/30 hover:bg-[#F1F9EC]/50 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 p-1 bg-white rounded-lg flex items-center justify-center text-xl shadow-sm border border-gray-100 group-hover:border-[#6AAD3C]/20">
                          {extra.icon ? (
                            <Image
                              src={extra.icon}
                              alt={extra.name}
                              width={200}
                              height={200}
                            />
                          ) : (
                            "✨"
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 font-['Poppins']">
                            {extra.name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            Quantity: {extra.quantity} ×{" "}
                            {extra.price === 0 ? "Free" : `€${extra.price}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {extra.price === 0 ? (
                          <Badge className="bg-[#6AAD3C]/10 text-[#6AAD3C] border-[#6AAD3C]/20 font-bold">
                            INCLUDED
                          </Badge>
                        ) : (
                          <div className="font-bold text-gray-900 font-['Poppins'] text-lg">
                            €{formatCurrency(extra.price * extra.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-4 bg-[#F1F9EC] rounded-xl border border-[#6AAD3C]/20 flex items-center justify-between">
                    <span className="font-bold text-gray-700 font-['Poppins']">
                      Subtotal Extras
                    </span>
                    <span className="text-lg font-bold text-[#6AAD3C] font-['Poppins']">
                      €{formatCurrency(bookingData.totalExtrasCost)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-sm text-gray-400 font-medium">
                    No extras selected for this booking
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Cost Breakdown */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-gray-50 to-white overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-100 bg-white">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 font-['Poppins']">
                <div className="w-10 h-10 bg-[#6AAD3C] rounded-xl flex items-center justify-center shadow-md">
                  <Euro className="h-6 w-6 text-white" />
                </div>
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {bookingData.priceBreakdown ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {bookingData.priceBreakdown.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-500 font-medium font-['Poppins'] uppercase tracking-wider text-[10px]">
                          {item.description}
                          {item.quantity && item.quantity > 1
                            ? ` (x${item.quantity})`
                            : ""}
                        </span>
                        <span className="font-bold text-gray-900 font-['Poppins']">
                          €{formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4 bg-gray-100" />

                  <div className="flex items-center justify-between p-6 bg-[#6AAD3C] rounded-2xl shadow-inner text-white">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                        Total Amount Paid
                      </p>
                      <p className="text-sm font-medium opacity-90">
                        {bookingData.totalPeople} Traveler
                        {bookingData.totalPeople > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold font-['Poppins'] tracking-tighter transition-all hover:scale-105">
                        €{formatCurrency(bookingData.priceBreakdown.totalCost)}
                      </p>
                      <p className="text-[10px] mt-1 font-bold opacity-80">
                        €
                        {formatCurrency(
                          bookingData.priceBreakdown.totalCost /
                            (bookingData.totalPeople || 1),
                        )}{" "}
                        / person
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-[#F1F9EC] rounded-xl border border-[#6AAD3C]/10 flex items-center gap-3">
                    <div className="p-1.5 bg-[#6AAD3C] rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-[11px] font-semibold text-[#6AAD3C] font-['Poppins']">
                      Server-calculated price with full breakdown stored in
                      database.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-400 italic">
                      <span>
                        Detailed breakdown unavailable for legacy booking
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4 bg-gray-100" />

                  <div className="flex items-center justify-between p-6 bg-[#6AAD3C] rounded-2xl shadow-inner text-white">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-1">
                        Total Amount Paid
                      </p>
                      <p className="text-sm font-medium opacity-90">
                        {bookingData.totalPeople} Traveler
                        {bookingData.totalPeople > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold font-['Poppins'] tracking-tighter transition-all hover:scale-105">
                        €{formatCurrency(Number(bookingData.totalCost))}
                      </p>
                      <p className="text-[10px] mt-1 font-bold opacity-80">
                        €
                        {formatCurrency(
                          Number(bookingData.totalCost) /
                            (bookingData.totalPeople || 1),
                        )}{" "}
                        / person
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Travelers Information - Collapsible */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-0 p-0">
              <button
                onClick={() => setIsTravelersExpanded(!isTravelersExpanded)}
                className="flex items-center justify-between w-full p-6 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#F1F9EC] rounded-xl flex items-center justify-center group-hover:bg-[#6AAD3C] transition-colors">
                    <Users className="h-5 w-5 text-[#6AAD3C] group-hover:text-white transition-colors" />
                  </div>
                  <div className="text-left">
                    <CardTitle className="text-lg font-bold text-gray-900 font-['Poppins']">
                      All Travelers Information
                    </CardTitle>
                    <p className="text-xs text-gray-500 font-medium">
                      {bookingData.allTravelers?.length || 0} People Registered
                    </p>
                  </div>
                </div>
                <div
                  className={`p-2 rounded-full bg-gray-100 text-gray-500 transition-transform ${isTravelersExpanded ? "rotate-180" : ""}`}
                >
                  <ChevronDown className="h-5 w-5" />
                </div>
              </button>
            </CardHeader>
            {isTravelersExpanded && (
              <CardContent className="p-6 pt-0 space-y-4">
                <Separator className="mb-6" />

                {/* Previous Travel Info */}
                {bookingData.previousTravelInfo && (
                  <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 mb-6 transition-all hover:bg-amber-100/50">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-amber-200">
                        <ShieldAlert className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1 font-['Poppins']">
                          Previous Travel Experience
                        </p>
                        <p className="text-sm text-gray-800 font-medium font-['Poppins'] leading-relaxed">
                          {bookingData.previousTravelInfo}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {bookingData.allTravelers &&
                bookingData.allTravelers.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {bookingData.allTravelers.map((traveler, index) => (
                      <div
                        key={index}
                        className={`p-5 rounded-2xl border transition-all ${
                          traveler.isPrimary
                            ? "bg-[#F1F9EC] border-[#6AAD3C]/30 shadow-sm"
                            : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                traveler.isPrimary
                                  ? "bg-[#6AAD3C] text-white"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <span className="font-bold text-gray-900 font-['Poppins']">
                              {traveler.name}
                            </span>
                          </div>
                          {traveler.isPrimary && (
                            <Badge className="bg-[#6AAD3C] text-white font-bold text-[10px] px-2 py-0.5">
                              PRIMARY CONTACT
                            </Badge>
                          )}
                          {traveler.travelerNumber && !traveler.isPrimary && (
                            <Badge
                              variant="outline"
                              className="text-[10px] text-gray-500 font-bold uppercase"
                            >
                              TRAVELER #{traveler.travelerNumber}
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-['Poppins']">
                          {traveler.email && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Email
                              </span>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-700 truncate">
                                  {traveler.email}
                                </span>
                              </div>
                            </div>
                          )}
                          {traveler.phone && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Phone
                              </span>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-700 truncate">
                                  {traveler.phone}
                                </span>
                              </div>
                            </div>
                          )}
                          {traveler.dateOfBirth && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                Date of Birth
                              </span>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-700">
                                  {new Date(
                                    traveler.dateOfBirth,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}
                          {traveler.documentType && (
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                {traveler.documentType}
                              </span>
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-gray-700 truncate">
                                  {traveler.documentNumber}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium font-['Poppins']">
                      No additional traveler details available
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Payment & Booking */}
          <Card className="border border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-gray-50">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 font-['Poppins']">
                <CreditCard className="h-5 w-5 text-[#6AAD3C]" />
                Payment & Timing
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <CreditCard className="h-5 w-5 text-[#6AAD3C]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Payment Method
                      </p>
                      <p className="text-sm font-bold text-gray-900 font-['Poppins'] capitalize">
                        {bookingData.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <DollarSign
                        className={`h-5 w-5 ${bookingData.payment_status === "paid" ? "text-[#6AAD3C]" : "text-amber-500"}`}
                      />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Payment Status
                      </p>
                      <p
                        className={`text-sm font-bold font-['Poppins'] capitalize ${bookingData.payment_status === "paid" ? "text-[#6AAD3C]" : "text-amber-600"}`}
                      >
                        {bookingData.payment_status === "paid"
                          ? "Paid"
                          : "Pending"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <CalendarIcon className="h-5 w-5 text-[#6AAD3C]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Booking Date
                      </p>
                      <p className="text-sm font-bold text-gray-900 font-['Poppins']">
                        {bookingData.bookingDate} at {bookingData.bookingTime}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GoGame Internal Management */}
          <Card className="border-none shadow-md bg-white overflow-hidden mt-6">
            <CardHeader className="pb-3 border-b border-gray-50 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900 font-['Poppins']">
                <Trophy className="h-5 w-5 text-[#6AAD3C]" />
                GoGame Internal Management
              </CardTitle>
              <Badge
                variant="outline"
                className="text-[10px] font-bold text-[#6AAD3C] border-[#6AAD3C]/20 uppercase"
              >
                Admin Only
              </Badge>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="p-4 bg-[#F1F9EC] rounded-xl border border-[#6AAD3C]/10 flex items-start gap-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <ShieldAlert className="h-4 w-4 text-[#6AAD3C]" />
                </div>
                <p className="text-xs text-gray-700 font-medium leading-relaxed font-['Poppins']">
                  Reveal destination and match details to customers 48 hours
                  before departure. Ensure these fields are filled before
                  approving the booking.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['Poppins']">
                    Destination City *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={destinationCity}
                      onChange={(e) => {
                        setDestinationCity(e.target.value);
                        setHasChanges(true);
                      }}
                      placeholder="e.g., London, Paris, Milan"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6AAD3C]/20 focus:border-[#6AAD3C] outline-none transition-all font-['Poppins'] text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest font-['Poppins']">
                    Assigned Match *
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={assignedMatch}
                      onChange={(e) => {
                        setAssignedMatch(e.target.value);
                        setHasChanges(true);
                      }}
                      placeholder="e.g., Real Madrid vs Barcelona"
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#6AAD3C]/20 focus:border-[#6AAD3C] outline-none transition-all font-['Poppins'] text-sm"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Status Indicators */}
          {status === "completed" ||
          status === "approved" ||
          status === "confirmed" ? (
            <div className="hidden md:flex items-center gap-3 text-[#6AAD3C] font-bold font-['Poppins'] bg-[#F1F9EC] px-6 py-4 rounded-2xl border border-[#6AAD3C]/20 shadow-sm">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              Confirmed
            </div>
          ) : status === "pending" ? (
            <div className="hidden md:flex items-center gap-3 text-amber-600 font-bold font-['Poppins'] bg-amber-50 px-6 py-4 rounded-2xl border border-amber-200/50 shadow-sm">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
              Pending
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {(status === "pending" ||
              (status !== "confirmed" &&
                status !== "approved" &&
                status !== "completed" &&
                status !== "cancelled" &&
                status !== "rejected")) && (
              <Button
                onClick={async () => {
                  if (isProcessing) return;

                  // Check if details are filled (either in bookingData or local state if not yet saved but visible)
                  // Actually, better to check if they are SAVED. But user might have just typed them.
                  // The "Save Improvements" button saves them.
                  // If we rely on valid check, we can check `destinationCity` state directly.

                  if (!destinationCity.trim() || !assignedMatch.trim()) {
                    addToast({
                      type: "warning",
                      title: "Missing Details",
                      description:
                        "Please fill in Destination City and Assigned Match before approving.",
                      duration: 4000,
                    });
                    // Ideally, scroll to the section
                    return;
                  }

                  // Optional: save details first if changed?
                  // For simplicity, assume they saved or we explicitly check values.
                  // If they didn't click save, `bookingData` might be old, but `destinationCity` state is fresh.
                  // We should probably update them along with status if they match local state?
                  // Let's just update valid if fields are present.

                  setIsProcessing(true);
                  try {
                    // Update both details (to be safe) and status
                    await updateBooking({
                      id: bookingData.id,
                      destinationCity: destinationCity.trim(),
                      assignedMatch: assignedMatch.trim(),
                      status: "confirmed",
                    });

                    addToast({
                      type: "success",
                      title: "Booking Approved",
                      description:
                        "Booking has been confirmed and user notified.",
                      duration: 4000,
                    });

                    // Optimistic update
                    setStatus("confirmed");

                    if (onStatusUpdate) onStatusUpdate();
                    setIsOpen(false);
                  } catch (error) {
                    addToast({
                      type: "error",
                      title: "Approval Failed",
                      description: "Could not approve booking.",
                      duration: 4000,
                    });
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="bg-[#6AAD3C] hover:bg-[#5a9332] text-white px-6 py-6 rounded-2xl font-bold font-['Poppins'] transition-all flex items-center gap-2 h-14 shadow-md hover:shadow-lg"
              >
                <CheckCircle2 className="h-5 w-5" />
                Approve Booking
              </Button>
            )}

            {status !== "rejected" && status !== "cancelled" && (
              <Button
                onClick={async () => {
                  if (isProcessing) return;
                  if (
                    !confirm(
                      "Are you sure you want to reject this booking? This will mark it as rejected.",
                    )
                  )
                    return;

                  setIsProcessing(true);
                  try {
                    await updateBooking({
                      id: bookingData.id,
                      status: "rejected",
                    });
                    addToast({
                      type: "warning",
                      title: "Booking Rejected",
                      description: "The booking has been manually rejected.",
                      duration: 4000,
                    });

                    // Optimistic update
                    setStatus("rejected");

                    if (onStatusUpdate) onStatusUpdate();
                    setIsOpen(false);
                  } catch (error) {
                    addToast({
                      type: "error",
                      title: "Action Failed",
                      description: "Could not reject booking.",
                      duration: 5000,
                    });
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                variant="destructive"
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-6 py-6 rounded-2xl font-bold font-['Poppins'] transition-all flex items-center gap-2 h-14"
              >
                <XCircle className="h-5 w-5" />
                Reject Booking
              </Button>
            )}

            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 px-6 py-6 rounded-2xl font-medium transition-all h-14"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
