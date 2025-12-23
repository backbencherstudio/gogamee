"use server";

import { randomUUID } from "crypto";
import Stripe from "stripe";
import { readStore, updateStore } from "../lib/jsonStore";
import {
  bookingStoreSchema,
  bookingSchema,
  type Booking,
  type BookingStore,
} from "../schemas";

const BOOKING_STORE_FILE = "bookings.json";

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

export interface BookingExtraInput {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  isSelected: boolean;
  quantity: number;
  maxQuantity?: number;
  isIncluded?: boolean;
  currency: string;
}

export interface TravelerInput {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  documentType?: string;
  documentNumber?: string;
  isPrimary?: boolean;
  travelerNumber?: number;
}

export interface CreateBookingPayload {
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
  allTravelers?: TravelerInput[];
}

export interface UpdateBookingPayload {
  id: string;
  status?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status?: string;
  [key: string]: unknown;
}

export interface BookingResponse {
  all: Booking[];
}

export interface StripeSessionResponse {
  id: string;
  object: string;
  url: string;
  amount_total: number;
  currency: string;
  status: string;
  payment_status: string;
  metadata: {
    booking_id: string;
  };
}

async function readBookings(): Promise<BookingStore> {
  const raw = await readStore(BOOKING_STORE_FILE);
  return bookingStoreSchema.parse(raw);
}

export async function getAllBookings(): Promise<BookingResponse> {
  const store = await readBookings();
  return {
    all: store.bookings,
  };
}

function buildNewBooking(
  payload: CreateBookingPayload,
  id: string,
  timestamp: number
): Booking {
  return bookingSchema.parse({
    id,
    status: "pending",
    payment_status: "unpaid",
    stripe_payment_intent_id: null,
    selectedSport: payload.selectedSport,
    selectedPackage: payload.selectedPackage,
    selectedCity: payload.selectedCity,
    selectedLeague: payload.selectedLeague,
    adults: payload.adults,
    kids: payload.kids,
    babies: payload.babies,
    totalPeople: payload.totalPeople,
    departureDate: payload.departureDate,
    returnDate: payload.returnDate,
    departureDateFormatted: payload.departureDateFormatted,
    returnDateFormatted: payload.returnDateFormatted,
    departureTimeStart: payload.departureTimeStart,
    departureTimeEnd: payload.departureTimeEnd,
    arrivalTimeStart: payload.arrivalTimeStart,
    arrivalTimeEnd: payload.arrivalTimeEnd,
    departureTimeRange: payload.departureTimeRange,
    arrivalTimeRange: payload.arrivalTimeRange,
    removedLeagues: JSON.stringify(payload.removedLeagues),
    removedLeaguesCount: payload.removedLeaguesCount,
    hasRemovedLeagues: payload.hasRemovedLeagues,
    totalExtrasCost: payload.totalExtrasCost,
    extrasCount: payload.extrasCount,
    firstName: payload.firstName,
    lastName: payload.lastName,
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    paymentMethod: null,
    cardNumber: null,
    expiryDate: null,
    cvv: null,
    cardholderName: null,
    bookingTimestamp: new Date(timestamp).toISOString(),
    bookingDate: payload.departureDateFormatted,
    bookingTime: payload.departureTimeRange,
    isBookingComplete: false,
    travelDuration: payload.travelDuration,
    hasFlightPreferences: payload.hasFlightPreferences,
    requiresEuropeanLeagueHandling: payload.requiresEuropeanLeagueHandling,
    destinationCity: "",
    assignedMatch: "",
    previousTravelInfo: payload.previousTravelInfo,
    totalCost: payload.totalCost,
    approve_status: "pending",
    created_at: new Date(timestamp).toISOString(),
    updated_at: new Date(timestamp).toISOString(),
    deleted_at: null,
    bookingExtras: payload.bookingExtras,
    allTravelers: payload.allTravelers ?? [],
  });
}

export async function createBooking(
  payload: CreateBookingPayload
): Promise<StripeSessionResponse> {
  const now = Date.now();
  const id = `booking-${randomUUID()}`;
  const newBooking = buildNewBooking(payload, id, now);

  // Save booking to store first (before creating Stripe session)
  await updateStore(BOOKING_STORE_FILE, (current) => {
    const parsed = bookingStoreSchema.parse(current);
    return {
      bookings: [...parsed.bookings, newBooking],
      meta: {
        ...parsed.meta,
        updatedAt: new Date(now).toISOString(),
      },
    };
  });

  // Get base URL from environment - use production URL
  // For production, always use the Vercel URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gogame-zeta.vercel.app";
  
  // Calculate extras total from bookingExtras array
  const extrasTotal = payload.bookingExtras
    ? payload.bookingExtras
        .filter((extra) => extra.isSelected && extra.price > 0)
        .reduce((sum, extra) => sum + extra.price * extra.quantity, 0)
    : payload.totalExtrasCost || 0;

  // Calculate league removal cost
  // Formula: (removedLeaguesCount - 1) * 20€ * totalPeople (first removal is free)
  const freeRemovals = 1;
  const paidRemovals = Math.max(0, payload.removedLeaguesCount - freeRemovals);
  const removalCostPerPerson = paidRemovals * 20; // 20€ per paid removal
  const leagueRemovalCost = payload.hasRemovedLeagues && payload.removedLeaguesCount > 0
    ? removalCostPerPerson * payload.totalPeople
    : 0;

  // Package cost = totalCost - extras - league removals
  // (totalCost already includes everything, so we subtract what we're showing separately)
  const packageCost = Number(payload.totalCost) - extrasTotal - leagueRemovalCost;
  const packageCostInCents = Math.max(0, Math.round(packageCost * 100)); // Ensure non-negative

  // Build line items for Stripe
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  // Add package as first line item (only if package cost > 0)
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

  // Add extras as separate line items if any
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

  // Add league removals as separate line item if any
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

  try {
    // Create Stripe Checkout Session
    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}&booking_id=${id}`,
      cancel_url: `${baseUrl}/?payment=cancelled&booking_id=${id}`,
      customer_email: payload.email,
      metadata: {
        booking_id: id,
        sport: payload.selectedSport,
        package: payload.selectedPackage,
        city: payload.selectedCity,
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
    });

    // Update booking with Stripe session ID
    await updateStore(BOOKING_STORE_FILE, (current) => {
      const parsed = bookingStoreSchema.parse(current);
      const updatedBookings = parsed.bookings.map((booking) => {
        if (booking.id === id) {
          return {
            ...booking,
            stripe_payment_intent_id: session.id,
          };
        }
        return booking;
      });

      return {
        bookings: updatedBookings,
        meta: {
          ...parsed.meta,
          updatedAt: new Date().toISOString(),
        },
      };
    });

    return {
      id: session.id,
      object: "checkout.session",
      url: session.url || "",
      amount_total: session.amount_total || Math.round(Number(payload.totalCost) * 100),
      currency: session.currency || "eur",
      status: session.status || "open",
      payment_status: session.payment_status || "unpaid",
      metadata: {
        booking_id: id,
      },
    };
  } catch (error) {
    console.error("❌ Error creating Stripe session:", error);
    throw new Error(
      `Failed to create Stripe checkout session: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export async function updateBooking(
  payload: UpdateBookingPayload
): Promise<Booking> {
  let updatedBooking: Booking | null = null;

  await updateStore(BOOKING_STORE_FILE, (current) => {
    const parsed = bookingStoreSchema.parse(current);
    const bookings = parsed.bookings.map((booking) => {
      if (booking.id !== payload.id) {
        return booking;
      }

      updatedBooking = bookingSchema.parse({
        ...booking,
        ...payload,
        updated_at: new Date().toISOString(),
      });

      return updatedBooking;
    });

    if (!updatedBooking) {
      throw new Error(`Booking not found: ${payload.id}`);
    }

    return {
      bookings,
      meta: {
        ...parsed.meta,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  if (!updatedBooking) {
    throw new Error(`Failed to update booking: ${payload.id}`);
  }

  return updatedBooking;
}

export async function deleteBooking(id: string): Promise<void> {
  await updateStore(BOOKING_STORE_FILE, (current) => {
    const parsed = bookingStoreSchema.parse(current);
    return {
      bookings: parsed.bookings.filter((booking) => booking.id !== id),
      meta: {
        ...parsed.meta,
        updatedAt: new Date().toISOString(),
      },
    };
  });
}

