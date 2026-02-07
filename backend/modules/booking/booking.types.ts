export interface CreateBookingData {
  status: string;

  // 1. Selection Core
  selection: {
    sport: string;
    package: string;
    city: string;
  };

  // 2. Dates
  dates: {
    departure: string;
    return: string;
    durationDays: number;
    durationNights: number;
  };

  // 3. Travelers
  travelers: {
    adults: any[];
    kids: any[];
    babies: any[];
    totalCount: number;
    primaryContact: {
      name: string;
      email: string;
      phone: string;
    };
  };

  // 4. Leagues
  leagues: {
    list: any[];
    removedCount: number;
    hasRemovedLeagues: boolean;
  };

  // 5. Flight
  flight: {
    schedule: {
      departureBetween: string;
      returnBetween: string;
    };
    preferences: {
      departureTimeStart?: number;
      departureTimeEnd?: number;
      arrivalTimeStart?: number;
      arrivalTimeEnd?: number;
      hasPreferences: boolean;
    };
  };

  // 6. Extras
  extras: {
    selected: any[];
    totalCost: number;
  };

  // 7. Payment
  payment: {
    amount: number;
    currency: string;
    status: string;
    stripePaymentIntentId?: string;
  };

  // 8. Price Breakdown
  priceBreakdown: any;

  // Metadata / Root Query Fields
  totalCost: number;
  isBookingComplete?: boolean;

  // Root level legacy fields (Optional for transition)
  payment_status?: string;
  stripe_payment_intent_id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateBookingData {
  status?: string;
  payment_status?: string; // Legacy
  stripe_payment_intent_id?: string; // Legacy
  approve_status?: string;
  assignedMatch?: string;
  previousTravelInfo?: string;
  // Support for nested updates via dot notation
  [key: string]: any;
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
