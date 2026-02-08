import axiosClient from "../lib/axiosClient";
import { ApiResponse } from "@/app/lib/api-response";

// ========== Booking Interfaces ==========
export interface BookingExtra {
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

export interface TravelerInfo {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  documentType?: string;
  documentNumber?: string;
  isPrimary?: boolean;
  travelerNumber?: number;
}

export interface BookingItem {
  _id: string; // Mongoose ID
  id?: string; // Frontend alias if needed

  // 1. Selection Core
  selection: {
    sport: "football" | "basketball" | "both";
    package: "standard" | "premium" | "combined";
    city: string;
  };

  // 2. Dates
  dates: {
    departure: string; // ISO or YYYY-MM-DD
    return: string;
    durationDays: number;
    durationNights: number;
  };

  // 3. Travelers
  travelers: {
    adults: any[];
    kids: any[];
    babies: any[];
    all: any[]; // Flat list for easy access
    totalCount: number;
    primaryContact: {
      name: string;
      email: string;
      phone: string;
      [key: string]: any;
    };
  };

  // 4. Leagues
  leagues: {
    list: Array<{
      id: string;
      name: string;
      country?: string;
      group?: string;
      isSelected: boolean;
    }>;
    removedCount: number;
    hasRemovedLeagues: boolean;
  };

  // 5. Flight
  flight: {
    schedule: { departureBetween: string; returnBetween: string };
    preferences: any;
  };

  // 6. Extras
  extras: {
    selected: any[];
    totalCost: number;
  };

  // 7. Payment & Status
  payment: {
    method: string;
    stripePaymentIntentId?: string;
    status: "pending" | "paid" | "failed";
    amount: number;
    currency: string;
    timestamp?: string;
  };

  priceBreakdown: {
    packageCost: number;
    extrasCost: number;
    leagueRemovalCost: number;
    leagueSurcharge: number;
    flightPreferenceCost: number;
    singleTravelerSupplement: number;
    bookingFee: number;
    totalBaseCost: number;
    totalCost: number;
    currency: string;
    basePricePerPerson: number;
    items: {
      description: string;
      amount: number;
      quantity?: number;
      unitPrice?: number;
    }[];
  };

  status: "pending" | "confirmed" | "rejected" | "completed";
  destinationCity?: string;
  assignedMatch?: string;
  previousTravelInfo?: string;
  bookingReference: string;
  totalCost: number;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BookingResponse {
  all: BookingItem[];
}

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  bookingId: string;
  amount: number;
  currency: string;
}

// Keeping for backward compatibility
export interface StripeSessionResponse extends PaymentIntentResponse {
  id?: string;
  object?: string;
  url?: string;
  amount_total?: number;
  status?: string;
  payment_status?: string;
  metadata?: {
    booking_id: string;
  };
}

export interface CreateBookingPayload {
  selectedSport: string;
  selectedPackage: string;
  selectedCity: string;
  selectedLeague?: string; // Optional - being phased out
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
  removedLeagues: string[];
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
  bookingExtras: BookingExtra[];
  allTravelers?: TravelerInfo[];
}

export interface UpdateBookingPayload {
  id: string;
  status?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status?: string;
  [key: string]: unknown;
}

export interface BookingStats {
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  confirmed: number;
}

// ========== Booking API Functions ==========

export const getBookingStats = async (): Promise<ApiResponse<BookingStats>> => {
  const response = await axiosClient.get("/admin/all-bookings/stats");
  return response.data;
};

export const getAllBookings = async (
  page: number = 1,
  limit: number = 10,
  status: string = "all",
  days: string = "alltime",
): Promise<ApiResponse<BookingItem[]>> => {
  // The API endpoint already supports page and limit query params
  const response = await axiosClient.get(`/admin/all-bookings/categorized`, {
    params: {
      page,
      limit,
      status,
      days,
    },
  });
  return response.data;
};

// POST create booking and get Stripe session
export const createBooking = async (
  payload: CreateBookingPayload,
): Promise<StripeSessionResponse> => {
  const response = await axiosClient.post("/payment/stripe", payload);
  return response.data;
};

// PATCH update booking
export const updateBooking = async (
  payload: UpdateBookingPayload,
): Promise<BookingItem> => {
  const { id, ...updateData } = payload;
  const response = await axiosClient.patch(
    `/admin/all-bookings/${id}/status`,
    updateData,
  );
  return response.data;
};

// DELETE booking (if needed)
export const deleteBooking = async (id: string): Promise<void> => {
  await axiosClient.delete(`/admin/all-bookings/${id}`);
};
