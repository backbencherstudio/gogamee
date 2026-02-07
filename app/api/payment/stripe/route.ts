import { NextResponse } from "next/server";
import Stripe from "stripe";
import { BookingService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";
import { PricingService } from "@/backend/services/pricing.service";

function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

// Interfaces matching Frontend BookingContext Structure
interface Traveler {
  id: string;
  type: "adult" | "kid" | "baby";
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  documentType: "Passport" | "ID";
  documentNumber: string;
  isPrimary?: boolean;
}

interface League {
  id: string;
  name: string;
  group: "National" | "European";
  country?: string;
  isSelected: boolean;
}

interface ExtraService {
  id: string;
  name: string;
  price: number;
  isSelected: boolean;
  quantity: number;
  isIncluded?: boolean;
}

interface CreateBookingPayload {
  selectedSport: string;
  selectedPackage: string;
  selectedCity: string;

  peopleCount: {
    adults: number;
    kids: number;
    babies: number;
  };

  travelers: {
    adults: Traveler[];
    kids: Traveler[];
    babies: Traveler[];
  };

  leagues: League[];

  departureDate: string;
  returnDate: string;
  duration: { days: number; nights: number };

  flightSchedule: {
    departure: { start: number; end: number; rangeLabel: string };
    arrival: { start: number; end: number; rangeLabel: string };
  } | null;

  extras: ExtraService[];

  paymentInfo: {
    cardNumber: string; // Not used here, handled by Stripe element usually but kept for flow
    cardholderName: string;
  };

  // Legacy/derived fields that might be passed (e.g. from earlier steps or hero)
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export async function POST(request: Request) {
  try {
    const payload: CreateBookingPayload = await request.json();

    // 1. Calculate Derived Values for Pricing
    const leaguesList = payload.leagues || [];
    const removedLeaguesCount = leaguesList.filter(
      (l) => l.group === "National" && !l.isSelected,
    ).length;
    const isEuropeanCompetition = leaguesList.some(
      (l) => l.group === "European" && l.isSelected,
    );

    // Total people
    const totalPeople =
      (payload.peopleCount.adults || 0) +
      (payload.peopleCount.kids || 0) +
      (payload.peopleCount.babies || 0);

    // Extras for pricing (flattened list of selected extras)
    const bookingExtras = payload.extras || [];

    // Calculate Price Server-Side
    const priceBreakdown = await PricingService.calculatePrice({
      selectedSport: payload.selectedSport,
      selectedPackage: payload.selectedPackage,
      selectedLeague: isEuropeanCompetition ? "european" : "national",
      totalPeople: totalPeople,
      departureDate: payload.departureDate,
      travelDuration: payload.duration?.days || 0,
      removedLeaguesCount: removedLeaguesCount,
      hasRemovedLeagues: removedLeaguesCount > 0,
      bookingExtras: bookingExtras,
      // Flight times
      departureTimeStart: payload.flightSchedule?.departure.start,
      departureTimeEnd: payload.flightSchedule?.departure.end,
      arrivalTimeStart: payload.flightSchedule?.arrival.start,
      arrivalTimeEnd: payload.flightSchedule?.arrival.end,
    });

    const calculatedTotalCost = priceBreakdown.totalCost;
    const totalAmountInCents = Math.round(calculatedTotalCost * 100);

    // 2. Prepare Data for Database
    const primaryAdult =
      payload.travelers.adults.find((a) => a.isPrimary) ||
      payload.travelers.adults[0];

    // Fallbacks for contact info
    const email = primaryAdult?.email || payload.email || "";
    // Phone might not be on primaryAdult if not specifically collected there in all flows, check payload
    const phone = primaryAdult?.phone || payload.phone || "";

    const fullName =
      primaryAdult?.name ||
      payload.firstName + " " + payload.lastName ||
      "Guest";
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ") || "N/A";

    // Flatten travelers for legacy 'allTravelers' field compatibility if needed,
    // but Booking Model now has structured 'travelers' object.

    // Create Booking Record
    const booking = await BookingService.create({
      status: "pending",
      payment_status: "unpaid",

      // 1. Selection Core
      selection: {
        sport: payload.selectedSport || "football",
        package: payload.selectedPackage || "standard",
        city: payload.selectedCity || "TBD",
      },

      // 2. Dates
      dates: {
        departure: payload.departureDate,
        return: payload.returnDate,
        durationDays: payload.duration?.days,
        durationNights: payload.duration?.nights,
      },

      // 3. Travelers
      travelers: {
        adults: payload.travelers.adults || [],
        kids: payload.travelers.kids || [],
        babies: payload.travelers.babies || [],
        totalCount: totalPeople,
        primaryContact: {
          name: fullName,
          email: email,
          phone: phone,
        },
      },

      // 4. Leagues
      leagues: {
        list: payload.leagues || [],
        removedCount: removedLeaguesCount,
        hasRemovedLeagues: removedLeaguesCount > 0,
      },

      // 5. Flight
      flight: {
        schedule: {
          departureBetween:
            payload.flightSchedule?.departure.rangeLabel || "TBD",
          returnBetween: payload.flightSchedule?.arrival.rangeLabel || "TBD",
        },
        preferences: {
          departureTimeStart: payload.flightSchedule?.departure.start,
          departureTimeEnd: payload.flightSchedule?.departure.end,
          arrivalTimeStart: payload.flightSchedule?.arrival.start,
          arrivalTimeEnd: payload.flightSchedule?.arrival.end,
          hasPreferences: !!payload.flightSchedule,
        },
      },

      // 6. Extras
      extras: {
        selected: bookingExtras,
        totalCost: priceBreakdown.extrasCost,
      },

      // 7. Payment Init
      payment: {
        amount: calculatedTotalCost,
        currency: "EUR",
        status: "pending",
      },

      // Root level required fields (mapped or duplicated for query performance)
      totalCost: calculatedTotalCost,
      isBookingComplete: false,
      stripe_payment_intent_id: undefined,

      // Legacy required fields to satisfy schema if strict (though we updated Schema, let's be safe)
      email: email,
      firstName: firstName || "Unknown",
      lastName: lastName,
      phone: phone,
    });

    // 3. Create Stripe Payment Intent
    const stripe = getStripeInstance();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: booking._id.toString(),
        sport: payload.selectedSport,
        package: payload.selectedPackage,
        city: payload.selectedCity,
      },
      description: `Booking for ${payload.selectedSport} - ${payload.selectedPackage}`,
      receipt_email: email,
    });

    // 4. Update Booking with Payment Intent
    await BookingService.updateById(booking._id.toString(), {
      "payment.stripePaymentIntentId": paymentIntent.id,
      stripe_payment_intent_id: paymentIntent.id,
    });

    console.log("✅ PaymentIntent created:", paymentIntent.id);

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      bookingId: booking._id.toString(),
      amount: totalAmountInCents / 100,
      currency: "eur",
    });
  } catch (error: unknown) {
    console.error("Create booking error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to create booking") },
      { status: 500 },
    );
  }
}
