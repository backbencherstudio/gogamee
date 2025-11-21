"use server";

import { randomUUID } from "crypto";
import { readStore, updateStore } from "../lib/jsonStore";
import {
  bookingStoreSchema,
  bookingSchema,
  type Booking,
  type BookingStore,
} from "../schemas";

const BOOKING_STORE_FILE = "bookings.json";

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

  return {
    id: `session_${randomUUID()}`,
    object: "checkout.session",
    url: `/dashboard/allrequest?booking=${encodeURIComponent(id)}`,
    amount_total: Number(payload.totalCost) || 0,
    currency: "eur",
    status: "open",
    payment_status: "unpaid",
    metadata: {
      booking_id: id,
    },
  };
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

