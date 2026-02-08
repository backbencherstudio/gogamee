"use client";

import { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import {
  CalendarIcon,
  Users,
  Mail,
  Phone,
  CreditCard,
  ChevronDown,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "../../../../../components/ui/toast";
import { TranslatedText } from "@/app/(frontend)/_components/TranslatedText";
import { useLanguage } from "@/app/context/LanguageContext";
import {
  updateBooking,
  BookingItem,
} from "../../../../../services/bookingService";

interface BookingSummaryModalProps {
  bookingData: BookingItem;
  onStatusUpdate?: () => void;
}

export default function BookingSummaryModal({
  bookingData,
  onStatusUpdate,
}: BookingSummaryModalProps) {
  const { addToast } = useToast();
  const { translateText } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [destinationCity, setDestinationCity] = useState(
    bookingData.destinationCity || "",
  );
  const [assignedMatch, setAssignedMatch] = useState(
    bookingData.assignedMatch || "",
  );
  const [status, setStatus] = useState(bookingData.status);
  const [isTravelersExpanded, setIsTravelersExpanded] = useState(false);
  const formatCurrency = (value: number | null | undefined) => {
    const amount = Number(value ?? 0);
    return amount.toFixed(2);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string | undefined | null) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "h:mm a");
    } catch {
      return "";
    }
  };

  // Initialize state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDestinationCity(bookingData.destinationCity || "");
      setAssignedMatch(bookingData.assignedMatch || "");
      setStatus(bookingData.status);
    }
  }, [
    isOpen,
    bookingData.destinationCity,
    bookingData.assignedMatch,
    bookingData.status,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm">
          <TranslatedText text="View Booking Summary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[50vw] max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg">
        <DialogHeader className="border-b border-[#6AAD3C]/20 pb-4 mb-4">
          <div className="space-y-3">
            {/* Client Name as Main Title */}
            <DialogTitle className="text-2xl font-bold text-[#6AAD3C]">
              {bookingData.travelers?.primaryContact?.name || "Guest"}
            </DialogTitle>

            {/* Booking ID and Date */}
            <DialogDescription className="text-sm text-gray-600">
              <TranslatedText text="Booking ID" />:{" "}
              {bookingData.bookingReference ||
                bookingData.id ||
                bookingData._id}{" "}
              •{" "}
              {bookingData.createdAt
                ? new Date(bookingData.createdAt).toLocaleDateString()
                : ""}
            </DialogDescription>

            {/* Status Information Card */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">
                  <TranslatedText text="Booking Status" />:
                </span>
                <Badge
                  className={`${
                    bookingData.status === "confirmed" ||
                    bookingData.status === "completed"
                      ? "bg-[#E7F6E0] text-[#6AAD3C] hover:bg-[#E7F6E0]"
                      : bookingData.status === "rejected"
                        ? "bg-red-50 text-red-600 hover:bg-red-50"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-50"
                  } font-semibold border-0 px-3 py-1`}
                >
                  {bookingData.status.charAt(0).toUpperCase() +
                    bookingData.status.slice(1)}
                </Badge>
              </div>
              <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500 font-medium">
                  <TranslatedText text="Payment Status" />:
                </span>
                <Badge
                  className={`${
                    bookingData.payment?.status === "paid"
                      ? "bg-[#E7F6E0] text-[#6AAD3C] hover:bg-[#E7F6E0]"
                      : bookingData.payment?.status === "failed"
                        ? "bg-red-50 text-red-600 hover:bg-red-50"
                        : "bg-amber-50 text-amber-600 hover:bg-amber-50"
                  } font-semibold border-0 px-3 py-1`}
                >
                  {bookingData.payment?.status === "paid"
                    ? "Paid"
                    : bookingData.payment?.status === "failed"
                      ? "Failed"
                      : bookingData.payment?.status || "Unknown"}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Trip Overview */}
          <Card className="border border-[#6AAD3C]/20 bg-white">
            <CardHeader className="pb-3 border-b border-[#6AAD3C]/10">
              <CardTitle className="text-lg font-bold text-[#6AAD3C]">
                <TranslatedText text="Trip Overview" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    <TranslatedText text="Sport" />
                  </p>
                  <p className="text-sm font-semibold text-black capitalize">
                    <TranslatedText text={bookingData.selection?.sport || ""} />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    <TranslatedText text="Package" />
                  </p>
                  <p className="text-sm font-semibold text-black capitalize">
                    <TranslatedText
                      text={bookingData.selection?.package || ""}
                    />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    <TranslatedText text="Departure City" />
                  </p>
                  <p className="text-sm font-semibold text-black capitalize">
                    <TranslatedText text={bookingData.selection?.city || ""} />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    <TranslatedText text="Competition" />
                  </p>
                  <p className="text-sm font-semibold text-black capitalize">
                    {bookingData.leagues?.list?.find((l: any) => l.isSelected)
                      ?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    <TranslatedText text="Travel Duration" />
                  </p>
                  <p className="text-sm font-semibold text-black">
                    {bookingData.dates?.durationNights}{" "}
                    <TranslatedText text="Nights" />
                  </p>
                </div>
                {(destinationCity || bookingData.destinationCity) && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      <TranslatedText text="Target Destination" />
                    </p>
                    <p className="text-sm font-semibold text-black">
                      {destinationCity || bookingData.destinationCity}
                    </p>
                  </div>
                )}
                {(assignedMatch || bookingData.assignedMatch) && (
                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">
                      <TranslatedText text="Assigned Match" />
                    </p>
                    <p className="text-sm font-semibold text-black">
                      {assignedMatch || bookingData.assignedMatch}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Travel Dates */}
          <Card className="border border-gray-300 bg-white">
            <CardHeader className="pb-3 border-b border-gray-200">
              <CardTitle className="text-lg font-bold text-black">
                <TranslatedText text="Travel Dates" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                    <TranslatedText text="Departure" />
                  </p>
                  <p className="text-sm font-semibold text-black">
                    {formatDate(bookingData.dates?.departure)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {bookingData.flight?.schedule?.departureBetween || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                    <TranslatedText text="Return" />
                  </p>
                  <p className="text-sm font-semibold text-black">
                    {formatDate(bookingData.dates?.return)}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {bookingData.dates?.return
                      ? bookingData.flight?.schedule?.returnBetween || "N/A"
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passengers */}
          <Card className="border border-gray-300 bg-white">
            <CardHeader className="pb-3 border-b border-gray-200">
              <CardTitle className="text-lg font-bold text-black">
                <TranslatedText text="Travelers" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                    <TranslatedText text="Adults" />
                  </p>
                  <p className="text-lg font-bold text-black">
                    {bookingData.travelers?.adults?.length || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                    <TranslatedText text="Kids" />
                  </p>
                  <p className="text-lg font-bold text-black">
                    {bookingData.travelers?.kids?.length || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                    <TranslatedText text="Babies" />
                  </p>
                  <p className="text-lg font-bold text-black">
                    {bookingData.travelers?.babies?.length || 0}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 text-center">
                <p className="text-sm font-semibold text-black">
                  <TranslatedText text="Total" />:{" "}
                  {bookingData.travelers?.totalCount || 0}{" "}
                  <TranslatedText text="People" />
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Previous Travel Info */}
          {bookingData.previousTravelInfo && (
            <Card className="border border-gray-300 bg-white">
              <CardHeader className="pb-3 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-black">
                  <TranslatedText text="Previous Travel Information" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-black whitespace-pre-wrap">
                  {bookingData.previousTravelInfo}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Removed Leagues */}
          {bookingData.leagues?.hasRemovedLeagues && (
            <Card className="border border-gray-300 bg-white">
              <CardHeader className="pb-3 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                  <TranslatedText text="Removed Leagues" />
                  <span className="text-red-500 text-sm font-normal">
                    ({bookingData.leagues.removedCount}{" "}
                    <TranslatedText text="Removed" />)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {bookingData.leagues.list
                    .filter((l: any) => !l.isSelected)
                    .map((league: any) => (
                      <Badge
                        key={league.id || league.name}
                        variant="secondary"
                        className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                      >
                        {league.name}
                        <span className="ml-1 text-xs opacity-75">
                          ({league.country})
                        </span>
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Extras */}
          <Card className="border border-gray-300 bg-white">
            <CardHeader className="pb-3 border-b border-gray-200">
              <CardTitle className="text-lg font-bold text-black">
                <TranslatedText text="Selected Extras" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {bookingData.extras?.selected &&
              bookingData.extras.selected.length > 0 ? (
                <div className="space-y-2">
                  {bookingData.extras.selected.map((extra: any) => (
                    <div
                      key={extra.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded"
                    >
                      <div>
                        <p className="font-semibold text-black">
                          <TranslatedText text={extra.name} />
                        </p>
                        <p className="text-xs text-gray-600">
                          <TranslatedText text="Quantity" />: {extra.quantity} ×{" "}
                          {extra.price === 0 ? (
                            <TranslatedText text="Free" />
                          ) : (
                            `€${extra.price}`
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        {extra.price === 0 ? (
                          <span className="text-xs font-medium text-gray-500">
                            <TranslatedText text="INCLUDED" />
                          </span>
                        ) : (
                          <div className="font-bold text-black">
                            €{formatCurrency(extra.price * extra.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-gray-300 flex items-center justify-between">
                    <span className="font-semibold text-black">
                      <TranslatedText text="Subtotal Extras" />
                    </span>
                    <span className="text-lg font-bold text-black">
                      €{formatCurrency(bookingData.extras?.totalCost)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center border border-dashed border-gray-300 rounded">
                  <p className="text-sm text-gray-500">
                    <TranslatedText text="No extras selected for this booking" />
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Cost Breakdown */}
          <Card className="border border-gray-300 bg-white">
            <CardHeader className="pb-3 border-b border-gray-200">
              <CardTitle className="text-lg font-bold text-black">
                <TranslatedText text="Payment Summary" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {bookingData.priceBreakdown ? (
                <div className="space-y-3">
                  {bookingData.priceBreakdown.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        <TranslatedText text={item.description} />
                        {item.quantity && item.quantity > 1
                          ? ` (x${item.quantity})`
                          : ""}
                      </span>
                      <span className="font-semibold text-black">
                        €{formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}

                  <div className="border-t border-[#6AAD3C]/20 my-3"></div>

                  <div className="flex items-center justify-between p-3 bg-[#6AAD3C] text-white rounded">
                    <div>
                      <p className="text-xs font-medium uppercase">
                        <TranslatedText text="Total Amount Paid" />
                      </p>
                      <p className="text-xs opacity-80">
                        {bookingData.travelers?.totalCount}{" "}
                        <TranslatedText text="Traveler" />
                        {bookingData.travelers?.totalCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        €{formatCurrency(bookingData.priceBreakdown.totalCost)}
                      </p>
                      <p className="text-xs opacity-80">
                        €
                        {formatCurrency(
                          bookingData.priceBreakdown.totalCost /
                            (bookingData.travelers?.totalCount || 1),
                        )}{" "}
                        / person
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 italic">
                    Detailed breakdown unavailable for legacy booking
                  </div>
                  <div className="border-t border-[#6AAD3C]/20 my-3"></div>
                  <div className="flex items-center justify-between p-3 bg-[#6AAD3C] text-white rounded">
                    <div>
                      <p className="text-xs font-medium uppercase">
                        <TranslatedText text="Total Amount Paid" />
                      </p>
                      <p className="text-xs opacity-80">
                        {bookingData.travelers?.totalCount}{" "}
                        <TranslatedText text="Traveler" />
                        {bookingData.travelers?.totalCount > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        €{formatCurrency(Number(bookingData.totalCost))}
                      </p>
                      <p className="text-xs opacity-80">
                        €
                        {formatCurrency(
                          Number(bookingData.totalCost) /
                            (bookingData.travelers?.totalCount || 1),
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
          <Card className="border border-gray-300 bg-white">
            <CardHeader className="pb-0 p-0">
              <button
                onClick={() => setIsTravelersExpanded(!isTravelersExpanded)}
                className="flex items-center justify-between w-full p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-left">
                  <CardTitle className="text-lg font-bold text-black">
                    All Travelers Information
                  </CardTitle>
                  <p className="text-xs text-gray-500 font-medium">
                    {bookingData.travelers?.all?.length || 0}{" "}
                    <TranslatedText text="People Registered" />
                  </p>
                </div>
                <div
                  className={`transition-transform ${isTravelersExpanded ? "rotate-180" : ""}`}
                >
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                </div>
              </button>
            </CardHeader>
            {isTravelersExpanded && (
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="border-t border-gray-200 mb-4"></div>

                {/* Previous Travel Info */}
                {bookingData.previousTravelInfo && (
                  <div className="p-3 bg-gray-50 rounded border border-gray-200 mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                      Previous Travel Experience
                    </p>
                    <p className="text-sm text-gray-700">
                      {bookingData.previousTravelInfo}
                    </p>
                  </div>
                )}

                {bookingData.travelers?.all &&
                bookingData.travelers.all.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {bookingData.travelers.all.map(
                      (traveler: any, index: number) => (
                        <div
                          key={index}
                          className="p-4 rounded border border-gray-200 bg-white"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="font-semibold text-black">
                                {traveler.name}
                              </span>
                            </div>
                            {traveler.isPrimary && (
                              <span className="text-xs font-medium text-gray-500 uppercase">
                                <TranslatedText text="Primary Contact" />
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-['Poppins']">
                            {traveler.email && (
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                  <TranslatedText text="Email" />
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
                                  <TranslatedText text="Phone" />
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
                                  <TranslatedText text="Date of Birth" />
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
                      ),
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Users className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium font-['Poppins']">
                      <TranslatedText text="No additional traveler details available" />
                    </p>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Payment & Booking */}
          <Card className="border border-gray-300 bg-white">
            <CardHeader className="pb-3 border-b border-gray-200">
              <CardTitle className="text-lg font-bold text-black">
                <TranslatedText text="Payment & Timing" />
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    <TranslatedText text="Payment Method" />
                  </p>
                  <p className="text-sm font-semibold text-black capitalize">
                    <TranslatedText
                      text={bookingData.payment?.method || "N/A"}
                    />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    Payment Status
                  </p>
                  <p className="text-sm font-semibold text-black capitalize">
                    <TranslatedText
                      text={bookingData.payment?.status || "N/A"}
                    />
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">
                    <TranslatedText text="Booking Date" />
                  </p>
                  <p className="text-sm font-semibold text-black">
                    {formatDate(bookingData.createdAt)}{" "}
                    {formatTime(bookingData.createdAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GoGame Internal Management */}
          <Card className="border border-gray-300 bg-white mt-4">
            <CardHeader className="pb-3 border-b border-gray-200 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-black">
                <TranslatedText text="GoGame Internal Management" />
              </CardTitle>
              <span className="text-xs font-medium text-gray-500 uppercase">
                <TranslatedText text="Admin Only" />
              </span>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="p-3 bg-gray-50 rounded border border-gray-200">
                <p className="text-xs text-gray-600">
                  <TranslatedText text="Reveal destination and match details to customers 48 hours before departure. Ensure these fields are filled before approving the booking." />
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    <TranslatedText text="Destination City" /> *
                  </label>
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => {
                      setDestinationCity(e.target.value);
                    }}
                    placeholder="e.g., London, Paris, Milan"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#6AAD3C] focus:border-[#6AAD3C] outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    <TranslatedText text="Assigned Match" /> *
                  </label>
                  <input
                    type="text"
                    value={assignedMatch}
                    onChange={(e) => {
                      setAssignedMatch(e.target.value);
                    }}
                    placeholder="e.g., Real Madrid vs Barcelona"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-[#6AAD3C] focus:border-[#6AAD3C] outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-[#6AAD3C]/20 flex items-center justify-end gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {(status === "pending" ||
              (status !== "confirmed" &&
                status !== "completed" &&
                status !== "rejected")) && (
              <Button
                onClick={async () => {
                  if (isProcessing) return;

                  if (!destinationCity.trim() || !assignedMatch.trim()) {
                    const title = await translateText("Missing Details");
                    const description = await translateText(
                      "Please fill in Destination City and Assigned Match before approving.",
                    );
                    addToast({
                      type: "error",
                      title,
                      description,
                    });
                    return;
                  }

                  setIsProcessing(true);
                  try {
                    await updateBooking({
                      id: bookingData.id || bookingData._id,
                      destinationCity: destinationCity.trim(),
                      assignedMatch: assignedMatch.trim(),
                      status: "confirmed",
                    });

                    const title = await translateText("Booking Approved");
                    const description = await translateText(
                      "Booking has been confirmed and user notified.",
                    );
                    addToast({
                      type: "success",
                      title,
                      description,
                    });

                    setStatus("confirmed");

                    if (onStatusUpdate) onStatusUpdate();
                    setIsOpen(false);
                  } catch {
                    const title = await translateText("Approval Failed");
                    const description = await translateText(
                      "Could not approve booking.",
                    );
                    addToast({
                      type: "error",
                      title,
                      description,
                    });
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                className="bg-[#6AAD3C] hover:bg-[#5a9332] text-white px-6 py-2 rounded font-semibold transition-all"
              >
                <TranslatedText text="Approve Booking" />
              </Button>
            )}

            {status !== "rejected" && (
              <Button
                onClick={async () => {
                  if (isProcessing) return;
                  const confirmMsg = await translateText(
                    "Are you sure you want to reject this booking? This will mark it as rejected.",
                  );
                  if (!confirm(confirmMsg)) return;

                  setIsProcessing(true);
                  try {
                    await updateBooking({
                      id: bookingData.id || bookingData._id,
                      status: "rejected",
                    });
                    const title = await translateText("Booking Rejected");
                    const description = await translateText(
                      "The booking has been manually rejected.",
                    );
                    addToast({
                      type: "warning",
                      title,
                      description,
                    });

                    // Optimistic update
                    setStatus("rejected");

                    if (onStatusUpdate) onStatusUpdate();
                    setIsOpen(false);
                  } catch {
                    const title = await translateText("Action Failed");
                    const description = await translateText(
                      "Could not reject booking.",
                    );
                    addToast({
                      type: "error",
                      title,
                      description,
                    });
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                disabled={isProcessing}
                variant="destructive"
                className="bg-white hover:bg-gray-50 text-red-600 border border-red-300 px-6 py-2 rounded font-semibold transition-all"
              >
                <TranslatedText text="Reject Booking" />
              </Button>
            )}

            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              className="text-gray-600 hover:text-[#6AAD3C] hover:bg-[#F1F9EC] px-6 py-2 rounded font-medium transition-all"
            >
              <TranslatedText text="Close" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
