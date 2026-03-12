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

  // Leagues Data
  homepageLeagues: {
    football: [
      {
        id: "premier-league",
        name: "Premier League",
        image: "/homepage/football/PREMIER_LEAGUE_(football_uk).png",
        country: "England",
        description: "English top-flight football league",
      },
      {
        id: "conference-league",
        name: "Conference League",
        image:
          "/homepage/football/CONFERENCE_LEAGUE_(football_european_comp).png",
        country: "Europe",
        description: "Conference League",
      },
      {
        id: "europa-league",
        name: "Europa League",
        image: "/homepage/football/EUROPA_LEAGUE_(football_european_comp).png",
        country: "Europe",
        description: "Europa League",
      },
      {
        id: "la-liga",
        name: "La Liga",
        image: "/homepage/football/LALIGA_(football_spain).png",
        country: "Spain",
        description: "Spanish top-flight football league",
      },
      {
        id: "bundesliga",
        name: "Bundesliga",
        image: "/homepage/football/BUNDESLIGA_(football_germany).png",
        country: "Germany",
        description: "German top-flight football league",
      },
      {
        id: "serie-a",
        name: "Serie A",
        image: "/homepage/football/SERIE_A_(football_italy).png",
        country: "Italy",
        description: "Italian top-flight football league",
      },
      {
        id: "ligue-1",
        name: "Ligue 1",
        image: "/homepage/football/LIGUE_1_(football_france).png",
        country: "France",
        description: "French top-flight football league",
      },
      {
        id: "eredivisie",
        name: "Eredivisie",
        image: "/homepage/football/EREDIVISIE_(football_netherlands).png",
        country: "Netherlands",
        description: "Dutch top-flight football league",
      },
      {
        id: "european-competition",
        name: "Competición Europea",
        image: "/homepage/football/CHAMPIONS_LEAGUE_(football_european_comp).png",
        country: "Europe",
        description:
          "European club competitions including Champions League and Europa League",
      },
    ],

    basketball: [
      {
        id: "lnb pro a",
        name: "Lnb Pro A",
        image: "/homepage/basketball/Betclic_Élite.png",
        country: "France",
        description: "French top-flight basketball league",
      },
      {
        id: "basketball-champions-league",
        name: "Basketball Champions League",
        image: "/homepage/basketball/Basketball_Champions_League_logo.png",
        country: "Europe",
        description: "Basketball Champions League",
      },
      {
        id: "basketbol-super-ligi",
        name: "Basketbol Süper Ligi",
        image:
          "/homepage/basketball/Official_logo_of_the_Turkish_Basketball_Super_League.png",
        country: "Turkey",
        description: "Turkish top-flight basketball league",
      },
      {
        id: "la liga acb",
        name: "La Liga ACB",
        image: "/homepage/basketball/ACB_logo.png",
        country: "Spain",
        description: "Spanish top-flight basketball league",
      },
      {
        id: "lega-basket-serie-a",
        name: "Lega Basket Serie A",
        image: "/homepage/basketball/LegaBasket_Serie_A_Logo.png",
        country: "Italy",
        description: "Italian top-flight basketball league",
      },
      {
        id: "basketball-bundesliga",
        name: "Basketball Bundesliga",
        image: "/homepage/basketball/BBL.PNG",
        country: "Germany",
        description: "German top-flight basketball league",
      },
      {
        id: "lietuvos-krepsinio-lyga",
        name: "Lietuvos krepšinio lyga",
        image: "/homepage/basketball/LKL.PNG",
        country: "Lithuania",
        description: "Lithuanian top-flight basketball league",
      },
      {
        id: "european-competition",
        name: "Competición Europea",
        image: "/homepage/basketball/EUROLEAGUE.png",
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
      packageFallback: "Pack",
      packageFallbackEn: "Package",
      confirmationTitle: "Confirmación de Datos",
      confirmationTitleEn: "Data Confirmation",
      confirmationLabel1:
        "Confirmo que los datos introducidos son correctos y coinciden con los documentos de identidad de los viajeros.",
      confirmationLabel1En:
        "I confirm that the data entered is correct and matches the identity documents of the travelers.",
      confirmationLabel2:
        "He leído y acepto los Términos y Condiciones y la Política de Cancelación.",
      confirmationLabel2En:
        "I have read and accept the Terms and Conditions and the Cancellation Policy.",
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
        label: "Observaciones",
        labelEn: "Observations",
        placeholder:
          "¿Has vivido ya una experiencia GoGame con nosotros? Dinos a qué ciudad y evento viajaste. También puedes añadir aquí cualquier comentario o información relevante que debamos tener en cuenta.",
        placeholderEn:
          "Have you already had a GoGame experience with us? Tell us which city and event you traveled to. You can also add any relevant comments or information we should take into account here.",
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

// Export the main object as default
export default AppData;
