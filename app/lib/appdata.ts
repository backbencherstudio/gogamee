// Main data structure for the entire application
// This acts as a constructor function that can be easily replaced with API calls

export interface BookingData {
  id: number;
  status: "pending" | "completed" | "cancelled";
  basePrice: number;
  totalPrice: number;
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
}

// Main application data object
export const AppData = {
  // Booking related data
  bookings: {
    all: [] as BookingData[],
    pending: [] as BookingData[],
    completed: [] as BookingData[],
    cancelled: [] as BookingData[],
    
    // Get bookings by status
    getByStatus: function(status: "pending" | "completed" | "cancelled") {
      return this.all.filter(booking => booking.status === status);
    },
    
    // Get booking by ID
    getById: function(id: number) {
      return this.all.find(booking => booking.id === id);
    },
    
    // Add new booking
    add: function(booking: BookingData) {
      this.all.push(booking);
      this.updateStatusArrays();
    },
    
    // Update existing booking
    update: function(id: number, updates: Partial<BookingData>) {
      const index = this.all.findIndex(booking => booking.id === id);
      if (index !== -1) {
        this.all[index] = { ...this.all[index], ...updates };
        this.updateStatusArrays();
      }
    },
    
    // Delete booking
    delete: function(id: number) {
      this.all = this.all.filter(booking => booking.id !== id);
      this.updateStatusArrays();
    },
    
    // Update status arrays
    updateStatusArrays: function() {
      this.pending = this.getByStatus("pending");
      this.completed = this.getByStatus("completed");
      this.cancelled = this.getByStatus("cancelled");
    }
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
      { id: "formula1", name: "Formula 1", icon: "🏎️" }
    ],
    
    getById: function(id: string) {
      return this.list.find(sport => sport.id === id);
    }
  },

  // Package types
  packages: {
    list: [
      { id: "basic", name: "Basic", price: 280, features: ["Standard accommodation", "Basic meals"] },
      { id: "standard", name: "Standard", price: 450, features: ["Comfortable accommodation", "Quality meals", "Transport"] },
      { id: "premium", name: "Premium", price: 680, features: ["Luxury accommodation", "Premium meals", "VIP transport", "Personal guide"] },
      { id: "luxury", name: "Luxury", price: 1200, features: ["5-star accommodation", "Gourmet meals", "Private transport", "Personal guide", "Exclusive access"] }
    ],
    
    getById: function(id: string) {
      return this.list.find(pkg => pkg.id === id);
    }
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
      { id: "malaga", name: "Malaga", country: "Spain" }
    ],
    
    getById: function(id: string) {
      return this.list.find(city => city.id === id);
    }
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
      { id: "senior", name: "Senior", level: 3 }
    ],
    
    getById: function(id: string) {
      return this.list.find(league => league.id === id);
    },
    
    getByLevel: function(level: number) {
      return this.list.filter(league => league.level === level);
    }
  },

  // Extras
  extras: {
    list: [
      {
        id: "breakfast",
        name: "Breakfast",
        description: "Start your day full of energy with breakfast for only 10 euros per person",
        price: 10,
        icon: "/stepper/icon/icon1.svg",
        currency: "EUR",
        maxQuantity: 10
      },
      {
        id: "travel-insurance",
        name: "Travel Insurance",
        description: "Cover yourself for delays or strikes as well as medical insurance in the country you are going to.",
        price: 20,
        icon: "/stepper/icon/icon2.svg",
        currency: "EUR",
        maxQuantity: 10
      },
      {
        id: "underseat-bag",
        name: "Underseat bag",
        description: "Check the measurements accepted by the airline you are flying with.",
        price: 0,
        icon: "/stepper/icon/icon3.svg",
        currency: "EUR",
        isIncluded: true
      },
      {
        id: "extra-luggage",
        name: "Extra luggage",
        description: "Extra luggage (8kg- 10kg)",
        price: 40,
        icon: "/stepper/icon/icon4.svg",
        currency: "EUR",
        maxQuantity: 5
      },
      {
        id: "seats-together",
        name: "Seats together",
        description: "Do you want to sit together on the flight? Otherwise the seats will be chosen randomly.",
        price: 20,
        icon: "/stepper/icon/icon5.svg",
        currency: "EUR",
        maxQuantity: 10
      }
    ],
    
    getById: function(id: string) {
      return this.list.find(extra => extra.id === id);
    },
    
    getIncluded: function() {
      return this.list.filter(extra => extra.isIncluded);
    }
  },

  // Payment methods
  paymentMethods: {
    list: [
      { id: "card", name: "Credit/Debit Card", icon: "💳" },
      { id: "google", name: "Google Pay", icon: "📱" },
      { id: "apple", name: "Apple Pay", icon: "🍎" },
      { id: "paypal", name: "PayPal", icon: "🔵" }
    ],
    
    getById: function(id: string) {
      return this.list.find(method => method.id === id);
    }
  },

  // Time ranges for flights
  timeRanges: {
    departure: [
      { id: "early", name: "Early Morning", start: 360, end: 720, label: "06:00 - 12:00" },
      { id: "morning", name: "Morning", start: 480, end: 900, label: "08:00 - 15:00" },
      { id: "midday", name: "Midday", start: 540, end: 840, label: "09:00 - 14:00" },
      { id: "afternoon", name: "Afternoon", start: 600, end: 900, label: "10:00 - 15:00" }
    ],
    
    arrival: [
      { id: "evening", name: "Evening", start: 1080, end: 1800, label: "18:00 - 06:00(+1)" },
      { id: "night", name: "Night", start: 1020, end: 1440, label: "17:00 - 00:00" },
      { id: "late", name: "Late Night", start: 1140, end: 1800, label: "19:00 - 06:00(+1)" }
    ]
  },

  // Initialize with dummy data
  initialize: function() {
    // Add dummy bookings
    this.bookings.all = [
      {
        id: 1,
        status: "completed",
        basePrice: 450,
        totalPrice: 570,
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
        allExtras: this.extras.list.map(extra => ({ ...extra, isSelected: false, quantity: 1 })),
        selectedExtras: [
          { ...this.extras.getById("underseat-bag")!, isSelected: true, quantity: 3 },
          { ...this.extras.getById("extra-luggage")!, isSelected: true, quantity: 3 }
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
        requiresEuropeanLeagueHandling: false
      },
      {
        id: 2,
        status: "pending",
        basePrice: 680,
        totalPrice: 770,
        selectedSport: "basketball",
        selectedPackage: "premium",
        selectedCity: "madrid",
        selectedLeague: "international",
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
        allExtras: this.extras.list.map(extra => ({ ...extra, isSelected: false, quantity: 1 })),
        selectedExtras: [
          { ...this.extras.getById("breakfast")!, isSelected: true, quantity: 3 },
          { ...this.extras.getById("travel-insurance")!, isSelected: true, quantity: 3 },
          { ...this.extras.getById("underseat-bag")!, isSelected: true, quantity: 3 },
          { ...this.extras.getById("seats-together")!, isSelected: true, quantity: 3 }
        ],
        selectedExtrasNames: ["Breakfast", "Travel Insurance", "Underseat bag", "Seats together"],
        totalExtrasCost: 90,
        extrasCount: 4,
        firstName: "John",
        lastName: "Doe",
        fullName: "John Doe",
        email: "john.doe@example.com",
        phone: "+34 612 345 678",
        paymentMethod: "card",
        cardNumber: "**** **** **** 1234",
        expiryDate: "12/26",
        cvv: "***",
        cardholderName: "John Doe",
        bookingTimestamp: "2025-08-02T10:15:30.000Z",
        bookingDate: "8/15/2025",
        bookingTime: "12:15:30 PM",
        isBookingComplete: true,
        travelDuration: 6,
        hasFlightPreferences: true,
        requiresEuropeanLeagueHandling: true
      }
    ];
    
    // Update status arrays
    this.bookings.updateStatusArrays();
  },

  // API integration methods (for future use)
  api: {
    // Fetch all data from backend
    fetchAll: async function() {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/app-data');
      // const data = await response.json();
      // return data;
      console.log("API integration not yet implemented");
      return null;
    },
    
    // Update specific section
    updateSection: async function(section: string, data: unknown) {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/${section}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      // return response.json();
      console.log(`API update for ${section} not yet implemented`);
      return null;
    }
  }
};

// Initialize the data
AppData.initialize();

// Export individual sections for backward compatibility
export const dummyBookings = AppData.bookings.all;
export const sports = AppData.sports.list;
export const packages = AppData.packages.list;
export const cities = AppData.cities.list;
export const leagues = AppData.leagues.list;
export const extras = AppData.extras.list;
export const paymentMethods = AppData.paymentMethods.list;

// Export the main object as default
export default AppData; 