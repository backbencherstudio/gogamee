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

export const mapBookingToLegacy = (booking: IBooking) => {
  const travelersList = booking.travelers?.list || [];

  const adults = travelersList.filter((t) => t.type === "adult");
  const kids = travelersList.filter((t) => t.type === "kid");
  const babies = travelersList.filter((t) => t.type === "baby");

  return {
    _id: booking._id,
    bookingReference: booking.bookingReference,
    status: booking.status,
    // Travelers
    adults: adults.length,
    kids: kids.length,
    babies: babies.length,
    totalPeople: booking.travelers.totalCount || travelersList.length,

    // Dates
    departureDate: booking.dates.departure,
    returnDate: booking.dates.return,
    departureDateFormatted:
      (booking as any).departureDateFormatted ||
      formatDate(booking.dates.departure),
    returnDateFormatted:
      (booking as any).returnDateFormatted || formatDate(booking.dates.return),

    // Flight
    departureTimeStart: booking.flight.preferences?.departureTimeStart,
    departureTimeEnd: booking.flight.preferences?.departureTimeEnd,
    arrivalTimeStart: booking.flight.preferences?.arrivalTimeStart,
    arrivalTimeEnd: booking.flight.preferences?.arrivalTimeEnd,
    departureTimeRange: booking.flight.schedule?.departureBetween,
    returnTimeRange: booking.flight.schedule?.returnBetween,

    // Contact
    contact: booking.travelers.primaryContact,
    email: booking.travelers.primaryContact?.email,
    phone: booking.travelers.primaryContact?.phone,
    firstName: booking.travelers.primaryContact?.name?.split(" ")[0] || "",
    lastName:
      booking.travelers.primaryContact?.name?.split(" ").slice(1).join(" ") ||
      "",

    // Flight (Raw - if needed for frontend specific logic)
    flight: booking.flight,

    // Metadata
    totalCost: booking.totalCost,
    priceBreakdown: booking.priceBreakdown,
    bookingExtras: booking.extras?.selected || [],
    totalExtrasCost: booking.extras?.totalCost || 0,
    extrasCount: booking.extras?.selected?.length || 0,
    allTravelers: travelersList || [], // Changed from travelers.all to travelersList

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
    travelDuration: booking.dates.durationDays || 0,
    hasFlightPreferences: booking.flight.preferences?.hasPreferences || false,
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
};
