import { NextResponse } from "next/server";
import { BookingService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getId(context: RouteContext) {
  const { id } = await context.params;
  return id;
}

export async function PATCH(request: Request, context: RouteContext) {
  const payload = await request.json();
  try {
    const id = await getId(context);
    const updated: any = await BookingService.updateById(id, payload);

    if (!updated) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    const mappedBooking = {
      id: updated._id.toString(),
      status: updated.status,
      payment_status: updated.payment_status,
      stripe_payment_intent_id: updated.stripe_payment_intent_id || null,
      selectedSport: updated.selectedSport,
      selectedPackage: updated.selectedPackage,
      selectedCity: updated.selectedCity,
      selectedLeague: updated.selectedLeague,
      adults: updated.adults,
      kids: updated.kids,
      babies: updated.babies,
      totalPeople: updated.totalPeople,
      departureDate: updated.departureDate,
      returnDate: updated.returnDate,
      departureDateFormatted: updated.departureDateFormatted,
      returnDateFormatted: updated.returnDateFormatted,
      departureTimeStart: updated.departureTimeStart,
      departureTimeEnd: updated.departureTimeEnd,
      arrivalTimeStart: updated.arrivalTimeStart,
      arrivalTimeEnd: updated.arrivalTimeEnd,
      departureTimeRange: updated.departureTimeRange,
      arrivalTimeRange: updated.arrivalTimeRange,
      removedLeagues: JSON.stringify(updated.removedLeagues || []),
      removedLeaguesCount: updated.removedLeagues?.length || 0,
      hasRemovedLeagues: (updated.removedLeagues?.length || 0) > 0,
      totalExtrasCost: updated.totalExtrasCost,
      extrasCount: updated.extrasCount,
      firstName: updated.firstName,
      lastName: updated.lastName,
      fullName: updated.fullName,
      email: updated.email,
      phone: updated.phone,
      paymentMethod: updated.paymentMethod || null,
      cardNumber: updated.cardNumber || null,
      expiryDate: updated.expiryDate || null,
      cvv: updated.cvv || null,
      cardholderName: updated.cardholderName || null,
      bookingTimestamp: updated.bookingTimestamp,
      bookingDate: updated.bookingDate,
      bookingTime: updated.bookingTime,
      isBookingComplete: updated.isBookingComplete,
      travelDuration: updated.travelDuration,
      hasFlightPreferences: updated.hasFlightPreferences,
      requiresEuropeanLeagueHandling: updated.requiresEuropeanLeagueHandling,
      destinationCity: updated.destinationCity || "",
      assignedMatch: updated.assignedMatch || "",
      previousTravelInfo: updated.previousTravelInfo || "",
      totalCost: updated.totalCost,
      approve_status: updated.approve_status || "pending",
      created_at: updated.createdAt,
      updated_at: updated.updatedAt,
      deleted_at: updated.deletedAt || null,
      bookingExtras: updated.bookingExtras,
      allTravelers: updated.allTravelers || undefined,
    };

    return NextResponse.json(mappedBooking, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Update booking error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to update booking") },
      { status: 500 }
    );
  }
}
