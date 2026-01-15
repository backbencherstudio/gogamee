import { NextResponse } from "next/server";
import { BookingService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { bookings } = await BookingService.getAll({
      limit: 1000, // Admin view
    });

    // Mapped to match legacy response format
    const mappedBookings = bookings.map((booking: any) => ({
      id: booking._id.toString(),
      status: booking.status,
      payment_status: booking.payment_status,
      stripe_payment_intent_id: booking.stripe_payment_intent_id || null,
      selectedSport: booking.selectedSport,
      selectedPackage: booking.selectedPackage,
      selectedCity: booking.selectedCity,
      selectedLeague: booking.selectedLeague,
      adults: booking.adults,
      kids: booking.kids,
      babies: booking.babies,
      totalPeople: booking.totalPeople,
      departureDate: booking.departureDate,
      returnDate: booking.returnDate,
      departureDateFormatted: booking.departureDateFormatted,
      returnDateFormatted: booking.returnDateFormatted,
      departureTimeStart: booking.departureTimeStart,
      departureTimeEnd: booking.departureTimeEnd,
      arrivalTimeStart: booking.arrivalTimeStart,
      arrivalTimeEnd: booking.arrivalTimeEnd,
      departureTimeRange: booking.departureTimeRange,
      arrivalTimeRange: booking.arrivalTimeRange,
      removedLeagues: JSON.stringify(booking.removedLeagues || []),
      removedLeaguesCount: booking.removedLeagues?.length || 0,
      hasRemovedLeagues: (booking.removedLeagues?.length || 0) > 0,
      totalExtrasCost: booking.totalExtrasCost,
      extrasCount: booking.extrasCount,
      firstName: booking.firstName,
      lastName: booking.lastName,
      fullName: booking.fullName,
      email: booking.email,
      phone: booking.phone,
      paymentMethod: booking.paymentMethod || null,
      cardNumber: booking.cardNumber || null,
      expiryDate: booking.expiryDate || null,
      cvv: booking.cvv || null,
      cardholderName: booking.cardholderName || null,
      bookingTimestamp: booking.bookingTimestamp,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      isBookingComplete: booking.isBookingComplete,
      travelDuration: booking.travelDuration,
      hasFlightPreferences: booking.hasFlightPreferences,
      requiresEuropeanLeagueHandling: booking.requiresEuropeanLeagueHandling,
      destinationCity: booking.destinationCity || "",
      assignedMatch: booking.assignedMatch || "",
      previousTravelInfo: booking.previousTravelInfo || "",
      totalCost: booking.totalCost,
      approve_status: booking.approve_status || "pending",
      created_at: booking.createdAt,
      updated_at: booking.updatedAt,
      deleted_at: booking.deletedAt || null,
      bookingExtras: booking.bookingExtras,
      allTravelers: booking.allTravelers || undefined,
    }));

    return NextResponse.json(
      {
        all: mappedBookings,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to fetch bookings") },
      { status: 500 }
    );
  }
}
