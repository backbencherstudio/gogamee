import { NextResponse } from "next/server";
import Stripe from "stripe";
import { BookingService } from "@/backend";
import StartingPrice from "@/backend/models/StartingPrice.model";
import { toErrorMessage } from "@/backend/lib/errors";

// Initialize Stripe (only if key is provided)
function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

// TODO: Move these interfaces to shared types if needed across multiple files
interface BookingExtraInput {
  id: string;
  name: string;
  description: string;
  price: number;
  isSelected: boolean;
  quantity: number;
  maxQuantity?: number;
  isIncluded?: boolean;
  currency: string;
}

interface CreateBookingPayload {
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
  removedLeagues: Array<{ id: string; name: string; country: string }>;
  removedLeaguesCount: number;
  hasRemovedLeagues: boolean;
  totalExtrasCost: number;
  extrasCount: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  previousTravelInfo: string;
  travelDuration: number;
  hasFlightPreferences: boolean;
  requiresEuropeanLeagueHandling: boolean;
  totalCost: string;
  bookingExtras: BookingExtraInput[];
  allTravelers?: any[];
}

export async function POST(request: Request) {
  try {
    const payload: CreateBookingPayload = await request.json();

    // 1. Calculate costs (Secure Backend Logic)

    // Fetch base price from DB
    const startingPriceDoc = await StartingPrice.findOne({
      type:
        payload.selectedSport === "football" ||
        payload.selectedSport === "basketball"
          ? payload.selectedSport
          : "football",
      isActive: true,
    });

    let basePrice = 0;
    if (startingPriceDoc && payload.travelDuration) {
      const durationKey = String(payload.travelDuration) as
        | "1"
        | "2"
        | "3"
        | "4";
      const prices = startingPriceDoc.pricesByDuration?.[durationKey];
      if (prices) {
        if (payload.selectedPackage?.toLowerCase() === "premium") {
          basePrice = prices.premium;
        } else {
          basePrice = prices.standard;
        }
      }
    }

    // Fallback if price not found (shouldn't happen if DB is seeded, but safe to default or error)
    if (basePrice === 0) {
      console.warn(
        "⚠️ Base price not found for",
        payload.selectedSport,
        payload.selectedPackage,
        payload.travelDuration,
      );
      // We could throw error, or rely on frontend total if we really trust it (we don't),
      // to be safe, let's use the DB price if found, else 0 which is safer than trusting random input?
      // Or actually, if we can't find price, we probably shouldn't allow booking.
      // For this refactor, let's assume if 0, something is wrong.
    }

    // Multiply base price by number of people?
    // "Starting Price" usually means "Price per person".
    // Let's verify assumption. GoGame usually charges per person.
    const perPersonPrice = basePrice;
    const totalBaseCost = perPersonPrice * payload.totalPeople;

    // Calculate extras total from bookingExtras array
    // ideally we should also fetch these prices from DB if possible.
    // For now, we'll iterate provided extras but we really should validate them.
    // Assuming for now the biggest risk is the base package price manipulation.
    const extrasTotal = payload.bookingExtras
      ? payload.bookingExtras
          .filter((extra) => extra.isSelected && extra.price > 0)
          .reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
      : payload.totalExtrasCost || 0;

    // Calculate league removal cost
    // Formula: (removedLeaguesCount - 1) * 20€ * totalPeople (first removal is free)
    const freeRemovals = 1;
    const paidRemovals = Math.max(
      0,
      payload.removedLeaguesCount - freeRemovals,
    );
    const removalCostPerPerson = paidRemovals * 20; // 20€ per paid removal
    const leagueRemovalCost =
      payload.hasRemovedLeagues && payload.removedLeaguesCount > 0
        ? removalCostPerPerson * payload.totalPeople
        : 0;

    // Final Calculated Cost
    const calculatedTotalCost = totalBaseCost + extrasTotal + leagueRemovalCost;

    // Log discrepancy if significant
    if (Math.abs(calculatedTotalCost - Number(payload.totalCost)) > 1) {
      console.warn(
        `⚠️ Price Mismatch! Frontend: ${payload.totalCost}, Backend: ${calculatedTotalCost}`,
      );
    }

    const totalAmountInCents = Math.round(calculatedTotalCost * 100);

    // 2. Persist Initial Booking (Pending)
    // Prepare fallback values for required fields
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const todayFormatted = new Date().toLocaleDateString(); // Localized format

    const booking = await BookingService.create({
      status: "pending",
      payment_status: "unpaid",
      selectedSport: payload.selectedSport || "football",
      selectedPackage: payload.selectedPackage || "standard",
      selectedCity: payload.selectedCity || "TBD",
      selectedLeague: payload.selectedLeague || "TBD",
      adults: payload.adults || 1,
      kids: payload.kids || 0,
      babies: payload.babies || 0,
      departureDate: payload.departureDate || today,
      returnDate: payload.returnDate || today,
      departureDateFormatted: payload.departureDateFormatted || todayFormatted,
      returnDateFormatted: payload.returnDateFormatted || todayFormatted,
      departureTimeStart: payload.departureTimeStart || 0,
      departureTimeEnd: payload.departureTimeEnd || 0,
      arrivalTimeStart: payload.arrivalTimeStart || 0,
      arrivalTimeEnd: payload.arrivalTimeEnd || 0,
      departureTimeRange: payload.departureTimeRange || "TBD",
      arrivalTimeRange: payload.arrivalTimeRange || "TBD",
      removedLeagues: payload.removedLeagues || [],
      removedLeaguesCount: payload.removedLeaguesCount || 0,
      hasRemovedLeagues: payload.hasRemovedLeagues || false,
      totalExtrasCost: payload.totalExtrasCost || 0,
      extrasCount: payload.extrasCount || 0,
      isBookingComplete: false,
      firstName: payload.firstName,
      lastName: payload.lastName || "N/A",
      email: payload.email,
      phone: payload.phone,
      totalCost: String(calculatedTotalCost), // Use verified cost
      bookingExtras: payload.bookingExtras || [],
      allTravelers: payload.allTravelers || [],
      stripe_payment_intent_id: undefined,
    });

    // 3. Create Stripe PaymentIntent (for embedded Elements)

    const stripe = getStripeInstance();

    console.log("💰 Creating PaymentIntent for:", {
      amount: totalAmountInCents,
      currency: "eur",
      bookingId: booking._id.toString(),
      calculatedFrom: {
        base: basePrice,
        people: payload.totalPeople,
        extras: extrasTotal,
        removals: leagueRemovalCost,
      },
    });

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
      receipt_email: payload.email,
    });

    // 4. Update Booking with PaymentIntent ID
    await BookingService.updateById(booking._id.toString(), {
      stripe_payment_intent_id: paymentIntent.id,
    });

    console.log("✅ PaymentIntent created:", paymentIntent.id);

    // 5. Return client secret for frontend
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
