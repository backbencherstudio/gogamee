export interface CreateBookingData {
  status: string;
  payment_status: string;
  stripe_payment_intent_id?: string;
  selectedSport: string;
  selectedPackage: string;
  selectedCity: string;
  selectedLeague: string;
  adults: number;
  kids: number;
  babies: number;
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
  removedLeagues?: any;
  removedLeaguesCount: number;
  hasRemovedLeagues: boolean;
  totalExtrasCost: number;
  extrasCount: number;
  isBookingComplete?: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  totalCost: number | string;
  bookingExtras?: any[];
  allTravelers?: any[];
}

export interface UpdateBookingData {
  status?: string;
  payment_status?: string;
  stripe_payment_intent_id?: string;
  approve_status?: string;
  assignedMatch?: string;
  previousTravelInfo?: string;
}

export interface BookingFilters {
  status?: string;
  payment_status?: string;
  selectedSport?: string;
  email?: string;
  dateFrom?: string;
  dateTo?: string;
  isBookingComplete?: boolean;
}

export interface BookingQueryOptions {
  filters?: BookingFilters;
  sort?: {
    field: "createdAt" | "bookingDate" | "totalCost";
    order: "asc" | "desc";
  };
  limit?: number;
  skip?: number;
}
