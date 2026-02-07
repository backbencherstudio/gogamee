// Main data structure for the entire application
// This acts as a constructor function that can be easily replaced with API calls

// Traveler Information Interface
export interface TravelerInfo {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  documentType: "ID" | "Passport";
  documentNumber: string;
  isPrimary?: boolean;
  travelerNumber?: number;
}

export interface BookingData {
  id: number;
  status: "pending" | "completed" | "cancelled";
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
  allExtras: Array<{
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
  }>;
  selectedExtras: Array<{
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
  }>;
  selectedExtrasNames: string[];
  totalExtrasCost: number;
  extrasCount: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  paymentMethod: string;
  cardNumber: string | null;
  expiryDate: string | null;
  cvv: string | null;
  cardholderName: string | null;
  bookingTimestamp: string;
  bookingDate: string;
  bookingTime: string;
  isBookingComplete: boolean;
  travelDuration: number;
  hasFlightPreferences: boolean;
  requiresEuropeanLeagueHandling: boolean;
  // New fields for GoGame internal management
  destinationCity?: string;
  assignedMatch?: string;
  previousTravelInfo?: string;
  // Traveler information
  allTravelers?: TravelerInfo[];
  primaryTraveler?: TravelerInfo;
  extraTravelers?: TravelerInfo[];
}

// Hero Section Data Structure
export interface HeroData {
  sports: Array<{
    id: string;
    name: string;
    label: string;
    value: string;
  }>;
  packTypes: Array<{
    id: number;
    name: string;
    basePrice: number;
    currency: string;
  }>;
  departureCities: Array<{
    id: number;
    name: string;
    country: string;
  }>;
  peopleCategories: Array<{
    id: string;
    name: string;
    minAge: number;
    maxAge: number;
    minCount: number;
    maxCount: number;
    defaultCount: number;
  }>;
  maxTotalPeople: number;
  minAdults: number;
}

// Sports Preference Data Structure
export interface SportsPreferenceData {
  sports: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

// Package Type Data Structure
export interface PackageTypeData {
  packages: Array<{
    value: string;
    label: string;
    description: string;
    features: string[];
    basePrice: number;
    currency: string;
  }>;
}

// Departure City Data Structure
export interface DepartureCityData {
  cities: Array<{
    value: string;
    label: string;
    gradient: string;
    accent: string;
    country: string;
    description?: string;
  }>;
}

// Remove League Data Structure
export interface RemoveLeagueData {
  leagues: Array<{
    id: string;
    name: string;
    country: string;
    image: string;
    description?: string;
  }>;
  removalCost: number;
  freeRemovals: number;
}

// Flight Schedule Data Structure
export interface FlightScheduleData {
  timeSlots: {
    departure: Array<{
      value: number;
      label: string;
    }>;
    arrival: Array<{
      value: number;
      label: string;
    }>;
  };
  defaultRanges: {
    departure: {
      start: number;
      end: number;
    };
    arrival: {
      start: number;
      end: number;
    };
  };
  pricing: {
    pricePerStep: number;
    currency: string;
  };
  constants: {
    minutesInDay: number;
    extendedDayMinutes: number;
    hoursPerDay: number;
  };
  initialFlightData: Array<{
    label: string;
    city: string;
    price: string;
    icon: "takeoff" | "landing";
    timeRange: {
      start: number;
      end: number;
    };
  }>;
}

// Extras Data Structure
export interface ExtrasData {
  text: {
    title: string;
    perPerson: string;
    included: string;
    add: string;
    remove: string;
    confirm: string;
    totalCost: string;
  };
  constants: {
    currencySymbol: string;
    defaultMaxQuantity: number;
    minQuantity: number;
  };
  initialExtras: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    icon: string;
    isSelected: boolean;
    quantity: number;
    maxQuantity?: number;
    isIncluded?: boolean;
    isGroupOption?: boolean;
    currency: string;
  }>;
}

// Main application data object
export const AppData = {
  // Hero Section Data
  hero: {
    sports: [
      { id: "football", name: "Fútbol", label: "Fútbol", value: "Fútbol" },
      { id: "basketball", name: "Basket", label: "Basket", value: "Basket" },
      { id: "both", name: "Ambos", label: "Ambos", value: "Ambos" },
    ],

    packTypes: [
      { id: 1, name: "Estándar", basePrice: 299, currency: "EUR" },
      { id: 2, name: "Premium", basePrice: 1399, currency: "EUR" },
    ],

    departureCities: [
      { id: 1, name: "Madrid", country: "Spain" },
      { id: 2, name: "Barcelona", country: "Spain" },
      { id: 3, name: "Málaga", country: "Spain" },
      { id: 4, name: "Valencia", country: "Spain" },
      { id: 5, name: "Alicante", country: "Spain" },
      { id: 6, name: "Bilbao", country: "Spain" },
    ],

    peopleCategories: [
      {
        id: "adults",
        name: "Adultos",
        minAge: 18,
        maxAge: 100,
        minCount: 1,
        maxCount: 10,
        defaultCount: 2,
      },
      {
        id: "children",
        name: "Niños",
        minAge: 2,
        maxAge: 17,
        minCount: 0,
        maxCount: 10,
        defaultCount: 0,
      },
      {
        id: "babies",
        name: "Bebés",
        minAge: 0,
        maxAge: 1,
        minCount: 0,
        maxCount: 10,
        defaultCount: 0,
      },
    ],

    maxTotalPeople: 10,
    minAdults: 1,

    // Helper functions for hero section
    getPackTypesBySport: function (
      sport: "Football" | "Basketball" | "Both",
      fromText: string,
    ) {
      const basePrices = {
        Football: { standard: 299, premium: 1399 },
        Basketball: { standard: 279, premium: 1279 },
        Both: { standard: 279, premium: 1279 }, // Use lowest price for "Both"
      };

      const sportPrices = basePrices[sport];

      return this.packTypes.map((pack) => ({
        ...pack,
        price: `${fromText} ${sportPrices[pack.name.toLowerCase() as keyof typeof sportPrices]}€`,
      }));
    },

    getSportById: function (id: string) {
      return this.sports.find((sport) => sport.id === id);
    },

    getPackTypeById: function (id: number) {
      return this.packTypes.find((pack) => pack.id === id);
    },

    getCityById: function (id: number) {
      return this.departureCities.find((city) => city.id === id);
    },

    getPeopleCategoryById: function (id: string) {
      return this.peopleCategories.find((category) => category.id === id);
    },
  },

  // Sports Preference Data
  sportsPreference: {
    sports: [
      {
        value: "football",
        label: "Football",
        description: "We always try to maximize the time at the destination",
      },
      {
        value: "basketball",
        label: "Basketball",
        description: "We always try to maximize the time at the destination",
      },
      {
        value: "both",
        label: "Both",
        description: "We always try to maximize the time at the destination",
      },
    ],

    getSportByValue: function (value: string) {
      return this.sports.find((sport) => sport.value === value);
    },

    getAllSports: function () {
      return this.sports;
    },
  },

  // Package Type Data
  packageType: {
    packages: [
      {
        value: "standard",
        label: "Standard",
        description:
          "Perfect for budget-conscious travelers who want quality experiences",
        features: [
          "Standard accommodation (3-star hotels)",
          "Basic meals included",
          "Public transport or shuttle service",
          "Essential welcome pack",
          "Standard match tickets",
        ],
        basePrice: 299,
        currency: "EUR",
      },
      {
        value: "premium",
        label: "Premium",
        description:
          "Luxury experience with exclusive access and premium services",
        features: [
          "Premium accommodation (4-5 star hotels)",
          "Gourmet meals and dining experiences",
          "Private transfers and VIP transport",
          "Exclusive welcome pack with team merchandise",
          "Premium match tickets with better seating",
          "Personal guide and concierge service",
        ],
        basePrice: 1399,
        currency: "EUR",
      },
    ],

    getPackageByValue: function (value: string) {
      return this.packages.find((pkg) => pkg.value === value);
    },

    getAllPackages: function () {
      return this.packages;
    },

    getPackageFeatures: function (value: string) {
      const pkg = this.getPackageByValue(value);
      return pkg ? pkg.features : [];
    },

    getPackagePrice: function (value: string, sport?: string, nights?: number) {
      const pkg = this.getPackageByValue(value);
      if (!pkg) return 0;

      // If sport and nights are provided, use the pricing logic from hero section
      if (sport && nights) {
        const sportPrices: Record<string, Record<string, number>> = {
          football: { standard: 299, premium: 1399 },
          basketball: { standard: 279, premium: 1279 },
        };

        const sportData = sportPrices[sport.toLowerCase()];
        const basePrice = sportData?.[value] || pkg.basePrice;

        // Apply night multiplier (basic logic - can be enhanced)
        if (nights > 1) {
          return basePrice + (nights - 1) * 80; // Additional 80€ per extra night
        }

        return basePrice;
      }

      return pkg.basePrice;
    },
  },

  // Departure City Data
  departureCity: {
    cities: [
      {
        value: "madrid",
        label: "Madrid",
        gradient: "from-slate-700 via-slate-600 to-slate-800",
        accent: "hover:from-slate-600 hover:via-slate-500 hover:to-slate-700",
        country: "Spain",
        description:
          "Capital city with rich cultural heritage and vibrant atmosphere",
      },
      {
        value: "barcelona",
        label: "Barcelona",
        gradient: "from-emerald-600 via-emerald-500 to-emerald-700",
        accent:
          "hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-600",
        country: "Spain",
        description:
          "Coastal city known for stunning architecture and Mediterranean charm",
      },
      {
        value: "malaga",
        label: "Málaga",
        gradient: "from-amber-600 via-amber-500 to-amber-700",
        accent: "hover:from-amber-500 hover:via-amber-400 hover:to-amber-600",
        country: "Spain",
        description:
          "Sunny coastal city with beautiful beaches and rich history",
      },
      {
        value: "valencia",
        label: "Valencia",
        gradient: "from-blue-600 via-blue-500 to-blue-700",
        accent: "hover:from-blue-500 hover:via-blue-400 hover:to-blue-600",
        country: "Spain",
        description:
          "Modern city with futuristic architecture and traditional charm",
      },
      {
        value: "alicante",
        label: "Alicante",
        gradient: "from-orange-600 via-orange-500 to-orange-700",
        accent:
          "hover:from-orange-500 hover:via-orange-400 hover:to-orange-600",
        country: "Spain",
        description:
          "Coastal gem with stunning beaches and Mediterranean lifestyle",
      },
      {
        value: "bilbao",
        label: "Bilbao",
        gradient: "from-red-600 via-red-500 to-red-700",
        accent: "hover:from-red-500 hover:via-red-400 hover:to-red-600",
        country: "Spain",
        description:
          "Industrial city transformed into a cultural and culinary destination",
      },
    ],

    getCityByValue: function (value: string) {
      return this.cities.find((city) => city.value === value);
    },

    getAllCities: function () {
      return this.cities;
    },

    getCityGradient: function (value: string) {
      const city = this.getCityByValue(value);
      return city ? city.gradient : "";
    },

    getCityAccent: function (value: string) {
      const city = this.getCityByValue(value);
      return city ? city.accent : "";
    },

    getCityDescription: function (value: string) {
      const city = this.getCityByValue(value);
      return city ? city.description : "";
    },
  },

  // Remove League Data
  removeLeague: {
    leagues: [
      {
        id: "1",
        name: "La Liga",
        country: "Spain",
        image: "/stepper/img1.png",
        description: "Spanish top-flight football league",
      },
      {
        id: "2",
        name: "Premier League",
        country: "England",
        image: "/stepper/img2.png",
        description: "English top-flight football league",
      },
      {
        id: "3",
        name: "Bundesliga",
        country: "Germany",
        image: "/stepper/img3.png",
        description: "German top-flight football league",
      },
      {
        id: "4",
        name: "Serie A",
        country: "Italy",
        image: "/stepper/img4.png",
        description: "Italian top-flight football league",
      },
      {
        id: "5",
        name: "Eredivisie",
        country: "Netherlands",
        image: "/homepage/image/Eredivisie00.jpg",
        description: "Dutch top-flight football league",
      },
      {
        id: "6",
        name: "Ligue 1",
        country: "France",
        image: "/stepper/img6.png",
        description: "French top-flight football league",
      },
    ],

    removalCost: 20,
    freeRemovals: 1,

    getLeagueById: function (id: string) {
      return this.leagues.find((league) => league.id === id);
    },

    getAllLeagues: function () {
      return this.leagues;
    },

    getLeagueByName: function (name: string) {
      return this.leagues.find((league) => league.name === name);
    },

    getLeaguesByCountry: function (country: string) {
      return this.leagues.filter((league) => league.country === country);
    },

    getRemovalCost: function () {
      return this.removalCost;
    },

    getFreeRemovals: function () {
      return this.freeRemovals;
    },

    calculateTotalCost: function (removedCount: number) {
      const freeRemovals = this.freeRemovals;
      const paidRemovals = Math.max(0, removedCount - freeRemovals);
      return paidRemovals * this.removalCost;
    },
  },

  // Flight Schedule Data
  flightSchedule: {
    timeSlots: {
      departure: [
        { value: 360, label: "06:00" }, // 6:00 AM
        { value: 660, label: "11:00" }, // 11:00 AM
        { value: 840, label: "14:00" }, // 2:00 PM
        { value: 1080, label: "18:00" }, // 6:00 PM
        { value: 1440, label: "00:00(+1)" }, // 12:00 AM next day
      ],
      arrival: [
        { value: 660, label: "11:00" }, // 11:00 AM
        { value: 840, label: "14:00" }, // 2:00 PM
        { value: 1140, label: "19:00" }, // 7:00 PM
        { value: 1440, label: "00:00(+1)" }, // 12:00 AM next day
      ],
    },

    defaultRanges: {
      departure: { start: 360, end: 840 }, // 06:00 to 14:00
      arrival: { start: 840, end: 1440 }, // 14:00 to 00:00(+1)
    },

    pricing: {
      pricePerStep: 20,
      currency: "EUR",
    },

    constants: {
      minutesInDay: 1440, // 24 * 60
      extendedDayMinutes: 2160, // 36 * 60 (1.5 days)
      hoursPerDay: 24,
    },

    initialFlightData: [
      {
        label: "Departure from",
        city: "Barcelona",
        price: "0€", // No extra cost for default range
        icon: "takeoff",
        timeRange: { start: 360, end: 840 }, // 06:00 to 14:00
      },
      {
        label: "Arrival",
        city: "Barcelona",
        price: "0€", // No extra cost for default range
        icon: "landing",
        timeRange: { start: 840, end: 1440 }, // 14:00 to 00:00(+1)
      },
    ],

    // Helper functions for flight schedule
    getTimeSlots: function (type: "departure" | "arrival") {
      return this.timeSlots[type];
    },

    getDefaultRange: function (type: "departure" | "arrival") {
      return this.defaultRanges[type];
    },

    getPricePerStep: function () {
      return this.pricing.pricePerStep;
    },

    getConstants: function () {
      return this.constants;
    },

    getInitialFlightData: function () {
      return this.initialFlightData;
    },

    // Calculate price based on steps from default range
    calculatePriceFromDefault: function (
      timeRange: { start: number; end: number },
      isDeparture: boolean,
    ): number {
      const defaultRange = isDeparture
        ? this.defaultRanges.departure
        : this.defaultRanges.arrival;
      const timeSlots = isDeparture
        ? this.timeSlots.departure
        : this.timeSlots.arrival;

      // Find the closest time slots for start and end
      const startStep = timeSlots.findIndex(
        (slot) => Math.abs(slot.value - timeRange.start) < 30,
      );
      const endStep = timeSlots.findIndex(
        (slot) => Math.abs(slot.value - timeRange.end) < 30,
      );

      // Find the default start and end steps
      const defaultStartStep = timeSlots.findIndex(
        (slot) => Math.abs(slot.value - defaultRange.start) < 30,
      );
      const defaultEndStep = timeSlots.findIndex(
        (slot) => Math.abs(slot.value - defaultRange.end) < 30,
      );

      // Calculate total steps moved from default
      const totalStepsMoved =
        Math.abs(startStep - defaultStartStep) +
        Math.abs(endStep - defaultEndStep);

      return totalStepsMoved * this.pricing.pricePerStep;
    },

    // Get available time slots for a flight type
    getAvailableTimeSlots: function (type: "departure" | "arrival") {
      return this.timeSlots[type];
    },
  },

  // Booking related data
  bookings: {
    all: [] as BookingData[],
    pending: [] as BookingData[],
    completed: [] as BookingData[],
    cancelled: [] as BookingData[],

    // Get bookings by status
    getByStatus: function (status: "pending" | "completed" | "cancelled") {
      return this.all.filter((booking) => booking.status === status);
    },

    // Get booking by ID
    getById: function (id: number) {
      return this.all.find((booking) => booking.id === id);
    },

    // Add new booking
    add: function (booking: Omit<BookingData, "id">) {
      const newId = Math.max(...this.all.map((b) => b.id), 0) + 1;
      const newBooking = { ...booking, id: newId };
      this.all.unshift(newBooking); // Add to beginning for easy access
      this.updateStatusArrays();
      return newBooking;
    },

    // Update existing booking
    update: function (id: number, updates: Partial<BookingData>) {
      const index = this.all.findIndex((booking) => booking.id === id);
      if (index !== -1) {
        this.all[index] = { ...this.all[index], ...updates };
        this.updateStatusArrays();
      }
    },

    // Delete booking
    delete: function (id: number) {
      this.all = this.all.filter((booking) => booking.id !== id);
      this.updateStatusArrays();
    },

    // Update status arrays
    updateStatusArrays: function () {
      this.pending = this.getByStatus("pending");
      this.completed = this.getByStatus("completed");
      this.cancelled = this.getByStatus("cancelled");
    },
  },

  // Sports data
  sports: {
    list: [
      { id: "football", name: "Football", icon: "⚽" },
      { id: "basketball", name: "Basketball", icon: "🏀" },
      { id: "tennis", name: "Tennis", icon: "🎾" },
      { id: "volleyball", name: "Volleyball", icon: "🏐" },
      { id: "swimming", name: "Swimming", icon: "🏊" },
      { id: "rugby", name: "Rugby", icon: "🏉" },
      { id: "hockey", name: "Hockey", icon: "🏒" },
      { id: "cricket", name: "Cricket", icon: "🏏" },
      { id: "golf", name: "Golf", icon: "⛳" },
      { id: "cycling", name: "Cycling", icon: "🚴" },
      { id: "formula1", name: "Formula 1", icon: "🏎️" },
    ],

    getById: function (id: string) {
      return this.list.find((sport) => sport.id === id);
    },
  },

  // Package types
  packages: {
    list: [
      {
        id: "basic",
        name: "Basic",
        price: 280,
        features: ["Standard accommodation", "Basic meals"],
      },
      {
        id: "standard",
        name: "Standard",
        price: 450,
        features: ["Comfortable accommodation", "Quality meals", "Transport"],
      },
      {
        id: "premium",
        name: "Premium",
        price: 680,
        features: [
          "Luxury accommodation",
          "Premium meals",
          "VIP transport",
          "Personal guide",
        ],
      },
      {
        id: "luxury",
        name: "Luxury",
        price: 1200,
        features: [
          "5-star accommodation",
          "Gourmet meals",
          "Private transport",
          "Personal guide",
          "Exclusive access",
        ],
      },
    ],

    getById: function (id: string) {
      return this.list.find((pkg) => pkg.id === id);
    },
  },

  // Travel Package Details
  travelPackages: {
    list: [
      // Football packages
      {
        id: "f1",
        sport: "football",
        category: "Match Ticket",
        standard: "General or lateral section",
        premium: "Premium or central tribune seat",
        standardPrice: 50,
        premiumPrice: 150,
        currency: "EUR",
      },
      {
        id: "f2",
        sport: "football",
        category: "Flights",
        standard: "Round-trip to a major city",
        premium: "Round-trip to a major city",
        standardPrice: 200,
        premiumPrice: 400,
        currency: "EUR",
      },
      {
        id: "f3",
        sport: "football",
        category: "Hotel",
        standard: "3-star hotel or apartment",
        premium: "4–5 star hotel near stadium or city center",
        standardPrice: 80,
        premiumPrice: 200,
        currency: "EUR",
      },
      {
        id: "f4",
        sport: "football",
        category: "Transfers",
        standard: "Public transport or shuttle",
        premium: "Private transfers (airport & stadium)",
        standardPrice: 20,
        premiumPrice: 80,
        currency: "EUR",
      },
      {
        id: "f5",
        sport: "football",
        category: "Welcome Pack",
        standard: "Exclusive GoGame merchandise",
        premium: "Official team jersey + premium goodies",
        standardPrice: 15,
        premiumPrice: 50,
        currency: "EUR",
      },
      {
        id: "f6",
        sport: "football",
        category: "Surprise Reveal",
        standard:
          "Destination revealed 48h before. A secret clue before revealing the destination.",
        premium:
          "Destination revealed 48h before. A secret clue before revealing the destination.",
        standardPrice: 0,
        premiumPrice: 0,
        currency: "EUR",
      },
      {
        id: "f7",
        sport: "football",
        category: "Starting Price",
        standard: "From 299€",
        premium: "From 1399€",
        standardPrice: 299,
        premiumPrice: 1399,
        currency: "EUR",
      },

      // Basketball packages
      {
        id: "b1",
        sport: "basketball",
        category: "Match Ticket",
        standard: "Standard seat (upper and lateral seats)",
        premium: "VIP seat",
        standardPrice: 40,
        premiumPrice: 120,
        currency: "EUR",
      },
      {
        id: "b2",
        sport: "basketball",
        category: "Flights",
        standard: "Round-trip to a major city",
        premium: "Round-trip to a major city",
        standardPrice: 180,
        premiumPrice: 350,
        currency: "EUR",
      },
      {
        id: "b3",
        sport: "basketball",
        category: "Hotel",
        standard: "3-star hotel or apartment",
        premium: "4–5 star hotel in premium location",
        standardPrice: 70,
        premiumPrice: 180,
        currency: "EUR",
      },
      {
        id: "b4",
        sport: "basketball",
        category: "Transfers",
        standard: "Public transport or shuttle",
        premium: "Private transfers (airport & stadium)",
        standardPrice: 18,
        premiumPrice: 70,
        currency: "EUR",
      },
      {
        id: "b5",
        sport: "basketball",
        category: "Welcome Pack",
        standard: "Travel guide + surprise gift",
        premium: "Official team jersey + premium goodies",
        standardPrice: 12,
        premiumPrice: 45,
        currency: "EUR",
      },
      {
        id: "b6",
        sport: "basketball",
        category: "Surprise Reveal",
        standard:
          "Destination revealed 48h before. A secret clue before revealing the destination.",
        premium:
          "Destination revealed 48h before. A secret clue before revealing the destination.",
        standardPrice: 0,
        premiumPrice: 0,
        currency: "EUR",
      },
      {
        id: "b7",
        sport: "basketball",
        category: "Starting Price",
        standard: "From 279€",
        premium: "From 1279€",
        standardPrice: 279,
        premiumPrice: 1279,
        currency: "EUR",
      },
    ],

    getBySport: function (sport: "football" | "basketball") {
      return this.list.filter((pkg) => pkg.sport === sport);
    },

    getAll: function () {
      return this.list;
    },

    add: function (packageData: {
      sport: "football" | "basketball";
      category: string;
      standard: string;
      premium: string;
      standardPrice?: number;
      premiumPrice?: number;
      currency?: string;
    }) {
      const newId = `${packageData.sport}_${Date.now()}`;
      const newPackage = {
        ...packageData,
        id: newId,
        standardPrice: packageData.standardPrice || 0,
        premiumPrice: packageData.premiumPrice || 0,
        currency: packageData.currency || "EUR",
      };
      this.list.unshift(newPackage); // Add to beginning for easy access
      return newPackage;
    },

    update: function (
      id: string,
      updates: Partial<{
        sport: "football" | "basketball";
        category: string;
        standard: string;
        premium: string;
        standardPrice?: number;
        premiumPrice?: number;
        currency?: string;
      }>,
    ) {
      const index = this.list.findIndex((pkg) => pkg.id === id);
      if (index !== -1) {
        this.list[index] = { ...this.list[index], ...updates };
        return this.list[index];
      }
      return null;
    },

    delete: function (id: string) {
      const index = this.list.findIndex((pkg) => pkg.id === id);
      if (index !== -1) {
        this.list.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  // Cities
  cities: {
    list: [
      { id: "alicante", name: "Alicante", country: "Spain" },
      { id: "madrid", name: "Madrid", country: "Spain" },
      { id: "barcelona", name: "Barcelona", country: "Spain" },
      { id: "valencia", name: "Valencia", country: "Spain" },
      { id: "sevilla", name: "Sevilla", country: "Spain" },
      { id: "bilbao", name: "Bilbao", country: "Spain" },
      { id: "granada", name: "Granada", country: "Spain" },
      { id: "malaga", name: "Malaga", country: "Spain" },
    ],

    getById: function (id: string) {
      return this.list.find((city) => city.id === id);
    },
  },

  // Leagues
  leagues: {
    list: [
      { id: "local", name: "Local", level: 1 },
      { id: "regional", name: "Regional", level: 2 },
      { id: "national", name: "National", level: 3 },
      { id: "international", name: "International", level: 4 },
      { id: "championship", name: "Championship", level: 5 },
      { id: "amateur", name: "Amateur", level: 1 },
      { id: "youth", name: "Youth", level: 1 },
      { id: "junior", name: "Junior", level: 2 },
      { id: "senior", name: "Senior", level: 3 },
    ],

    getById: function (id: string) {
      return this.list.find((league) => league.id === id);
    },

    getByLevel: function (level: number) {
      return this.list.filter((league) => league.level === level);
    },
  },

  // Leagues Data
  homepageLeagues: {
    football: [
      {
        id: "premier-league",
        name: "Premier League",
        image: "/homepage/image/premierleague.jpeg",
        country: "England",
        description: "English top-flight football league",
      },
      {
        id: "la-liga",
        name: "La Liga",
        image: "/homepage/image/laliga.jpeg",
        country: "Spain",
        description: "Spanish top-flight football league",
      },
      {
        id: "bundesliga",
        name: "Bundesliga",
        image: "/homepage/image/bundesliga.jpeg",
        country: "Germany",
        description: "German top-flight football league",
      },
      {
        id: "serie-a",
        name: "Serie A",
        image: "/homepage/image/seriea.jpeg",
        country: "Italy",
        description: "Italian top-flight football league",
      },
      {
        id: "ligue-1",
        name: "Ligue 1",
        image: "/homepage/image/ligue1.jpg",
        country: "France",
        description: "French top-flight football league",
      },
      {
        id: "eredivisie",
        name: "Eredivisie",
        image: "/homepage/image/Eredivisie00.jpg",
        country: "Netherlands",
        description: "Dutch top-flight football league",
      },
      {
        id: "european-competition",
        name: "Competición Europea",
        image: "/homepage/image/champions.jpeg",
        country: "Europe",
        description:
          "European club competitions including Champions League and Europa League",
      },
    ],

    basketball: [
      {
        id: "lnb pro a",
        name: "Lnb Pro A",
        image: "/homepage/image/lnbproa.jpg",
        country: "France",
        description: "French top-flight basketball league",
      },
      {
        id: "basketbol-super-ligi",
        name: "Basketbol Süper Ligi",
        image: "/homepage/image/basketballsuperligi.jpg",
        country: "Turkey",
        description: "Turkish top-flight basketball league",
      },
      {
        id: "la liga acb",
        name: "La Liga ACB",
        image: "/homepage/image/laligaacb.jpg",
        country: "Spain",
        description: "Spanish top-flight basketball league",
      },
      {
        id: "lega-basket-serie-a",
        name: "Lega Basket Serie A",
        image: "/homepage/image/legaseriea.jpg",
        country: "Italy",
        description: "Italian top-flight basketball league",
      },
      {
        id: "basketball-bundesliga",
        name: "Basketball Bundesliga",
        image: "/homepage/image/bundesligabasket.jpg",
        country: "Germany",
        description: "German top-flight basketball league",
      },
      {
        id: "lietuvos-krepsinio-lyga",
        name: "Lietuvos krepšinio lyga",
        image: "/homepage/image/lietuvoskrepsinio.jpg",
        country: "Lithuania",
        description: "Lithuanian top-flight basketball league",
      },
      {
        id: "european-competition",
        name: "Competición Europea",
        image: "/homepage/image/euroleague.jpg",
        country: "Europe",
        description: "European basketball competitions",
      },
    ],

    // Helper functions for homepage leagues
    getFootballLeagues: function () {
      return this.football;
    },

    getBasketballLeagues: function () {
      return this.basketball;
    },

    getLeaguesBySport: function (sport: "football" | "basketball") {
      return sport === "football" ? this.football : this.basketball;
    },

    getLeagueById: function (sport: "football" | "basketball", id: string) {
      const leagues = this.getLeaguesBySport(sport);
      return leagues.find((league) => league.id === id);
    },

    getLeagueByName: function (sport: "football" | "basketball", name: string) {
      const leagues = this.getLeaguesBySport(sport);
      return leagues.find((league) => league.name === name);
    },

    getLeaguesByCountry: function (
      sport: "football" | "basketball",
      country: string,
    ) {
      const leagues = this.getLeaguesBySport(sport);
      return leagues.filter((league) => league.country === country);
    },

    // Add new league
    addLeague: function (
      sport: "football" | "basketball",
      leagueData: {
        name: string;
        image: string;
        country: string;
        description: string;
      },
    ) {
      const newId = `${sport}_${Date.now()}`;
      const newLeague = { ...leagueData, id: newId };

      if (sport === "football") {
        this.football.push(newLeague);
      } else {
        this.basketball.push(newLeague);
      }

      return newLeague;
    },

    // Update existing league
    updateLeague: function (
      sport: "football" | "basketball",
      id: string,
      updates: Partial<{
        name: string;
        image: string;
        country: string;
        description: string;
      }>,
    ) {
      const leagues = this.getLeaguesBySport(sport);
      const index = leagues.findIndex((league) => league.id === id);

      if (index !== -1) {
        leagues[index] = { ...leagues[index], ...updates };
        return leagues[index];
      }

      return null;
    },

    // Delete league
    deleteLeague: function (sport: "football" | "basketball", id: string) {
      const leagues = this.getLeaguesBySport(sport);
      const index = leagues.findIndex((league) => league.id === id);

      if (index !== -1) {
        leagues.splice(index, 1);
        return true;
      }

      return false;
    },
  },

  // Extras
  extras: {
    list: [
      {
        id: "breakfast",
        name: "Breakfast",
        description:
          "Start your day full of energy with breakfast for only 10 euros per person",
        price: 10,
        icon: "/stepper/icon/icon1.svg",
        currency: "EUR",
        maxQuantity: 10,
      },
      {
        id: "travel-insurance",
        name: "Travel Insurance",
        description:
          "Cover yourself for delays or strikes as well as medical insurance in the country you are going to.",
        price: 20,
        icon: "/stepper/icon/icon2.svg",
        currency: "EUR",
        maxQuantity: 10,
      },
      {
        id: "underseat-bag",
        name: "Underseat bag",
        description:
          "Check the measurements accepted by the airline you are flying with.",
        price: 0,
        icon: "/stepper/icon/icon3.svg",
        currency: "EUR",
        isIncluded: true,
      },
      {
        id: "extra-luggage",
        name: "Extra luggage",
        description: "Extra luggage (8kg- 10kg)",
        price: 40,
        icon: "/stepper/icon/icon4.svg",
        currency: "EUR",
        maxQuantity: 5,
      },
      {
        id: "seats-together",
        name: "Seats together",
        description:
          "Do you want to sit together on the flight? Otherwise the seats will be chosen randomly.",
        price: 20,
        icon: "/stepper/icon/icon5.svg",
        currency: "EUR",
        maxQuantity: 10,
      },
    ],

    getById: function (id: string) {
      return this.list.find((extra) => extra.id === id);
    },

    getIncluded: function () {
      return this.list.filter((extra) => extra.isIncluded);
    },
  },

  // Payment methods
  paymentMethods: {
    list: [
      { id: "card", name: "Credit/Debit Card", icon: "💳" },
      { id: "google", name: "Google Pay", icon: "📱" },
      { id: "apple", name: "Apple Pay", icon: "🍎" },
      { id: "paypal", name: "PayPal", icon: "🔵" },
    ],

    getById: function (id: string) {
      return this.list.find((method) => method.id === id);
    },
  },

  // FAQ data
  faqs: {
    list: [
      {
        id: 1,
        question: "What is GoGame?",
        answer:
          "GoGame is a surprise travel platform that creates unforgettable sports experiences. We organize everything for you — match tickets, flights, and hotel — but we only reveal the destination and event 48 hours before departure.",
      },
      {
        id: 2,
        question: "How far in advance should I book?",
        answer:
          "We recommend booking at least 2 to 4 weeks in advance to ensure availability, especially for major matches or during peak travel dates.",
      },
      {
        id: 3,
        question: "When will I find out my destination?",
        answer:
          "You’ll receive all the trip details — including destination, flights, and match information — 48 hours before departure.* *For Premier League events, we’ll notify you earlier so you can manage the necessary visa requirements.",
      },
      {
        id: 4,
        question: "Do I need a passport or ID?",
        answer:
          "Yes. You’ll need a valid passport or national ID, depending on the destination country and your nationality. Please make sure your document is valid for the selected travel dates.",
      },
      {
        id: 5,
        question: "What kind of accommodation is included?",
        answer:
          "All our packages include 3-star hotels (Standard Package) or 4–5-star hotels in premium locations (Premium Package). Breakfast is included with every booking.",
      },
      {
        id: 6,
        question: "Can I travel alone?",
        answer:
          "Absolutely! Solo travelers are welcome. Please note there is a €50 supplement for single bookings.",
      },
      {
        id: 7,
        question: "Can I cancel or modify a booking?",
        answer:
          "You can cancel or modify your booking up to 14 days before departure by paying a fee. After that, changes are subject to airline and hotel policies. For extra peace of mind, we recommend adding our flexible cancellation option when booking.",
      },
      {
        id: 8,
        question: "What luggage is included?",
        answer:
          "All packages include one cabin bag per passenger. You can add checked luggage during the booking process for an additional fee.",
      },
      {
        id: 9,
        question: "What are the flights like?",
        answer:
          "Flights are booked with trusted airlines and include economy class seating. You’ll have the option to choose specific flight times or upgrades at an extra cost.",
      },
      {
        id: 10,
        question: "What if my flight is delayed or cancelled?",
        answer:
          "GoGame is not responsible for flight delays or cancellations. If your flight is delayed or cancelled, remember your passenger rights: ● If the delay exceeds 4 hours, the airline must provide food and drinks. ● If the flight is moved to the next day, the airline must offer accommodation and transport to the assigned hotel. ● In case of cancellation, the airline must rebook you on another flight or refund your ticket. GoGame will assist and guide you in starting a claim if needed.",
      },
      {
        id: 11,
        question: "Can minors travel?",
        answer:
          "Yes, but minors must be accompanied by an adult. Unaccompanied minors are not allowed to travel.",
      },
      {
        id: 12,
        question: "Are there limitations for travelers with reduced mobility?",
        answer:
          "We welcome travelers with reduced mobility. Please let us know your needs during booking so we can arrange accessible accommodation and transportation.",
      },
    ],

    getById: function (id: number) {
      return this.list.find((faq) => faq.id === id);
    },

    getAll: function () {
      return this.list;
    },

    add: function (faq: { question: string; answer: string }) {
      const newId = Math.max(...this.list.map((item) => item.id)) + 1;
      const newFaq = { ...faq, id: newId };
      this.list.unshift(newFaq); // Add to beginning instead of end
      return newFaq;
    },

    update: function (
      id: number,
      updates: { question?: string; answer?: string },
    ) {
      const index = this.list.findIndex((faq) => faq.id === id);
      if (index !== -1) {
        this.list[index] = { ...this.list[index], ...updates };
        return this.list[index];
      }
      return null;
    },

    delete: function (id: number) {
      const index = this.list.findIndex((faq) => faq.id === id);
      if (index !== -1) {
        this.list.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  // Reviews/Testimonials data
  reviews: {
    list: [
      {
        id: 1,
        name: "Esther Howard",
        role: "Wellness Coach",
        image: "/homepage/image/avatar1.png",
        rating: 5,
        review:
          "I've used several travel platforms for my sports trips, but GoGame completely blew me away. The concept of booking a surprise destination and match was amazing!",
      },
      {
        id: 2,
        name: "Darlene",
        role: "Wellness Coach",
        image: "/homepage/image/avatar2.png",
        rating: 5,
        review:
          "GoGame provided an unforgettable experience for me and my friends. We chose football as our sport, and they organized everything perfectly",
      },
      {
        id: 3,
        name: "Brooklyn",
        role: "Wellness Coach",
        image: "/homepage/image/avatar3.png",
        rating: 5,
        review:
          "If you're a sports fan and love surprises, GoGame is for you! I booked a surprise football trip and was amazed by how well everything was organized.",
      },
      {
        id: 4,
        name: "Jenny Wilson",
        role: "Sports Enthusiast",
        image: "/homepage/image/avatar1.png",
        rating: 4,
        review:
          "The surprise element made the whole experience so exciting! The match we attended was incredible, though the hotel could have been better.",
      },
      {
        id: 5,
        name: "Robert Fox",
        role: "Travel Blogger",
        image: "/homepage/image/avatar2.png",
        rating: 5,
        review:
          "As someone who reviews travel experiences for a living, I can say GoGame offers something truly unique. Their attention to detail is impressive!",
      },
      {
        id: 6,
        name: "Wade Warren",
        role: "Football Fan",
        image: "/homepage/image/avatar3.png",
        rating: 5,
        review:
          "Watched my favorite team play in a stadium I never thought I'd visit! The surprise reveal was perfect, and the matchday experience was unforgettable.",
      },
    ],

    getById: function (id: number) {
      return this.list.find((review) => review.id === id);
    },

    getAll: function () {
      return this.list;
    },

    add: function (review: {
      name: string;
      role: string;
      image: string;
      rating: number;
      review: string;
    }) {
      const newId = Math.max(...this.list.map((item) => item.id)) + 1;
      const newReview = { ...review, id: newId };
      this.list.unshift(newReview); // Add to beginning for easy access
      return newReview;
    },

    update: function (
      id: number,
      updates: Partial<{
        name: string;
        role: string;
        image: string;
        rating: number;
        review: string;
      }>,
    ) {
      const index = this.list.findIndex((review) => review.id === id);
      if (index !== -1) {
        this.list[index] = { ...this.list[index], ...updates };
        return this.list[index];
      }
      return null;
    },

    delete: function (id: number) {
      const index = this.list.findIndex((review) => review.id === id);
      if (index !== -1) {
        this.list.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  // Time ranges for flights
  timeRanges: {
    departure: [
      {
        id: "early",
        name: "Early Morning",
        start: 360,
        end: 720,
        label: "06:00 - 12:00",
      },
      {
        id: "morning",
        name: "Morning",
        start: 480,
        end: 900,
        label: "08:00 - 15:00",
      },
      {
        id: "midday",
        name: "Midday",
        start: 540,
        end: 840,
        label: "09:00 - 14:00",
      },
      {
        id: "afternoon",
        name: "Afternoon",
        start: 600,
        end: 900,
        label: "10:00 - 15:00",
      },
    ],

    arrival: [
      {
        id: "evening",
        name: "Evening",
        start: 1080,
        end: 1800,
        label: "18:00 - 06:00(+1)",
      },
      {
        id: "night",
        name: "Night",
        start: 1020,
        end: 1440,
        label: "17:00 - 00:00",
      },
      {
        id: "late",
        name: "Late Night",
        start: 1140,
        end: 1800,
        label: "19:00 - 06:00(+1)",
      },
    ],
  },

  // League pricing data
  leaguePricing: {
    european: {
      additionalCost: 50,
      currency: "EUR",
      description: "European Competition surcharge",
    },
    national: {
      additionalCost: 0,
      currency: "EUR",
      description: "No additional cost for national leagues",
    },

    // Helper function to get additional cost for selected league
    getLeagueAdditionalCost: function (selectedLeague: string): number {
      if (selectedLeague === "european") {
        return this.european.additionalCost;
      }
      return this.national.additionalCost;
    },

    // Helper function to get league description
    getLeagueDescription: function (selectedLeague: string): string {
      if (selectedLeague === "european") {
        return this.european.description;
      }
      return this.national.description;
    },
  },

  // Pricing data based on sport, package, and nights
  pricingData: {
    football: {
      standard: {
        name: "GoGame Kickoff",
        prices: {
          1: 299,
          2: 379,
          3: 459,
          4: 529,
        },
      },
      premium: {
        name: "GoGame Legend",
        prices: {
          1: 1299,
          2: 1499,
          3: 1699,
          4: 1899,
        },
      },
    },
    basketball: {
      standard: {
        name: "GoGame Slam",
        prices: {
          1: 279,
          2: 359,
          3: 439,
          4: 509,
        },
      },
      premium: {
        name: "GoGame MVP",
        prices: {
          1: 1279,
          2: 1479,
          3: 1679,
          4: 1859,
        },
      },
    },

    // Helper function to get price
    getPrice: function (
      sport: "football" | "basketball",
      packageType: "standard" | "premium",
      nights: number,
    ): number {
      const sportData = this[sport];
      if (!sportData) return 0;

      const packageData = sportData[packageType];
      if (!packageData) return 0;

      return packageData.prices[nights as keyof typeof packageData.prices] || 0;
    },

    // Helper function to get package name
    getPackageName: function (
      sport: "football" | "basketball",
      packageType: "standard" | "premium",
    ): string {
      const sportData = this[sport];
      if (!sportData) return "";

      const packageData = sportData[packageType];
      if (!packageData) return "";

      return packageData.name;
    },
  },

  // Extras Data
  extrasData: {
    text: {
      title: "Mejora tu experiencia\n\n¡Añade extras a tu viaje!",
      titleEn: "Enhance your experience\n\nAdd extras to your trip!",
      perPerson: "Por persona",
      perPersonEn: "Per person",
      included: "Incluído",
      includedEn: "Included",
      add: "Añadir",
      addEn: "Add",
      remove: "Eliminar",
      removeEn: "Remove",
      confirm: "Confirmar",
      confirmEn: "Confirm",
      totalCost: "Coste Extra de Comodidad",
      totalCostEn: "Extra Comfort Cost",
    },
    constants: {
      currencySymbol: "€",
      defaultMaxQuantity: 10,
      minQuantity: 1,
    },
    initialExtras: [
      {
        id: "breakfast",
        name: "Desayuno",
        nameEn: "Breakfast",
        description:
          "Empieza tu día lleno de energía con desayuno por sólo 10 euros por persona.",
        descriptionEn:
          "Start your day full of energy with breakfast for only 10 euros per person.",
        price: 10,
        icon: "/stepper/icon/icon1.svg",
        isSelected: false, // Start with breakfast NOT selected
        quantity: 0,
        currency: "EUR",
        isIncluded: false, // Not included by default
        isGroupOption: true, // Group-only option
      },
      {
        id: "travel-insurance",
        name: "Seguro de Viaje",
        description:
          "Añade un seguro de viaje para mayor tranquilidad durante tu viaje.",
        price: 20,
        icon: "/stepper/icon/icon2.svg",
        isSelected: false,
        quantity: 0,
        currency: "EUR",
        isIncluded: false,
        isGroupOption: true, // Group-only option
      },
      {
        id: "underseat-bag",
        name: "Bolsa pequeña (debajo del asiento)",
        description:
          "Comprueba las medidas aceptadas por la aerolínea con la que volarás.",
        price: 0,
        icon: "/stepper/icon/icon3.svg",
        isSelected: true, // This is included by default
        quantity: 3, // 3 underseat bags included
        currency: "EUR",
        isIncluded: true, // This is included by default
        isGroupOption: false, // Individual option
      },
      {
        id: "extra-luggage",
        name: "Maleta extra",
        description: "Entre 8 y 10 kg.",
        price: 40,
        icon: "/stepper/icon/icon4.svg",
        isSelected: false,
        quantity: 0,
        currency: "EUR",
        isIncluded: false,
        maxQuantity: 5,
        isGroupOption: false, // Individual option
      },
      {
        id: "seats-together",
        name: "¡Sentaros juntos!",
        description:
          "¿Queréis sentaros juntos en el vuelo? Si no, los asientos se asignarán aleatoriamente.",
        price: 20,
        icon: "/stepper/icon/icon5.svg",
        isSelected: false,
        quantity: 0,
        currency: "EUR",
        isIncluded: false,
        maxQuantity: 10,
        isGroupOption: true, // Group-only option
      },
    ],
  },

  // Personal Info Data
  personalInfo: {
    text: {
      title: "Información",
      titleEn: "Information",
      primaryTravelerTitle: "Información del Primer Fanático/a",
      primaryTravelerTitleEn: "First Fan Information",
      extraTravelerTitle: "Fanático/a acompañante",
      extraTravelerTitleEn: "Accompanying Fan",
      reservationTitle: "Ya escucho los cánticos de los aficionados…",
      reservationTitleEn: "I can already hear the fans' chants...",
      paymentMethodTitle: "Método de pago",
      paymentMethodTitleEn: "Payment Method",
      confirm: "Confirmar",
      confirmEn: "Confirm",
      flightHotel: "Vuelo + Hotel",
      flightHotelEn: "Flight + Hotel",
      departure: "Salida",
      departureEn: "Departure",
      arrival: "Llegada",
      arrivalEn: "Arrival",
      backTo: "De vuelta a",
      backToEn: "Back to",
      flightScheduleAdjustments: "Ajustes de Horario de Vuelo",
      flightScheduleAdjustmentsEn: "Flight Schedule Adjustments",
      europeanCompetition: "Competición Europea",
      europeanCompetitionEn: "European Competition",
      leagueRemovals: "Eliminación de Ligas",
      leagueRemovalsEn: "League Removals",
      singleTravelerSupplement: "Suplemento Viajero Individual",
      singleTravelerSupplementEn: "Single Traveler Supplement",
      letsGo: "¡Vamos que nos vamos!",
      letsGoEn: "Let's go!",
      packageTotal: "Total del paquete:",
      packageTotalEn: "Package Total:",
      extrasTotal: "Total de extras:",
      extrasTotalEn: "Extras Total:",
      flightScheduleTotal: "Total horarios de vuelo:",
      flightScheduleTotalEn: "Flight Schedule Total:",
      totalCost: "Coste Total",
      totalCostEn: "Total Cost",
      quantity: "Cantidad",
      quantityEn: "Quantity",
      subtotal: "Subtotal",
      subtotalEn: "Subtotal",
      concept: "Concepto",
      conceptEn: "Concept",
      price: "Precio",
      priceEn: "Price",
      total: "Total",
      totalEn: "Total",
      packageFallback: "Paquete",
      packageFallbackEn: "Package",
    },
    travelerFields: {
      name: {
        label: "Nombre del Viajero (como en el pasaporte o DNI)",
        placeholder: "Escribe tu nombre",
        required: true,
      },
      email: {
        label: "Email del viajero",
        placeholder: "Escribe tu email",
        required: true,
        onlyForPrimary: true,
      },
      phone: {
        label: "Número de teléfono",
        placeholder: "Escribe tu número de teléfono",
        required: true,
        onlyForPrimary: true,
      },
      dateOfBirth: {
        label: "Fecha de nacimiento",
        required: true,
      },
      documentType: {
        label: "Tipo de Documento",
        id: "DNI",
        passport: "Pasaporte",
        required: true,
      },
      documentNumber: {
        label: "Número de Documento",
        placeholder: "Escribe tu número de documento",
        placeholderEn: "Enter your document number",
        required: true,
      },
    },
    formFields: {
      travelerName: {
        label: "Nombre del Viajero (como en el pasaporte o DNI)",
        placeholder: "Escribe tu nombre",
      },
      email: {
        label: "Email del viajero",
        placeholder: "Escribe tu email",
      },
      phone: {
        label: "Número de teléfono",
        placeholder: "Escribe tu número de teléfono",
      },
      dateOfBirth: {
        label: "Fecha de nacimiento",
      },
      documentType: {
        label: "Tipo de Documento",
        id: "DNI",
        passport: "Pasaporte",
      },
      documentNumber: {
        label: "Número de Documento",
        placeholder: "Escribe tu número de documento",
        placeholderEn: "Enter your document number",
      },
      previousTravelInfo: {
        label: "Experiencia deportiva anterior",
        labelEn: "Previous sports experience",
        placeholder:
          "¿Has viajado con nosotros antes? Si tu respuesta es SÍ, escríbenos a qué ciudad y a qué partido para que lo podamos tener en cuenta. ¡Muchas gracias!",
        placeholderEn:
          "Have you traveled with us before? If YES, let us know which city and match so we can take it into account. Thank you very much!",
      },
    },
    paymentMethods: [
      {
        value: "credit",
        label: "Tarjeta de crédito/débito",
        icon: "/stepper/icon/visa.png",
        alt: "Visa",
        additionalIcon: "/stepper/icon/mastercard.png",
        additionalAlt: "Mastercard",
      },
      {
        value: "google",
        label: "Google Pay",
        icon: "/stepper/icon/gpay.png",
        alt: "Google Pay",
      },
      {
        value: "apple",
        label: "Apple Pay",
        icon: "/stepper/icon/apay.png",
        alt: "Apple Pay",
      },
    ],
    reservationSummary: {
      title: "Ya escucho los cánticos de los aficionados…",
      departure: {
        city: "Madrid",
        date: "20 July 2025",
        label: "Salida: Madrid",
      },
      return: {
        city: "Madrid",
        date: "23 July 2025",
        label: "Llegada: De vuelta a Madrid",
      },
      pricing: {
        concept: "Concepto",
        price: "Precio",
        quantity: "Cantidad",
        total: "Total",
        barcelona: "Barcelona",
        priceValue: "150.00€",
        quantityValue: "x2",
        totalValue: "300.00€",
        returnPrice: "00.00€",
        returnTotal: "00.00€",
      },
      totalCost: "300.00€",
    },
    storage: {
      key: "personalinfo_form_data",
    },

    // Helper functions for traveler management
    createDefaultTraveler: function (): TravelerInfo {
      return {
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        documentType: "ID",
        documentNumber: "",
        isPrimary: false,
      };
    },

    createPrimaryTraveler: function (
      name: string,
      email: string,
      phone: string,
      dateOfBirth: string,
      documentType: "ID" | "Passport",
      documentNumber: string,
    ): TravelerInfo {
      return {
        name,
        email,
        phone,
        dateOfBirth,
        documentType,
        documentNumber,
        isPrimary: true,
      };
    },

    createExtraTraveler: function (
      name: string,
      dateOfBirth: string,
      documentType: "ID" | "Passport",
      documentNumber: string,
      travelerNumber: number,
    ): TravelerInfo {
      return {
        name,
        email: "",
        phone: "",
        dateOfBirth,
        documentType,
        documentNumber,
        isPrimary: false,
        travelerNumber,
      };
    },

    validateTraveler: function (
      traveler: TravelerInfo,
      isPrimary: boolean = false,
    ): { isValid: boolean; errors: string[] } {
      const errors: string[] = [];

      if (!traveler.name.trim()) {
        errors.push("Traveler name is required");
      }

      if (!traveler.dateOfBirth) {
        errors.push("Date of birth is required");
      }

      if (!traveler.documentType) {
        errors.push("Document type is required");
      }

      if (!traveler.documentNumber.trim()) {
        errors.push("Document number is required");
      }

      if (isPrimary) {
        if (!traveler.email.trim()) {
          errors.push("Email is required for primary traveler");
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(traveler.email)
        ) {
          errors.push("Invalid email format");
        }

        if (!traveler.phone.trim()) {
          errors.push("Phone number is required for primary traveler");
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },

    formatTravelerForDisplay: function (traveler: TravelerInfo): string {
      const age = traveler.dateOfBirth
        ? Math.floor(
            (Date.now() - new Date(traveler.dateOfBirth).getTime()) /
              (1000 * 60 * 60 * 24 * 365.25),
          )
        : 0;

      return `${traveler.name} (${age} years old, ${traveler.documentType}: ${traveler.documentNumber})`;
    },

    getTravelerAge: function (dateOfBirth: string): number {
      if (!dateOfBirth) return 0;
      return Math.floor(
        (Date.now() - new Date(dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25),
      );
    },

    categorizeTravelers: function (travelers: TravelerInfo[]): {
      adults: TravelerInfo[];
      kids: TravelerInfo[];
      babies: TravelerInfo[];
    } {
      const adults: TravelerInfo[] = [];
      const kids: TravelerInfo[] = [];
      const babies: TravelerInfo[] = [];

      travelers.forEach((traveler) => {
        const age = this.getTravelerAge(traveler.dateOfBirth);

        if (age >= 18) {
          adults.push(traveler);
        } else if (age >= 2) {
          kids.push(traveler);
        } else {
          babies.push(traveler);
        }
      });

      return { adults, kids, babies };
    },
  },

  // Payment Data
  payment: {
    text: {
      title: "Información de pago",
      titleEn: "Payment Information",
      paymentMethodTitle: "Método de pago",
      paymentMethodTitleEn: "Payment Method",
      creditCardTitle: "Tarjeta de crédito/débito",
      creditCardTitleEn: "Credit/Debit Card",
      nameOnCardLabel: "Nombre en la tarjeta",
      nameOnCardLabelEn: "Name on Card",
      nameOnCardPlaceholder: "Escribe tu nombre",
      nameOnCardPlaceholderEn: "Enter your name",
      cardNumberLabel: "Número de tarjeta",
      cardNumberLabelEn: "Card number",
      cardNumberPlaceholder: "1234 5678 9012 3456",
      cardNumberPlaceholderEn: "1234 5678 9012 3456",
      expiryLabel: "Caducidad",
      expiryLabelEn: "Expiry",
      expiryPlaceholder: "MM/AA",
      expiryPlaceholderEn: "MM/YY",
      cvvLabel: "CVV",
      cvvLabelEn: "CVV",
      cvvPlaceholder: "123",
      cvvPlaceholderEn: "123",
      confirmButton: "Confirmar Pago",
      confirmButtonEn: "Confirm Payment",
      processingButton: "Procesando...",
      processingButtonEn: "Processing...",
      successMessage: "¡Pago procesado con éxito!",
      successMessageEn: "Payment processed successfully!",
      errorMessage: "Pago fallido. Inténtalo de nuevo.",
      errorMessageEn: "Payment failed. Please try again.",
    },
    paymentMethods: [
      {
        value: "credit" as const,
        label: "Tarjeta de crédito/débito",
        icon: "/stepper/icon/visa.png",
        alt: "Visa",
        additionalIcon: "/stepper/icon/mastercard.png",
        additionalAlt: "Mastercard",
        description: "Secure payment with Visa or Mastercard",
        isAvailable: true,
      },
      {
        value: "google" as const,
        label: "Google Pay",
        icon: "/stepper/icon/gpay.png",
        alt: "Google Pay",
        description: "Fast and secure payment with Google Pay",
        isAvailable: true,
      },
      {
        value: "apple" as const,
        label: "Apple Pay",
        icon: "/stepper/icon/apay.png",
        alt: "Apple Pay",
        description: "Secure payment with Apple Pay",
        isAvailable: true,
      },
    ],
    creditCard: {
      supportedCards: [
        {
          name: "Visa",
          icon: "/stepper/icon/visa.png",
          alt: "Visa",
          width: 55,
          height: 17,
        },
        {
          name: "Mastercard",
          icon: "/stepper/icon/mastercard.png",
          alt: "Mastercard",
          width: 40,
          height: 25,
        },
      ],
      validation: {
        cardNumberLength: 16,
        cvvMinLength: 3,
        cvvMaxLength: 4,
        expiryFormat: "MM/YY",
      },
      formatting: {
        cardNumberSpacing: 4,
        expirySeparator: "/",
      },
    },
    processing: {
      delay: 2000,
      retryAttempts: 3,
      timeout: 30000,
    },
    storage: {
      key: "payment_form_data",
    },

    // Helper functions for payment processing
    getPaymentMethodByValue: function (value: "credit" | "google" | "apple") {
      return this.paymentMethods.find((method) => method.value === value);
    },

    getAllPaymentMethods: function () {
      return this.paymentMethods.filter((method) => method.isAvailable);
    },

    getSupportedCards: function () {
      return this.creditCard.supportedCards;
    },

    getValidationRules: function () {
      return this.creditCard.validation;
    },

    getFormattingRules: function () {
      return this.creditCard.formatting;
    },

    getProcessingConfig: function () {
      return this.processing;
    },

    // Payment processing simulation (replace with actual API calls)
    processPayment: async function (paymentData: {
      method: "credit" | "google" | "apple";
      creditCard?: {
        nameOnCard: string;
        cardNumber: string;
        expiryDate: string;
        cvv: string;
      };
      amount: number;
      currency: string;
      bookingId: string;
    }) {
      try {
        // Simulate API call delay
        await new Promise((resolve) =>
          setTimeout(resolve, this.processing.delay),
        );

        // TODO: Replace with actual payment API call
        // const response = await fetch('/api/payments/process', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(paymentData)
        // });
        //
        // if (!response.ok) {
        //   throw new Error('Payment processing failed');
        // }
        //
        // return await response.json();

        // Simulate successful payment
        return {
          success: true,
          transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: "completed",
          amount: paymentData.amount,
          currency: paymentData.currency,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Payment processing error:", error);
        throw new Error("Payment processing failed");
      }
    },

    // Validate credit card data
    validateCreditCard: function (cardData: {
      nameOnCard: string;
      cardNumber: string;
      expiryDate: string;
      cvv: string;
    }) {
      const validation = this.creditCard.validation;
      const errors: string[] = [];

      if (!cardData.nameOnCard.trim()) {
        errors.push("Cardholder name is required");
      }

      const cleanCardNumber = cardData.cardNumber.replace(/\s/g, "");
      if (cleanCardNumber.length !== validation.cardNumberLength) {
        errors.push(
          `Card number must be ${validation.cardNumberLength} digits`,
        );
      }

      if (
        cardData.expiryDate.length !== 5 ||
        !cardData.expiryDate.includes("/")
      ) {
        errors.push("Expiry date must be in MM/YY format");
      }

      if (
        cardData.cvv.length < validation.cvvMinLength ||
        cardData.cvv.length > validation.cvvMaxLength
      ) {
        errors.push(
          `CVV must be ${validation.cvvMinLength}-${validation.cvvMaxLength} digits`,
        );
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },

    // Format credit card input
    formatCardNumber: function (cardNumber: string): string {
      const cleaned = cardNumber.replace(/\D/g, "");
      const spacing = this.creditCard.formatting.cardNumberSpacing;
      const formatted = cleaned
        .replace(new RegExp(`(.{${spacing}})`, "g"), "$1 ")
        .trim();
      return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
    },

    formatExpiryDate: function (expiry: string): string {
      const cleaned = expiry.replace(/\D/g, "");
      const separator = this.creditCard.formatting.expirySeparator;
      if (cleaned.length >= 2) {
        return `${cleaned.substring(0, 2)}${separator}${cleaned.substring(2, 4)}`;
      }
      return cleaned;
    },

    formatCvv: function (cvv: string): string {
      return cvv
        .replace(/\D/g, "")
        .substring(0, this.creditCard.validation.cvvMaxLength);
    },
  },

  // Initialize with dummy data
  initialize: function () {
    // Add dummy bookings
    this.bookings.all = [
      {
        id: 1,
        status: "completed",
        selectedSport: "football",
        selectedPackage: "standard",
        selectedCity: "alicante",
        selectedLeague: "national",
        adults: 1,
        kids: 0,
        babies: 0,
        totalPeople: 1,
        departureDate: "2025-08-20T18:00:00.000Z",
        returnDate: "2025-08-23T18:00:00.000Z",
        departureDateFormatted: "8/21/2025",
        returnDateFormatted: "8/24/2025",
        departureTimeStart: 360,
        departureTimeEnd: 720,
        arrivalTimeStart: 1080,
        arrivalTimeEnd: 1800,
        departureTimeRange: "06:00 - 12:00",
        arrivalTimeRange: "18:00 - 06:00(+1)",
        removedLeagues: [],
        removedLeaguesCount: 0,
        hasRemovedLeagues: false,
        allExtras: this.extras.list.map((extra) => ({
          ...extra,
          isSelected: false,
          quantity: 1,
        })),
        selectedExtras: [
          {
            ...this.extras.getById("underseat-bag")!,
            isSelected: true,
            quantity: 3,
          },
          {
            ...this.extras.getById("extra-luggage")!,
            isSelected: true,
            quantity: 3,
          },
        ],
        selectedExtrasNames: ["Underseat bag", "Extra luggage"],
        totalExtrasCost: 120,
        extrasCount: 2,
        firstName: "Aut",
        lastName: "vitae perferendi",
        fullName: "Aut vitae perferendi",
        email: "daryjiq@mailinator.com",
        phone: "+1 (726) 455-4453",
        paymentMethod: "google",
        cardNumber: null,
        expiryDate: null,
        cvv: null,
        cardholderName: null,
        bookingTimestamp: "2025-08-01T03:32:56.174Z",
        bookingDate: "8/14/2025",
        bookingTime: "9:32:56 AM",
        isBookingComplete: true,
        travelDuration: 4,
        hasFlightPreferences: true,
        requiresEuropeanLeagueHandling: false,
        destinationCity: "",
        assignedMatch: "",
        previousTravelInfo:
          "Yes, I traveled to Barcelona for the Champions League match in 2021",
        // Traveler information
        primaryTraveler: {
          name: "Aut vitae perferendi",
          email: "daryjiq@mailinator.com",
          phone: "+1 (726) 455-4453",
          dateOfBirth: "1990-05-15",
          documentType: "Passport",
          documentNumber: "AB1234567",
          isPrimary: true,
        },
        extraTravelers: [],
        allTravelers: [
          {
            name: "Aut vitae perferendi",
            email: "daryjiq@mailinator.com",
            phone: "+1 (726) 455-4453",
            dateOfBirth: "1990-05-15",
            documentType: "Passport",
            documentNumber: "AB1234567",
            isPrimary: true,
          },
        ],
      },
      {
        id: 2,
        status: "pending",
        selectedSport: "basketball",
        selectedPackage: "premium",
        selectedCity: "madrid",
        selectedLeague: "european",
        adults: 2,
        kids: 1,
        babies: 0,
        totalPeople: 3,
        departureDate: "2025-09-15T18:00:00.000Z",
        returnDate: "2025-09-20T18:00:00.000Z",
        departureDateFormatted: "9/16/2025",
        returnDateFormatted: "9/21/2025",
        departureTimeStart: 480,
        departureTimeEnd: 900,
        arrivalTimeStart: 1200,
        arrivalTimeEnd: 1800,
        departureTimeRange: "08:00 - 15:00",
        arrivalTimeRange: "20:00 - 06:00(+1)",
        removedLeagues: ["local"],
        removedLeaguesCount: 1,
        hasRemovedLeagues: true,
        allExtras: this.extras.list.map((extra) => ({
          ...extra,
          isSelected: false,
          quantity: 1,
        })),
        selectedExtras: [
          {
            ...this.extras.getById("breakfast")!,
            isSelected: true,
            quantity: 3,
          },
          {
            ...this.extras.getById("travel-insurance")!,
            isSelected: true,
            quantity: 3,
          },
          {
            ...this.extras.getById("underseat-bag")!,
            isSelected: true,
            quantity: 3,
          },
          {
            ...this.extras.getById("seats-together")!,
            isSelected: true,
            quantity: 3,
          },
        ],
        selectedExtrasNames: [
          "Breakfast",
          "Travel Insurance",
          "Underseat bag",
          "Seats together",
        ],
        totalExtrasCost: 90,
        extrasCount: 4,
        firstName: "John",
        lastName: "1",
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+34 612 345 678",
        paymentMethod: "card",
        cardNumber: "**** **** **** 1234",
        expiryDate: "12/26",
        cvv: "***",
        cardholderName: "John Doe",
        bookingTimestamp: "2025-08-11T10:15:30.000Z",
        bookingDate: "8/11/2025",
        bookingTime: "12:15:30 PM",
        isBookingComplete: true,
        travelDuration: 6,
        hasFlightPreferences: true,
        requiresEuropeanLeagueHandling: true,
        destinationCity: "",
        assignedMatch: "",
        previousTravelInfo:
          "Yes, I traveled to Barcelona for the Champions League match in 2023",
        // Traveler information for 3 people (2 adults + 1 kid)
        primaryTraveler: {
          name: "John Doe",
          email: "john.doe@example.com",
          phone: "+34 612 345 678",
          dateOfBirth: "1985-03-20",
          documentType: "Passport",
          documentNumber: "CD9876543",
          isPrimary: true,
        },
        extraTravelers: [
          {
            name: "Jane Doe",
            email: "",
            phone: "",
            dateOfBirth: "1988-07-12",
            documentType: "ID",
            documentNumber: "12345678A",
            isPrimary: false,
            travelerNumber: 2,
          },
          {
            name: "Tommy Doe",
            email: "",
            phone: "",
            dateOfBirth: "2010-11-05",
            documentType: "ID",
            documentNumber: "87654321B",
            isPrimary: false,
            travelerNumber: 3,
          },
        ],
        allTravelers: [
          {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "+34 612 345 678",
            dateOfBirth: "1985-03-20",
            documentType: "Passport",
            documentNumber: "CD9876543",
            isPrimary: true,
          },
          {
            name: "Jane Doe",
            email: "",
            phone: "",
            dateOfBirth: "1988-07-12",
            documentType: "ID",
            documentNumber: "12345678A",
            isPrimary: false,
            travelerNumber: 2,
          },
          {
            name: "Tommy Doe",
            email: "",
            phone: "",
            dateOfBirth: "2010-11-05",
            documentType: "ID",
            documentNumber: "87654321B",
            isPrimary: false,
            travelerNumber: 3,
          },
        ],
      },
      {
        id: 3,
        status: "pending",
        selectedSport: "football",
        selectedPackage: "standard",
        selectedCity: "barcelona",
        selectedLeague: "european",
        adults: 2,
        kids: 0,
        babies: 0,
        totalPeople: 2,
        departureDate: "2025-09-30T18:00:00.000Z",
        returnDate: "2025-10-02T18:00:00.000Z",
        departureDateFormatted: "10/1/2025",
        returnDateFormatted: "10/3/2025",
        departureTimeStart: 360,
        departureTimeEnd: 720,
        arrivalTimeStart: 1080,
        arrivalTimeEnd: 1800,
        departureTimeRange: "06:00 - 12:00",
        arrivalTimeRange: "18:00 - 06:00(+1)",
        removedLeagues: [],
        removedLeaguesCount: 0,
        hasRemovedLeagues: false,
        allExtras: this.extras.list.map((extra) => ({
          ...extra,
          isSelected: false,
          quantity: 1,
        })),
        selectedExtras: [
          {
            ...this.extras.getById("travel-insurance")!,
            isSelected: true,
            quantity: 2,
          },
        ],
        selectedExtrasNames: ["Travel Insurance"],
        totalExtrasCost: 20,
        extrasCount: 1,
        firstName: "Ahmed",
        lastName: "Hassan",
        fullName: "Ahmed Hassan",
        email: "ahmed.hassan@example.com",
        phone: "+34 611 222 333",
        paymentMethod: "card",
        cardNumber: "**** **** **** 5678",
        expiryDate: "08/26",
        cvv: "***",
        cardholderName: "Ahmed Hassan",
        bookingTimestamp: "2025-09-15T14:30:00.000Z",
        bookingDate: "9/15/2025",
        bookingTime: "4:30:00 PM",
        isBookingComplete: true,
        travelDuration: 3,
        hasFlightPreferences: true,
        requiresEuropeanLeagueHandling: true,
        destinationCity: "",
        assignedMatch: "",
        previousTravelInfo: "First time traveling for football matches",
        primaryTraveler: {
          name: "Ahmed Hassan",
          email: "ahmed.hassan@example.com",
          phone: "+34 611 222 333",
          dateOfBirth: "1992-07-10",
          documentType: "Passport",
          documentNumber: "EF4567890",
          isPrimary: true,
        },
        extraTravelers: [
          {
            name: "Sarah Hassan",
            email: "sarah.hassan@example.com",
            phone: "+34 611 222 334",
            dateOfBirth: "1995-11-25",
            documentType: "Passport",
            documentNumber: "GH5678901",
            isPrimary: false,
            travelerNumber: 2,
          },
        ],
        allTravelers: [
          {
            name: "Ahmed Hassan",
            email: "ahmed.hassan@example.com",
            phone: "+34 611 222 333",
            dateOfBirth: "1992-07-10",
            documentType: "Passport",
            documentNumber: "EF4567890",
            isPrimary: true,
            travelerNumber: 1,
          },
          {
            name: "Sarah Hassan",
            email: "sarah.hassan@example.com",
            phone: "+34 611 222 334",
            dateOfBirth: "1995-11-25",
            documentType: "Passport",
            documentNumber: "GH5678901",
            isPrimary: false,
            travelerNumber: 2,
          },
        ],
      },
      {
        id: 4,
        status: "completed",
        selectedSport: "basketball",
        selectedPackage: "premium",
        selectedCity: "madrid",
        selectedLeague: "national",
        adults: 1,
        kids: 0,
        babies: 0,
        totalPeople: 1,
        departureDate: "2025-10-15T18:00:00.000Z",
        returnDate: "2025-10-17T18:00:00.000Z",
        departureDateFormatted: "10/16/2025",
        returnDateFormatted: "10/18/2025",
        departureTimeStart: 480,
        departureTimeEnd: 900,
        arrivalTimeStart: 1200,
        arrivalTimeEnd: 1800,
        departureTimeRange: "08:00 - 15:00",
        arrivalTimeRange: "20:00 - 06:00(+1)",
        removedLeagues: [],
        removedLeaguesCount: 0,
        hasRemovedLeagues: false,
        allExtras: this.extras.list.map((extra) => ({
          ...extra,
          isSelected: false,
          quantity: 1,
        })),
        selectedExtras: [
          {
            ...this.extras.getById("breakfast")!,
            isSelected: true,
            quantity: 1,
          },
          {
            ...this.extras.getById("extra-luggage")!,
            isSelected: true,
            quantity: 1,
          },
        ],
        selectedExtrasNames: ["Breakfast", "Extra luggage"],
        totalExtrasCost: 35,
        extrasCount: 2,
        firstName: "Maria",
        lastName: "Rodriguez",
        fullName: "Maria Rodriguez",
        email: "maria.rodriguez@example.com",
        phone: "+34 612 999 888",
        paymentMethod: "google",
        cardNumber: null,
        expiryDate: null,
        cvv: null,
        cardholderName: null,
        bookingTimestamp: "2025-09-20T09:45:00.000Z",
        bookingDate: "9/20/2025",
        bookingTime: "11:45:00 AM",
        isBookingComplete: true,
        travelDuration: 3,
        hasFlightPreferences: true,
        requiresEuropeanLeagueHandling: false,
        destinationCity: "Madrid",
        assignedMatch: "Real Madrid vs Barcelona",
        previousTravelInfo:
          "Regular basketball fan, traveled to EuroLeague games before",
        primaryTraveler: {
          name: "Maria Rodriguez",
          email: "maria.rodriguez@example.com",
          phone: "+34 612 999 888",
          dateOfBirth: "1988-04-12",
          documentType: "ID",
          documentNumber: "12345678A",
          isPrimary: true,
        },
        extraTravelers: [],
        allTravelers: [
          {
            name: "Maria Rodriguez",
            email: "maria.rodriguez@example.com",
            phone: "+34 612 999 888",
            dateOfBirth: "1988-04-12",
            documentType: "ID",
            documentNumber: "12345678A",
            isPrimary: true,
            travelerNumber: 1,
          },
        ],
      },
      {
        id: 5,
        status: "pending",
        selectedSport: "football",
        selectedPackage: "standard",
        selectedCity: "valencia",
        selectedLeague: "european",
        adults: 3,
        kids: 1,
        babies: 0,
        totalPeople: 4,
        departureDate: "2025-10-28T18:00:00.000Z",
        returnDate: "2025-10-31T18:00:00.000Z",
        departureDateFormatted: "10/29/2025",
        returnDateFormatted: "11/1/2025",
        departureTimeStart: 360,
        departureTimeEnd: 720,
        arrivalTimeStart: 1080,
        arrivalTimeEnd: 1800,
        departureTimeRange: "06:00 - 12:00",
        arrivalTimeRange: "18:00 - 06:00(+1)",
        removedLeagues: ["local", "regional"],
        removedLeaguesCount: 2,
        hasRemovedLeagues: true,
        allExtras: this.extras.list.map((extra) => ({
          ...extra,
          isSelected: false,
          quantity: 1,
        })),
        selectedExtras: [
          {
            ...this.extras.getById("travel-insurance")!,
            isSelected: true,
            quantity: 4,
          },
          {
            ...this.extras.getById("seats-together")!,
            isSelected: true,
            quantity: 4,
          },
          {
            ...this.extras.getById("breakfast")!,
            isSelected: true,
            quantity: 4,
          },
        ],
        selectedExtrasNames: [
          "Travel Insurance",
          "Seats together",
          "Breakfast",
        ],
        totalExtrasCost: 60,
        extrasCount: 3,
        firstName: "David",
        lastName: "Johnson",
        fullName: "David Johnson",
        email: "david.johnson@example.com",
        phone: "+44 20 7946 0958",
        paymentMethod: "card",
        cardNumber: "**** **** **** 9999",
        expiryDate: "06/27",
        cvv: "***",
        cardholderName: "David Johnson",
        bookingTimestamp: "2025-09-25T16:20:00.000Z",
        bookingDate: "9/25/2025",
        bookingTime: "6:20:00 PM",
        isBookingComplete: true,
        travelDuration: 4,
        hasFlightPreferences: true,
        requiresEuropeanLeagueHandling: true,
        destinationCity: "",
        assignedMatch: "",
        previousTravelInfo: "Family trip for Champions League experience",
        primaryTraveler: {
          name: "David Johnson",
          email: "david.johnson@example.com",
          phone: "+44 20 7946 0958",
          dateOfBirth: "1980-12-03",
          documentType: "Passport",
          documentNumber: "IJ9012345",
          isPrimary: true,
        },
        extraTravelers: [
          {
            name: "Emma Johnson",
            email: "emma.johnson@example.com",
            phone: "+44 20 7946 0959",
            dateOfBirth: "1983-08-15",
            documentType: "Passport",
            documentNumber: "KL0123456",
            isPrimary: false,
            travelerNumber: 2,
          },
          {
            name: "Tom Johnson",
            email: "tom.johnson@example.com",
            phone: "+44 20 7946 0960",
            dateOfBirth: "2010-03-22",
            documentType: "Passport",
            documentNumber: "MN1234567",
            isPrimary: false,
            travelerNumber: 3,
          },
          {
            name: "Sophie Johnson",
            email: "sophie.johnson@example.com",
            phone: "+44 20 7946 0961",
            dateOfBirth: "2015-11-08",
            documentType: "Passport",
            documentNumber: "OP2345678",
            isPrimary: false,
            travelerNumber: 4,
          },
        ],
        allTravelers: [
          {
            name: "David Johnson",
            email: "david.johnson@example.com",
            phone: "+44 20 7946 0958",
            dateOfBirth: "1980-12-03",
            documentType: "Passport",
            documentNumber: "IJ9012345",
            isPrimary: true,
            travelerNumber: 1,
          },
          {
            name: "Emma Johnson",
            email: "emma.johnson@example.com",
            phone: "+44 20 7946 0959",
            dateOfBirth: "1983-08-15",
            documentType: "Passport",
            documentNumber: "KL0123456",
            isPrimary: false,
            travelerNumber: 2,
          },
          {
            name: "Tom Johnson",
            email: "tom.johnson@example.com",
            phone: "+44 20 7946 0960",
            dateOfBirth: "2010-03-22",
            documentType: "Passport",
            documentNumber: "MN1234567",
            isPrimary: false,
            travelerNumber: 3,
          },
          {
            name: "Sophie Johnson",
            email: "sophie.johnson@example.com",
            phone: "+44 20 7946 0961",
            dateOfBirth: "2015-11-08",
            documentType: "Passport",
            documentNumber: "OP2345678",
            isPrimary: false,
            travelerNumber: 4,
          },
        ],
      },
    ];

    // Update status arrays
    this.bookings.updateStatusArrays();
  },

  // API integration methods (for future use)
  api: {
    // Fetch all data from backend
    fetchAll: async function () {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/app-data');
      // const data = await response.json();
      // return data;
      return null;
    },

    // Update specific section
    updateSection: async function (section: string) {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/${section}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // return response.json();
      return null;
    },
  },

  // About Page Data
  aboutPage: {
    // Hero section
    hero: {
      title: "About us",
      backgroundImage: "/homepage/packbg.png",
    },

    // Main content sections
    content: {
      headline: "We turn sports into unforgettable surprise adventures.",
      sections: [
        {
          id: "who-we-are",
          title: "Who we are",
          description:
            "GoGame is a sports travel platform with a twist: the destination and the match are a surprise until 48 hours before you travel. We organize everything — flights, hotel, and tickets — so you only need to enjoy the experience.",
          order: 1,
        },
        {
          id: "our-story",
          title: "Our Story",
          description:
            "GoGame was born from our passion for sports and travel. After years of following matches across Europe, we realized that fans love both the adrenaline of the game and the adventure of discovering new places — so we decided to combine them.",
          order: 2,
        },
        {
          id: "mission",
          title: "Mission",
          description:
            "To bring fans closer to live sports while adding the thrill of surprise. We create complete, worry-free trips that turn every match into a unique adventure.",
          order: 3,
        },
        {
          id: "vision",
          title: "Vision",
          description:
            "To become the leading platform for surprise sports travel in Europe, creating a global community of fans who explore new cities and live sports in a different, exciting way.",
          order: 4,
        },
      ],

      // Values section
      values: {
        title: "Our Values",
        items: [
          {
            id: "passion-sports",
            title: "Passion for sports",
            description: "We believe live matches are unforgettable moments.",
            order: 1,
          },
          {
            id: "adventure-surprise",
            title: "Adventure & surprise",
            description:
              "Every trip should feel as thrilling as the game itself.",
            order: 2,
          },
          {
            id: "trust-simplicity",
            title: "Trust & simplicity",
            description: "We take care of everything so you can just enjoy.",
            order: 3,
          },
          {
            id: "community",
            title: "Community",
            description:
              "Sports are better when shared — we connect fans everywhere.",
            order: 4,
          },
        ],
      },

      // Why choose us section
      whyChooseUs: {
        title: "Why choose us",
        items: [
          {
            id: "unique-concept",
            title: "Unique concept",
            description: "The destination is always a surprise.",
            order: 1,
          },
          {
            id: "all-in-one-packs",
            title: "All-in-one packs",
            description: "Flights, hotel, and tickets.",
            order: 2,
          },
          {
            id: "accessible",
            title: "Accessible",
            description: "Standard and Premium options for all budgets.",
            order: 3,
          },
          {
            id: "growing-community",
            title: "Growing community",
            description:
              "A growing community of fans who love to travel and cheer together.",
            order: 4,
          },
        ],
      },

      // CTA section
      cta: {
        text: "Ready to play the game of your life? Discover your pack today.",
        buttonText: "Start the Game",
        buttonLink: "/packages",
      },
    },

    // Helper functions
    getHeroData: function () {
      return this.hero;
    },

    getContentData: function () {
      return this.content;
    },

    getSections: function () {
      return this.content.sections.sort((a, b) => a.order - b.order);
    },

    getValues: function () {
      return this.content.values.items.sort((a, b) => a.order - b.order);
    },

    getWhyChooseUs: function () {
      return this.content.whyChooseUs.items.sort((a, b) => a.order - b.order);
    },

    getCtaData: function () {
      return this.content.cta;
    },

    // Update functions
    updateSection: function (
      sectionId: string,
      updates: Partial<{
        title: string;
        description: string;
        order: number;
      }>,
    ) {
      const section = this.content.sections.find((s) => s.id === sectionId);
      if (section) {
        Object.assign(section, updates);
        return section;
      }
      return null;
    },

    updateValue: function (
      valueId: string,
      updates: Partial<{
        title: string;
        description: string;
        order: number;
      }>,
    ) {
      const value = this.content.values.items.find((v) => v.id === valueId);
      if (value) {
        Object.assign(value, updates);
        return value;
      }
      return null;
    },

    updateWhyChooseUs: function (
      itemId: string,
      updates: Partial<{
        title: string;
        description: string;
        order: number;
      }>,
    ) {
      const item = this.content.whyChooseUs.items.find((i) => i.id === itemId);
      if (item) {
        Object.assign(item, updates);
        return item;
      }
      return null;
    },

    updateCta: function (
      updates: Partial<{
        text: string;
        buttonText: string;
        buttonLink: string;
      }>,
    ) {
      Object.assign(this.content.cta, updates);
      return this.content.cta;
    },

    updateHero: function (
      updates: Partial<{
        title: string;
        backgroundImage: string;
      }>,
    ) {
      Object.assign(this.hero, updates);
      return this.hero;
    },

    updateContent: function (
      updates: Partial<{
        headline: string;
      }>,
    ) {
      Object.assign(this.content, updates);
      return this.content;
    },

    // Add new items
    addSection: function (sectionData: {
      title: string;
      description: string;
      order: number;
    }) {
      const newId = `section_${Date.now()}`;
      const newSection = { ...sectionData, id: newId };
      this.content.sections.push(newSection);
      return newSection;
    },

    addValue: function (valueData: {
      title: string;
      description: string;
      order: number;
    }) {
      const newId = `value_${Date.now()}`;
      const newValue = { ...valueData, id: newId };
      this.content.values.items.push(newValue);
      return newValue;
    },

    addWhyChooseUs: function (itemData: {
      title: string;
      description: string;
      order: number;
    }) {
      const newId = `whyChooseUs_${Date.now()}`;
      const newItem = { ...itemData, id: newId };
      this.content.whyChooseUs.items.push(newItem);
      return newItem;
    },

    // Delete items
    deleteSection: function (sectionId: string) {
      const index = this.content.sections.findIndex((s) => s.id === sectionId);
      if (index !== -1) {
        this.content.sections.splice(index, 1);
        return true;
      }
      return false;
    },

    deleteValue: function (valueId: string) {
      const index = this.content.values.items.findIndex(
        (v) => v.id === valueId,
      );
      if (index !== -1) {
        this.content.values.items.splice(index, 1);
        return true;
      }
      return false;
    },

    deleteWhyChooseUs: function (itemId: string) {
      const index = this.content.whyChooseUs.items.findIndex(
        (i) => i.id === itemId,
      );
      if (index !== -1) {
        this.content.whyChooseUs.items.splice(index, 1);
        return true;
      }
      return false;
    },
  },

  // Date Restrictions Management - Calendar-based system
  dateRestrictions: {
    european: {
      enabledDates: [
        "2025-09-22",
        "2025-09-23",
        "2025-09-25",
        "2025-09-28",
        "2025-09-30",
        "2025-10-02",
        "2025-10-05",
        "2025-10-07",
        "2025-10-10",
        "2025-10-12",
        "2025-10-14",
        "2025-10-17",
        "2025-10-19",
        "2025-10-21",
        "2025-10-24",
        "2025-10-26",
        "2025-10-28",
        "2025-10-29",
        "2025-10-30",
        "2025-10-31",
      ], // Specific dates that are enabled
      blockedDates: [] as string[], // Specific dates that are blocked
      customPrices: {
        "2025-09-30": {
          football: {
            standard: 429,
            premium: 1529,
          },
          basketball: {
            standard: 399,
            premium: 1479,
          },
        },
        "2025-10-14": {
          football: {
            standard: 479,
            premium: 1579,
          },
        },
        "2025-10-28": {
          basketball: {
            standard: 419,
            premium: 1519,
          },
        },
      } as Record<
        string,
        {
          football?: {
            standard?: number;
            premium?: number;
          };
          basketball?: {
            standard?: number;
            premium?: number;
          };
        }
      >, // Date-specific pricing overrides
    },
    national: {
      enabledDates: [
        "2025-09-22",
        "2025-09-24",
        "2025-09-26",
        "2025-09-29",
        "2025-10-01",
        "2025-10-03",
        "2025-10-06",
        "2025-10-08",
        "2025-10-11",
        "2025-10-13",
        "2025-10-15",
        "2025-10-18",
        "2025-10-20",
        "2025-10-22",
        "2025-10-25",
        "2025-10-27",
        "2025-10-29",
        "2025-10-31",
      ], // Specific dates that are enabled
      blockedDates: [] as string[], // Specific dates that are blocked
      customPrices: {
        "2025-10-01": {
          football: {
            standard: 399,
            premium: 1499,
          },
        },
        "2025-10-15": {
          basketball: {
            standard: 379,
            premium: 1479,
          },
        },
        "2025-10-29": {
          football: {
            standard: 449,
            premium: 1549,
          },
          basketball: {
            standard: 429,
            premium: 1529,
          },
        },
      } as Record<
        string,
        {
          football?: {
            standard?: number;
            premium?: number;
          };
          basketball?: {
            standard?: number;
            premium?: number;
          };
        }
      >, // Date-specific pricing overrides
    },

    // Helper functions for date restrictions
    getRestrictions: function (competitionType: "european" | "national") {
      return this[competitionType];
    },

    updateRestrictions: function (
      competitionType: "european" | "national",
      updates: {
        enabledDates?: string[];
        blockedDates?: string[];
        customPrices?: Record<
          string,
          {
            football?: {
              standard?: number;
              premium?: number;
            };
            basketball?: {
              standard?: number;
              premium?: number;
            };
          }
        >;
      },
    ) {
      if (this[competitionType]) {
        this[competitionType] = { ...this[competitionType], ...updates };
        return this[competitionType];
      }
      return null;
    },

    getAllRestrictions: function () {
      return this;
    },

    isDateAllowed: function (
      competitionType: "european" | "national",
      date: Date,
    ) {
      const restrictions = this.getRestrictions(competitionType);
      if (!restrictions) return false;

      const dateString = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      // Check if date is explicitly blocked
      if (restrictions.blockedDates.includes(dateString)) {
        return false;
      }

      // Check if date is explicitly enabled
      return restrictions.enabledDates.includes(dateString);
    },

    // Helper function to format date for storage
    formatDateForStorage: function (date: Date): string {
      return date.toISOString().split("T")[0];
    },

    // Helper function to parse stored date
    parseStoredDate: function (dateString: string): Date {
      return new Date(dateString + "T00:00:00.000Z");
    },

    // Add a date to enabled dates
    enableDate: function (
      competitionType: "european" | "national",
      date: Date,
    ) {
      const restrictions = this.getRestrictions(competitionType);
      if (!restrictions) return false;

      const dateString = this.formatDateForStorage(date);

      // Remove from blocked dates if it exists there
      const blockedIndex = restrictions.blockedDates.indexOf(dateString);
      if (blockedIndex > -1) {
        restrictions.blockedDates.splice(blockedIndex, 1);
      }

      // Add to enabled dates if not already there
      if (!restrictions.enabledDates.includes(dateString)) {
        restrictions.enabledDates.push(dateString);
        restrictions.enabledDates.sort(); // Keep sorted
      }

      return true;
    },

    // Add a date to blocked dates
    blockDate: function (competitionType: "european" | "national", date: Date) {
      const restrictions = this.getRestrictions(competitionType);
      if (!restrictions) return false;

      const dateString = this.formatDateForStorage(date);

      // Remove from enabled dates if it exists there
      const enabledIndex = restrictions.enabledDates.indexOf(dateString);
      if (enabledIndex > -1) {
        restrictions.enabledDates.splice(enabledIndex, 1);
      }

      // Add to blocked dates if not already there
      if (!restrictions.blockedDates.includes(dateString)) {
        restrictions.blockedDates.push(dateString);
        restrictions.blockedDates.sort(); // Keep sorted
      }

      return true;
    },

    // Remove a date from both enabled and blocked lists (neutral state)
    removeDate: function (
      competitionType: "european" | "national",
      date: Date,
    ) {
      const restrictions = this.getRestrictions(competitionType);
      if (!restrictions) return false;

      const dateString = this.formatDateForStorage(date);

      // Remove from both lists
      const enabledIndex = restrictions.enabledDates.indexOf(dateString);
      if (enabledIndex > -1) {
        restrictions.enabledDates.splice(enabledIndex, 1);
      }

      const blockedIndex = restrictions.blockedDates.indexOf(dateString);
      if (blockedIndex > -1) {
        restrictions.blockedDates.splice(blockedIndex, 1);
      }

      return true;
    },

    // Get date status (enabled, blocked, or neutral)
    getDateStatus: function (
      competitionType: "european" | "national",
      date: Date,
    ): "enabled" | "blocked" | "neutral" {
      const restrictions = this.getRestrictions(competitionType);
      if (!restrictions) return "neutral";

      const dateString = this.formatDateForStorage(date);

      if (restrictions.enabledDates.includes(dateString)) {
        return "enabled";
      } else if (restrictions.blockedDates.includes(dateString)) {
        return "blocked";
      } else {
        return "neutral";
      }
    },

    // Pricing management functions
    setCustomPrice: function (
      competitionType: "european" | "national",
      date: Date,
      sport: "football" | "basketball",
      packageType: "standard" | "premium",
      price: number,
    ) {
      const restrictions = this.getRestrictions(competitionType);
      if (!restrictions) return false;

      const dateString = this.formatDateForStorage(date);

      // Initialize customPrices if it doesn't exist
      if (!restrictions.customPrices[dateString]) {
        restrictions.customPrices[dateString] = {};
      }

      // Initialize sport if it doesn't exist
      if (!restrictions.customPrices[dateString][sport]) {
        restrictions.customPrices[dateString][sport] = {};
      }

      // Set the price
      restrictions.customPrices[dateString][sport]![packageType] = price;

      return true;
    },

    getCustomPrice: function (
      competitionType: "european" | "national",
      date: Date,
      sport: "football" | "basketball",
      packageType: "standard" | "premium",
    ): number | null {
      const restrictions = this.getRestrictions(competitionType);
      if (!restrictions) return null;

      const dateString = this.formatDateForStorage(date);

      return (
        restrictions.customPrices[dateString]?.[sport]?.[packageType] || null
      );
    },

    removeCustomPrice: function (
      competitionType: "european" | "national",
      date: Date,
      sport: "football" | "basketball",
      packageType: "standard" | "premium",
    ) {
      const restrictions = this.getRestrictions(competitionType);
      if (!restrictions) return false;

      const dateString = this.formatDateForStorage(date);

      if (restrictions.customPrices[dateString]?.[sport]) {
        delete restrictions.customPrices[dateString][sport]![packageType];

        // Clean up empty objects
        if (
          Object.keys(restrictions.customPrices[dateString][sport]!).length ===
          0
        ) {
          delete restrictions.customPrices[dateString][sport];
        }
        if (Object.keys(restrictions.customPrices[dateString]).length === 0) {
          delete restrictions.customPrices[dateString];
        }
      }

      return true;
    },

    getAllCustomPrices: function (competitionType: "european" | "national") {
      const restrictions = this.getRestrictions(competitionType);
      return restrictions ? restrictions.customPrices : {};
    },

    // Get effective price (custom price if exists, otherwise base price)
    getEffectivePrice: function (
      competitionType: "european" | "national",
      date: Date,
      sport: "football" | "basketball",
      packageType: "standard" | "premium",
      basePrice: number,
    ): number {
      const customPrice = this.getCustomPrice(
        competitionType,
        date,
        sport,
        packageType,
      );
      return customPrice !== null ? customPrice : basePrice;
    },
  },
};

// Initialize the data

// Export individual sections for backward compatibility

export const sports = AppData.sports.list;
export const packages = AppData.packages.list;
export const cities = AppData.cities.list;
export const leagues = AppData.leagues.list;
export const extras = AppData.extras.list;
export const paymentMethods = AppData.paymentMethods.list;
export const faqs = AppData.faqs.list;
export const travelPackages = AppData.travelPackages.list;
export const reviews = AppData.reviews.list;
export const pricingData = AppData.pricingData;

// Export new data structures
export const heroData = AppData.hero;
export const sportsPreferenceData = AppData.sportsPreference;
export const packageTypeData = AppData.packageType;
export const departureCityData = AppData.departureCity;
export const removeLeagueData = AppData.removeLeague;
export const flightScheduleData = AppData.flightSchedule;
export const extrasData = AppData.extrasData;
export const personalInfoData = AppData.personalInfo;
export const paymentData = AppData.payment;
export const leaguePricingData = AppData.leaguePricing;
export const homepageLeaguesData = AppData.homepageLeagues;
export const aboutPageData = AppData.aboutPage;

// Export the main object as default
export default AppData;
