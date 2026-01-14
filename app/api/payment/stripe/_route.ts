import { NextResponse } from "next/server";
import Stripe from "stripe";
import { BookingService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

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

    // 1. Calculate costs (Legacy Logic)

    // Calculate extras total from bookingExtras array
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
      payload.removedLeaguesCount - freeRemovals
    );
    const removalCostPerPerson = paidRemovals * 20; // 20€ per paid removal
    const leagueRemovalCost =
      payload.hasRemovedLeagues && payload.removedLeaguesCount > 0
        ? removalCostPerPerson * payload.totalPeople
        : 0;

    // Package cost = totalCost - extras - league removals
    const packageCost =
      Number(payload.totalCost) - extrasTotal - leagueRemovalCost;
    const packageCostInCents = Math.max(0, Math.round(packageCost * 100));

    // 2. Persist Initial Booking (Pending)
    const booking = await BookingService.create({
      status: "pending",
      payment_status: "unpaid",
      selectedSport: payload.selectedSport,
      selectedPackage: payload.selectedPackage,
      selectedCity: payload.selectedCity,
      selectedLeague: payload.selectedLeague,
      adults: payload.adults,
      kids: payload.kids,
      babies: payload.babies,
      departureDate: payload.departureDate,
      returnDate: payload.returnDate,
      departureDateFormatted: payload.departureDateFormatted,
      returnDateFormatted: payload.returnDateFormatted,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      totalCost: payload.totalCost,
      bookingExtras: payload.bookingExtras,
      allTravelers: payload.allTravelers,
      stripe_payment_intent_id: undefined,
    });

    // 3. Create Stripe Session

    // Get base URL
    const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
    const isLocalhost = envUrl?.includes("localhost");
    const baseUrl = isLocalhost
      ? "https://gogame-zeta.vercel.app" // Fallback for dev environment webhook/redirect testing
      : envUrl
      ? envUrl.startsWith("http")
        ? envUrl
        : `https://${envUrl}`
      : "https://gogame-zeta.vercel.app";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    // Add package as first line item
    if (packageCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: `${payload.selectedSport} - ${payload.selectedPackage} Package`,
            description: `Travel from ${payload.selectedCity} to ${payload.selectedLeague} league`,
          },
          unit_amount: packageCostInCents,
        },
        quantity: 1,
      });
    }

    // Add extras
    if (payload.bookingExtras && payload.bookingExtras.length > 0) {
      payload.bookingExtras.forEach((extra) => {
        if (extra.price > 0 && extra.isSelected) {
          lineItems.push({
            price_data: {
              currency: "eur",
              product_data: {
                name: extra.name,
                description: extra.description || "",
              },
              unit_amount: Math.round(extra.price * 100 * extra.quantity),
            },
            quantity: 1,
          });
        }
      });
    }

    // Add league removals
    if (leagueRemovalCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "League Removals",
            description: `${payload.removedLeaguesCount} league(s) removed`,
          },
          unit_amount: Math.round(leagueRemovalCost * 100),
        },
        quantity: 1,
      });
    }

    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}&booking_id=${booking._id}`,
      cancel_url: `${baseUrl}/?payment=cancelled&booking_id=${booking._id}`,
      customer_email: payload.email,
      metadata: {
        booking_id: booking._id.toString(),
        sport: payload.selectedSport,
        package: payload.selectedPackage,
        city: payload.selectedCity,
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 mins
    });

    // 4. Update Booking with Session ID
    await BookingService.updateById(booking._id.toString(), {
      stripe_payment_intent_id: session.id,
    });

    // 5. Return Stripe Session Response (matching legacy interface)
    return NextResponse.json({
      id: session.id,
      object: "checkout.session",
      url: session.url || "",
      amount_total:
        session.amount_total || Math.round(Number(payload.totalCost) * 100),
      currency: session.currency || "eur",
      status: session.status || "open",
      payment_status: session.payment_status || "unpaid",
      metadata: {
        booking_id: booking._id.toString(),
      },
    });
  } catch (error: unknown) {
    console.error("Create booking error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to create booking") },
      { status: 500 }
    );
  }
}
