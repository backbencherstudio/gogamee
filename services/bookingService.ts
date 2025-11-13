import axiosClient from "../lib/axiosClient";

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
}

export interface BookingResponse {
  all: BookingItem[];
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
  // ... other stripe fields
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
}

export interface UpdateBookingPayload {
  id: string;
  status?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status?: string;
  [key: string]: unknown;
}

// ========== Booking API Functions ==========

// GET all bookings
export const getAllBookings = async (): Promise<BookingResponse> => {
  console.log('Booking Service - Fetching all bookings');
  const response = await axiosClient.get("/admin/all-bookings/categorized");
  console.log('Booking Service - Bookings received:', response.data);
  return response.data;
};

// POST create booking and get Stripe session
export const createBooking = async (payload: CreateBookingPayload): Promise<StripeSessionResponse> => {
  console.log('Booking Service - Creating booking with payload:', payload);
  const response = await axiosClient.post("/payment/stripe", payload);
  console.log('Booking Service - Stripe session created:', response.data);
  return response.data;
};

// PATCH update booking
export const updateBooking = async (payload: UpdateBookingPayload): Promise<BookingItem> => {
  console.log('Booking Service - Updating booking:', payload.id, 'with data:', payload);
  const { id, ...updateData } = payload;
  const response = await axiosClient.patch(`/admin/all-bookings/${id}/status`, updateData);
  console.log('Booking Service - Booking updated:', response.data);
  return response.data;
};

// DELETE booking (if needed)
export const deleteBooking = async (id: string): Promise<void> => {
  console.log('Booking Service - Deleting booking:', id);
  await axiosClient.delete(`/admin/all-bookings/${id}`);
  console.log('Booking Service - Booking deleted');
};

