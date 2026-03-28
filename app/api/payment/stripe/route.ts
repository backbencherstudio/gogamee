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
  bookingId?: string; // Optional existing booking ID to update
  selectedSport: string;
  selectedPackage: string;
  selectedCity: string;

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
    cardholderName: string;
  };

  travelers: {
    list: Traveler[];
    totalCount: number;
    primaryContact: Traveler;
  };
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

    // Total people - Extracted from unified travelers structure
    const totalPeople = payload.travelers?.totalCount || 1;
    const babiesCount = (payload.travelers?.list || []).filter(t => t.type === "baby").length;

    // Duration extraction
    const durationDays = payload.duration?.days || 1;
    const durationNights = payload.duration?.nights ?? Math.max(0, durationDays - 1);

    // Extras for pricing
    const bookingExtras = (payload.extras || []).map((extra: any) => ({
      id: extra.id,
      name: extra.name,
      description: extra.description || "",
      price: extra.price,
      isSelected: extra.isSelected,
      quantity: extra.quantity,
      currency: extra.currency || "EUR",
    }));

    // Pricing Date Extraction
    let pricingDepartureDate = payload.departureDate;

    // Calculate Price Server-Side
    const priceBreakdown = await PricingService.calculatePrice({
      selectedSport: payload.selectedSport,
      selectedPackage: payload.selectedPackage,
      selectedLeague: isEuropeanCompetition ? "european" : "national",
      totalPeople: totalPeople,
      babiesCount: babiesCount,
      departureDate: pricingDepartureDate,
      travelDuration: durationDays,
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
    const travelersList = payload.travelers?.list || [];
    const primaryContact = payload.travelers?.primaryContact;

    // Age Validation for Primary Traveler
    if (primaryContact && primaryContact.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(primaryContact.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      if (age < 18) {
        return NextResponse.json(
          {
            message: "The main traveler must be over 18 years old",
          },
          { status: 400 },
        );
      }
    }

    // Determine League Category
    const selectedLeagueObj = leaguesList.find((l) => l.isSelected);
    let leagueCategory = "National";
    if (selectedLeagueObj) {
      if (selectedLeagueObj.group === "European") {
        leagueCategory = "European";
      } else if (selectedLeagueObj.group === "National") {
        leagueCategory = "National";
      }
    }

    // 2. Create or Update Booking Record
    const bookingData = {
      status: "pending",
      payment: {
        amount: calculatedTotalCost,
        currency: "eur",
        status: "pending",
      },

      // 1. Selection Core
      selection: {
        sport: payload.selectedSport || "football",
        package: payload.selectedPackage || "standard",
        city: payload.selectedCity || "TBD",
        league: leagueCategory,
      },

      // 2. Dates
      dates: {
        departure: payload.departureDate,
        return: payload.returnDate,
        durationDays: durationDays,
        durationNights: durationNights,
      },

      // 3. Travelers
      travelers: {
        list: travelersList,
        totalCount: totalPeople,
        primaryContact: primaryContact as any,
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

      // 8. Price Breakdown
      priceBreakdown: {
        ...priceBreakdown,
        items: priceBreakdown.breakdown, // Map 'breakdown' to 'items' for Mongoose
      },

      // Root level fields for compatibility and queries
      totalCost: calculatedTotalCost,
      isBookingComplete: false,
    };

    let booking;
    if (payload.bookingId) {
      // Update existing booking
      booking = await BookingService.updateById(payload.bookingId, bookingData);
      
      // If update fails (e.g. booking deleted), create a new one
      if (!booking) {
        booking = await BookingService.create(bookingData as any);
      }
    } else {
      // Create new booking
      booking = await BookingService.create(bookingData as any);
    }

    // 3. Create Stripe Payment Intent
    const stripe = getStripeInstance();
    const email = primaryContact?.email || "";
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: "eur",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: booking.id,
        sport: payload.selectedSport,
        package: payload.selectedPackage,
        city: payload.selectedCity,
      },
      description: `Booking for ${payload.selectedSport} - ${payload.selectedPackage}`,
      receipt_email: email,
    });

    // 4. Update Booking with Payment Intent
    await BookingService.updateById(booking.id, {
      "payment.stripePaymentIntentId": paymentIntent.id,
      "payment.status": "pending",
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
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
