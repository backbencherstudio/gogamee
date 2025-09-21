"use client"

import { useState, useEffect, useCallback } from "react"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface BookingData {
  id: number
  status: "pending" | "completed" | "cancelled"
  selectedSport: string
  selectedPackage: string
  selectedCity: string
  selectedLeague: string
  adults: number
  kids: number
  babies: number
  totalPeople: number
  departureDate: string
  returnDate: string
  departureDateFormatted: string
  returnDateFormatted: string
  departureTimeStart: number
  departureTimeEnd: number
  arrivalTimeStart: number
  arrivalTimeEnd: number
  departureTimeRange: string
  arrivalTimeRange: string
  removedLeagues: { id: string; name: string; country: string }[]
  removedLeaguesCount: number
  hasRemovedLeagues: boolean
  allExtras: {
    id: string
    name: string
    description: string
    price: number
    icon: string
    isSelected: boolean
    quantity: number
    maxQuantity?: number
    isIncluded?: boolean
    currency: string
  }[]
  selectedExtras: {
    id: string
    name: string
    description: string
    price: number
    icon: string
    isSelected: boolean
    quantity: number
    maxQuantity?: number
    isIncluded?: boolean
    currency: string
  }[]
  selectedExtrasNames: string[]
  totalExtrasCost: number
  extrasCount: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  paymentMethod: string
  cardNumber: string | null
  expiryDate: string | null
  cvv: string | null
  cardholderName: string | null
  bookingTimestamp: string
  bookingDate: string
  bookingTime: string
  isBookingComplete: boolean
  travelDuration: number
  hasFlightPreferences: boolean
  requiresEuropeanLeagueHandling: boolean
  previousTravelInfo?: string
  destinationCity?: string
  assignedMatch?: string
}

interface BookingSummaryModalProps {
  bookingData: BookingData
  onStatusUpdate?: () => void
}

export default function BookingSummaryModal({ bookingData, onStatusUpdate }: BookingSummaryModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [destinationCity, setDestinationCity] = useState(bookingData.destinationCity || "")
  const [assignedMatch, setAssignedMatch] = useState(bookingData.assignedMatch || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Update local state when bookingData changes
  const updateLocalState = useCallback(() => {
    setDestinationCity(bookingData.destinationCity || "")
    setAssignedMatch(bookingData.assignedMatch || "")
    setHasChanges(false) // Reset changes flag when data is updated
  }, [bookingData.destinationCity, bookingData.assignedMatch])

  // Update local state when component mounts or bookingData changes
  useEffect(() => {
    updateLocalState()
  }, [updateLocalState])

  // Check for changes when input values change
  useEffect(() => {
    const currentDestinationCity = bookingData.destinationCity || ""
    const currentAssignedMatch = bookingData.assignedMatch || ""
    
    const hasChangesNow = destinationCity !== currentDestinationCity || assignedMatch !== currentAssignedMatch
    setHasChanges(hasChangesNow)
  }, [destinationCity, assignedMatch, bookingData.destinationCity, bookingData.assignedMatch])

  // Force update local state when modal opens to ensure fresh data
  useEffect(() => {
    if (isOpen) {
      updateLocalState()
    }
  }, [isOpen, updateLocalState])

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
                              <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">Booking Summary #{bookingData.id}</DialogTitle>
              <DialogDescription className="text-gray-600">Review your complete booking details</DialogDescription>
            </div>
                          <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className={
                    bookingData.status === "completed" 
                      ? "bg-green-100 text-green-800" 
                      : bookingData.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }
                >
                  {bookingData.status === "completed" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Confirmed
                    </>
                  ) : bookingData.status === "cancelled" ? (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Rejected
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>
          </div>
          
                      {/* Status Information Card */}
            <div className={`mt-4 p-4 rounded-lg border ${
              bookingData.status === "completed" 
                ? "bg-green-50 border-green-200" 
                : bookingData.status === "cancelled"
                ? "bg-red-50 border-red-200"
                : "bg-yellow-50 border-yellow-200"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${
                  bookingData.status === "completed" 
                    ? "bg-green-500" 
                    : bookingData.status === "cancelled"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}></div>
                <div className="text-sm">
                  <span className="font-medium">Current Status:</span>{" "}
                  <span className={`font-semibold ${
                    bookingData.status === "completed" 
                      ? "text-green-700" 
                      : bookingData.status === "cancelled"
                      ? "text-red-700"
                      : "text-yellow-700"
                  }`}>
                    {bookingData.status === "completed" ? "✅ Confirmed" : 
                     bookingData.status === "cancelled" ? "❌ Rejected" : "⏳ Pending"}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {bookingData.status === "pending" 
                  ? "This booking is waiting for approval"
                  : bookingData.status === "completed"
                  ? "This booking has been confirmed and is active"
                  : "This booking has been rejected and is no longer active"
                }
              </div>
            </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Overview */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Ticket className="h-4 w-4 text-blue-600" />
                </div>
                Trip Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Sport</p>
                    <p className="font-medium text-gray-900 capitalize">{bookingData.selectedSport}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Package className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Package</p>
                    <p className="font-medium text-gray-900 capitalize">{bookingData.selectedPackage}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Departure City</p>
                    <p className="font-medium text-gray-900 capitalize">{bookingData.selectedCity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Destination City</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {bookingData.destinationCity ? bookingData.destinationCity : "Not assigned yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Competition</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {bookingData.selectedLeague === 'european' ? 'European' : 
                       bookingData.selectedLeague === 'national' ? 'National' : 
                       bookingData.selectedLeague}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Trophy className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Assigned Match</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {bookingData.assignedMatch ? bookingData.assignedMatch : "Not assigned yet"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Travel Dates */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-green-600" />
                </div>
                Travel Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Departure</p>
                    <p className="font-medium text-gray-900">{bookingData.departureDateFormatted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Return</p>
                    <p className="font-medium text-gray-900">{bookingData.returnDateFormatted}</p>
                  </div>
                </div>
                {bookingData.hasFlightPreferences && (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Departure Time</p>
                        <p className="font-medium text-gray-900">{bookingData.departureTimeRange}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Arrival Time</p>
                        <p className="font-medium text-gray-900">{bookingData.arrivalTimeRange}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Passengers */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-purple-600" />
                </div>
                Passengers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{bookingData.adults}</p>
                  <p className="text-sm text-gray-500">Adults</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{bookingData.kids}</p>
                  <p className="text-sm text-gray-500">Kids</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{bookingData.babies}</p>
                  <p className="text-sm text-gray-500">Babies</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-900">{bookingData.totalPeople}</p>
                  <p className="text-sm text-blue-600">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Excluded Competitions */}
          {bookingData.hasRemovedLeagues && bookingData.removedLeagues.length > 0 && (
            <Card className="border border-red-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="h-4 w-4 text-red-600" />
                  </div>
                  Excluded Competitions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bookingData.removedLeagues.map((league) => (
                    <div key={league.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-gray-900">
                        {league.name} <span className="text-gray-600">({league.country})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Selected Extras */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                Selected Extras
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingData.selectedExtras.length > 0 ? (
                <div className="space-y-4">
                  {bookingData.selectedExtras.map((extra) => (
                    <div
                      key={extra.id}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{extra.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {extra.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {extra.price === 0 ? (
                          <Badge className="bg-green-600 text-white">Included</Badge>
                        ) : (
                          <div className="flex items-center gap-1 font-semibold text-gray-900">
                            <Euro className="h-4 w-4" />
                            {extra.price * extra.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                    <span className="text-lg font-semibold text-gray-900">Total Extras Cost</span>
                    <div className="flex items-center gap-1 text-xl font-bold text-gray-900">
                      <Euro className="h-5 w-5" />
                      {bookingData.totalExtrasCost}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No extras selected</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total Cost Breakdown */}
          <Card className="border border-blue-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Euro className="h-4 w-4 text-blue-600" />
                </div>
                Total Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                // Calculate package price based on sport, package type, and travel duration
                const getPackagePrice = (sport: string, packageType: string, nights: number): number => {
                  const sportPrices: Record<string, Record<string, Record<number, number>>> = {
                    "football": {
                      "standard": { 1: 299, 2: 379, 3: 459, 4: 529 },
                      "premium": { 1: 1299, 2: 1499, 3: 1699, 4: 1899 }
                    },
                    "basketball": {
                      "standard": { 1: 279, 2: 359, 3: 439, 4: 509 },
                      "premium": { 1: 1279, 2: 1479, 3: 1679, 4: 1859 }
                    }
                  };
                  
                  const sportData = sportPrices[sport.toLowerCase()];
                  if (!sportData) return 0;
                  
                  const packageData = sportData[packageType.toLowerCase()];
                  if (!packageData) return 0;
                  
                  // Get price for the number of nights, or use the highest available if nights exceed 4
                  const maxNights = Math.max(...Object.keys(packageData).map(Number));
                  const nightsToUse = Math.min(nights, maxNights);
                  
                  return packageData[nightsToUse] || 0;
                };

                // Calculate league surcharge
                const getLeagueSurcharge = (league: string): number => {
                  return league === 'european' ? 50 : 0;
                };

                const packagePrice = getPackagePrice(bookingData.selectedSport, bookingData.selectedPackage, bookingData.travelDuration);
                const leagueSurcharge = getLeagueSurcharge(bookingData.selectedLeague);
                const extrasCost = bookingData.totalExtrasCost;
                const totalCost = packagePrice + leagueSurcharge + extrasCost;

                return (
                  <div className="space-y-4">
                    {/* Package Price */}
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {bookingData.selectedPackage.charAt(0).toUpperCase() + bookingData.selectedPackage.slice(1)} Package
                          </p>
                          <p className="text-sm text-gray-600">
                            {bookingData.selectedSport} • {bookingData.travelDuration} night{bookingData.travelDuration > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                        <Euro className="h-4 w-4" />
                        {packagePrice}
                      </div>
                    </div>

                    {/* League Surcharge */}
                    {leagueSurcharge > 0 && (
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="font-medium text-gray-900">European Competition Surcharge</p>
                            <p className="text-sm text-gray-600">Additional cost for European leagues</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                          <Euro className="h-4 w-4" />
                          {leagueSurcharge}
                        </div>
                      </div>
                    )}

                    {/* Extras Cost */}
                    {extrasCost > 0 && (
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-gray-900">Selected Extras</p>
                            <p className="text-sm text-gray-600">{bookingData.extrasCount} extra service{bookingData.extrasCount > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                          <Euro className="h-4 w-4" />
                          {extrasCost}
                        </div>
                      </div>
                    )}

                    {/* Total Cost */}
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Euro className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-gray-900">Total Cost</p>
                          <p className="text-sm text-gray-600">For {bookingData.totalPeople} traveler{bookingData.totalPeople > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-3xl font-bold text-blue-900">
                        <Euro className="h-8 w-8" />
                        {totalCost}
                      </div>
                    </div>

                    {/* Cost per person */}
                    <div className="text-center p-3 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Cost per person:</span> 
                        <span className="font-semibold text-gray-900 ml-1">
                          <Euro className="h-3 w-3 inline mr-1" />
                          {Math.round(totalCost / bookingData.totalPeople)}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-4 w-4 text-indigo-600" />
                </div>
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900 truncate">{bookingData.fullName}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 truncate">{bookingData.email}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900 truncate">{bookingData.phone}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-yellow-800 font-medium">Previous Travel Experience</p>
                    <p className="font-medium text-gray-900 text-sm leading-relaxed">{bookingData.previousTravelInfo && bookingData.previousTravelInfo.trim() ? bookingData.previousTravelInfo : 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Booking */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-orange-600" />
                </div>
                Payment & Booking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium text-gray-900 capitalize truncate">{bookingData.paymentMethod}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Booking Date</p>
                    <p className="font-medium text-gray-900 truncate">{bookingData.bookingDate}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-500">Booking Time</p>
                    <p className="font-medium text-gray-900 truncate">{bookingData.bookingTime}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GoGame Internal Management */}
          <Card className="border border-blue-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-blue-600" />
                </div>
                GoGame Internal Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                             <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                 <p className="text-sm text-blue-800">
                   <strong>Note:</strong> These fields are for GoGame internal management only.
                   The destination city and match details will be revealed to customers 48 hours before departure
                   as part of the surprise experience. Please fill these in before approving the booking.
                 </p>
               </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Destination City *
                  </label>
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="Enter destination city (e.g., London, Paris, Milan)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    The city where the customer will travel to (surprise destination)
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Assigned Match *
                  </label>
                  <input
                    type="text"
                    value={assignedMatch}
                    onChange={(e) => setAssignedMatch(e.target.value)}
                    placeholder="Enter match details (e.g., Real Madrid vs Barcelona)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    The specific match the customer will attend
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  onClick={async () => {
                    if (!destinationCity.trim() || !assignedMatch.trim()) {
                      alert("Please fill in both destination city and assigned match fields")
                      return
                    }
                    
                    setIsUpdating(true)
                    try {
                      // Import AppData dynamically to avoid SSR issues
                      const { default: AppData } = await import('../../../../lib/appdata')
                      
                      // Find the booking by matching the data
                      const bookingToUpdate = AppData.bookings.all.find(booking => 
                        booking.fullName === bookingData.fullName &&
                        booking.email === bookingData.email &&
                        booking.phone === bookingData.phone &&
                        Math.abs(new Date(booking.bookingTimestamp).getTime() - new Date(bookingData.bookingTimestamp).getTime()) < 60000
                      )
                      
                      if (bookingToUpdate) {
                        // Update booking with destination city and assigned match
                        AppData.bookings.update(bookingToUpdate.id, { 
                          destinationCity: destinationCity.trim(),
                          assignedMatch: assignedMatch.trim()
                        })
                        console.log('✅ Destination and match details updated successfully')
                        alert('✅ Destination and match details updated successfully!')
                        
                        // Update local state with the new values and disable button
                        setDestinationCity(destinationCity.trim())
                        setAssignedMatch(assignedMatch.trim())
                        setHasChanges(false) // Disable button after successful update
                        
                        // Refresh parent component to show updated data
                        if (onStatusUpdate) {
                          onStatusUpdate()
                        }
                        
                        // Force refresh the booking data to ensure UI shows updated values
                        const updatedBooking = AppData.bookings.getById(bookingToUpdate.id)
                        if (updatedBooking) {
                          // Update the bookingData prop by triggering a re-render
                          // This ensures the display fields show the updated values
                          setTimeout(() => {
                            updateLocalState()
                          }, 100)
                        }
                      } else {
                        console.error('❌ Could not find booking to update')
                        alert('❌ Error: Could not find booking to update')
                      }
                    } catch (error) {
                      console.error('❌ Error updating destination and match:', error)
                      alert('❌ Error updating destination and match. Please try again.')
                    } finally {
                      setIsUpdating(false)
                    }
                  }}
                                     disabled={isUpdating || !destinationCity.trim() || !assignedMatch.trim() || !hasChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                                     {isUpdating ? 'Updating...' : hasChanges ? 'Update Details' : 'No Changes'}
                </Button>
                

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                  Booking ID:{" "}
                  <span className="font-mono font-medium text-gray-900">#{bookingData.id}</span>
                  {" | "}
                  Status:{" "}
                  <span className={`font-medium ${
                    bookingData.status === "completed" 
                      ? "text-green-600" 
                      : bookingData.status === "cancelled"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}>
                    {bookingData.status === "completed" ? "Confirmed" : 
                     bookingData.status === "cancelled" ? "Rejected" : "Pending"}
                  </span>
                </div>
                          <div className="flex flex-col gap-3">
                <div className="text-xs text-gray-500 text-center">
                  {bookingData.status === "pending" 
                    ? (!destinationCity.trim() || !assignedMatch.trim()) 
                      ? "⚠️ Please fill in destination city and assigned match before approving"
                      : "Click Approve to confirm this booking, or Reject to cancel it"
                    : bookingData.status === "completed"
                    ? "✅ This booking has been confirmed and cannot be modified"
                    : "❌ This booking has been rejected and cannot be modified"
                  }
                </div>
                <div className="flex items-center gap-3">
                  {/* Only show Approve/Reject buttons for pending bookings */}
                  {bookingData.status === "pending" && (
                    <>
                      <Button 
                        onClick={async () => {
                          if (isProcessing) return
                          
                          setIsProcessing(true)
                          try {
                            // Import AppData dynamically to avoid SSR issues
                            const { default: AppData } = await import('../../../../lib/appdata')
                            
                            // Find the booking by matching the data (more robust matching)
                            const bookingToUpdate = AppData.bookings.all.find(booking => 
                              booking.fullName === bookingData.fullName &&
                              booking.email === bookingData.email &&
                              booking.phone === bookingData.phone &&
                              Math.abs(new Date(booking.bookingTimestamp).getTime() - new Date(bookingData.bookingTimestamp).getTime()) < 60000 // Within 1 minute
                            )
                            
                            if (bookingToUpdate) {
                              // Update booking status to completed
                              AppData.bookings.update(bookingToUpdate.id, { status: "completed" })
                              console.log('✅ Booking approved and status updated to completed')
                              
                              // Send confirmation email automatically
                              try {
                                const result = await AppData.emailTemplates.sendConfirmationEmail(bookingToUpdate)
                                console.log('✅ Confirmation email sent automatically:', result)
                              } catch (emailError) {
                                console.error('❌ Error sending automatic confirmation email:', emailError)
                              }
                              
                              // Show success message
                              alert('✅ Booking approved successfully! Status updated to completed and confirmation email sent.')
                              
                              // Refresh parent component to show updated data
                              if (onStatusUpdate) {
                                onStatusUpdate()
                              }
                            } else {
                              console.error('❌ Could not find booking to update')
                              alert('❌ Error: Could not find booking to update')
                            }
                          } catch (error) {
                            console.error('❌ Error approving booking:', error)
                            alert('❌ Error approving booking. Please try again.')
                          } finally {
                            setIsProcessing(false)
                            setIsOpen(false)
                          }
                        }} 
                        disabled={isProcessing || !destinationCity.trim() || !assignedMatch.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : '✓ Approve'}
                      </Button>
                      <Button 
                        onClick={async () => {
                          if (isProcessing) return
                          
                          setIsProcessing(true)
                          try {
                            // Import AppData dynamically to avoid SSR issues
                            const { default: AppData } = await import('../../../../lib/appdata')
                            
                            // Find the booking by matching the data (more robust matching)
                            const bookingToUpdate = AppData.bookings.all.find(booking => 
                              booking.fullName === bookingData.fullName &&
                              booking.email === bookingData.email &&
                              booking.phone === bookingData.phone &&
                              Math.abs(new Date(booking.bookingTimestamp).getTime() - new Date(bookingData.bookingTimestamp).getTime()) < 60000 // Within 1 minute
                            )
                            
                            if (bookingToUpdate) {
                              // Update booking status to cancelled
                              AppData.bookings.update(bookingToUpdate.id, { status: "cancelled" })
                              console.log('✅ Booking rejected and status updated to cancelled')
                              
                              // Send rejection email automatically
                              try {
                                const result = await AppData.emailTemplates.sendConfirmationEmail(bookingToUpdate)
                                console.log('✅ Rejection email sent automatically:', result)
                              } catch (emailError) {
                                console.error('❌ Error sending automatic rejection email:', emailError)
                              }
                              
                              // Show success message
                              alert('✅ Booking rejected successfully! Status updated to cancelled and rejection email sent.')
                              
                              // Refresh parent component to show updated data
                              if (onStatusUpdate) {
                                onStatusUpdate()
                              }
                            } else {
                              console.error('❌ Could not find booking to update')
                              alert('❌ Error: Could not find booking to update')
                            }
                          } catch (error) {
                            console.error('❌ Error rejecting booking:', error)
                            alert('❌ Error rejecting booking. Please try again.')
                          } finally {
                            setIsProcessing(false)
                            setIsOpen(false)
                          }
                        }} 
                        disabled={isProcessing}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? 'Processing...' : '✕ Reject'}
                      </Button>
                    </>
                  )}
                  
                  {/* Show status-specific message for non-pending bookings */}
                  {bookingData.status !== "pending" && (
                    <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      bookingData.status === "completed" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {bookingData.status === "completed" 
                        ? "✅ This booking has been confirmed" 
                        : "❌ This booking has been rejected"}
                    </div>
                  )}
                  
                  <Button 
                    onClick={() => setIsOpen(false)} 
                    disabled={isProcessing}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
