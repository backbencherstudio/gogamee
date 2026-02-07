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
  id: string;
  status: string;
  payment_status: string;
  stripe_payment_intent_id: string | null;
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
  removedLeagues: string;
  removedLeaguesCount: number;
  hasRemovedLeagues: boolean;
  totalExtrasCost: number;
  extrasCount: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: string | null;
  cardNumber: string | null;
  expiryDate: string | null;
  cvv: string | null;
  cardholderName: string | null;
  bookingTimestamp: string | null;
  bookingDate: string;
  bookingTime: string;
  isBookingComplete: boolean;
  travelDuration: number;
  hasFlightPreferences: boolean;
  requiresEuropeanLeagueHandling: boolean;
  destinationCity: string;
  assignedMatch: string;
  previousTravelInfo: string;
  totalCost: string;
  approve_status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  bookingExtras?: BookingExtra[];
  allTravelers?: TravelerInfo[];
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
  console.log("Booking Service - Fetching all bookings", {
    page,
    limit,
    status,
    days,
  });
  // The API endpoint already supports page and limit query params
  const response = await axiosClient.get(`/admin/all-bookings/categorized`, {
    params: {
      page,
      limit,
      status,
      days,
    },
  });
  console.log("Booking Service - Bookings received:", response.data);
  return response.data;
};

// POST create booking and get Stripe session
export const createBooking = async (
  payload: CreateBookingPayload,
): Promise<StripeSessionResponse> => {
  console.log("Booking Service - Creating booking with payload:", payload);
  const response = await axiosClient.post("/payment/stripe", payload);
  console.log("Booking Service - Stripe session created:", response.data);
  return response.data;
};

// PATCH update booking
export const updateBooking = async (
  payload: UpdateBookingPayload,
): Promise<BookingItem> => {
  console.log(
    "Booking Service - Updating booking:",
    payload.id,
    "with data:",
    payload,
  );
  const { id, ...updateData } = payload;
  const response = await axiosClient.patch(
    `/admin/all-bookings/${id}/status`,
    updateData,
  );
  console.log("Booking Service - Booking updated:", response.data);
  return response.data;
};

// DELETE booking (if needed)
export const deleteBooking = async (id: string): Promise<void> => {
  console.log("Booking Service - Deleting booking:", id);
  await axiosClient.delete(`/admin/all-bookings/${id}`);
  console.log("Booking Service - Booking deleted");
};
