import { IBooking } from "../../models/Booking.model";

// Helper to format date to DD/MM/YYYY
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

export function mapBookingToLegacy(booking: IBooking): any {
  const travelers = booking.travelers || {};
  const primaryContact = travelers.primaryContact || {};
  const selection = booking.selection || {};
  const dates = booking.dates || {};
  const payment = booking.payment || {};
  const flight = booking.flight || {};

  return {
    id: booking._id.toString(),
    status: booking.status,
    payment_status: payment.status || (booking as any).payment_status,
    stripe_payment_intent_id:
      payment.stripePaymentIntentId ||
      (booking as any).stripe_payment_intent_id ||
      null,
    selectedSport: selection.sport || (booking as any).selectedSport,
    selectedPackage: selection.package || (booking as any).selectedPackage,
    selectedCity: selection.city || (booking as any).selectedCity,
    selectedLeague:
      (booking as any).selectedLeague ||
      (booking.leagues?.hasRemovedLeagues ? "National" : "European"), // Simplified approximation

    // Travelers
    adults: travelers.adults?.length || 0,
    kids: travelers.kids?.length || 0,
    babies: travelers.babies?.length || 0,
    totalPeople: travelers.totalCount || 0,

    // Dates
    departureDate: dates.departure,
    returnDate: dates.return,
    departureDateFormatted:
      (booking as any).departureDateFormatted || formatDate(dates.departure),
    returnDateFormatted:
      (booking as any).returnDateFormatted || formatDate(dates.return),

    // Flight
    departureTimeStart: flight.preferences?.departureTimeStart,
    departureTimeEnd: flight.preferences?.departureTimeEnd,
    arrivalTimeStart: flight.preferences?.arrivalTimeStart,
    arrivalTimeEnd: flight.preferences?.arrivalTimeEnd,
    departureTimeRange: flight.schedule?.departureBetween,
    arrivalTimeRange: flight.schedule?.returnBetween,

    // Contact Info
    firstName: primaryContact.name?.split(" ")[0] || "Guest",
    lastName: primaryContact.name?.split(" ").slice(1).join(" ") || "",
    fullName: primaryContact.name || "Guest",
    email: primaryContact.email || "",
    phone: primaryContact.phone || "",

    // Metadata
    totalCost: booking.totalCost,
    priceBreakdown: booking.priceBreakdown,
    bookingExtras: booking.extras?.selected || [],
    totalExtrasCost: booking.extras?.totalCost || 0,
    extrasCount: booking.extras?.selected?.length || 0,
    allTravelers: travelers.all || [],

    // Other legacy fields
    approve_status:
      (booking as any).approve_status ||
      (booking.status === "confirmed" ? "approved" : "pending"),
    isBookingComplete:
      (booking as any).isBookingComplete || booking.status === "completed",
    destinationCity: (booking as any).destinationCity || "",
    assignedMatch: (booking as any).assignedMatch || "",
    previousTravelInfo: (booking as any).previousTravelInfo || "",

    // Booking timestamp and date/time fields
    bookingTimestamp: (booking as any).createdAt || booking.createdAt,
    bookingDate: formatDate((booking as any).createdAt || booking.createdAt),
    bookingTime: (booking as any).createdAt
      ? new Date((booking as any).createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "",

    // Additional legacy fields
    travelDuration: dates.durationDays || 0,
    hasFlightPreferences: flight.preferences?.hasPreferences || false,
    requiresEuropeanLeagueHandling: !booking.leagues?.hasRemovedLeagues,
    removedLeagues: booking.leagues?.list || [],
    removedLeaguesCount: booking.leagues?.removedCount || 0,
    hasRemovedLeagues: booking.leagues?.hasRemovedLeagues || false,
    paymentMethod: (booking as any).paymentMethod || null,
    cardNumber: null,
    expiryDate: null,
    cvv: null,
    cardholderName: null,

    created_at: (booking as any).createdAt || booking.createdAt,
    updated_at: (booking as any).updatedAt || booking.updatedAt,
    deleted_at: (booking as any).deletedAt || null,
  };
}
