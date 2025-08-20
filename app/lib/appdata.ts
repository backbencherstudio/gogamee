// Main data structure for the entire application
// This acts as a constructor function that can be easily replaced with API calls

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
    add: function(booking: Omit<BookingData, 'id'>) {
      const newId = Math.max(...this.all.map(b => b.id), 0) + 1;
      const newBooking = { ...booking, id: newId };
      this.all.unshift(newBooking); // Add to beginning for easy access
      this.updateStatusArrays();
      return newBooking;
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

  // Travel Package Details
  travelPackages: {
    list: [
      // Football packages
      { id: 'f1', sport: 'football', category: 'Match Ticket', standard: 'General or lateral section', premium: 'Premium or central tribune seat' },
      { id: 'f2', sport: 'football', category: 'Flights', standard: 'Round-trip from a major city', premium: 'Round-trip from a major city' },
      { id: 'f3', sport: 'football', category: 'Hotel', standard: '3-star hotel or apartment', premium: '4–5 star hotel near stadium or city center' },
      { id: 'f4', sport: 'football', category: 'Transfers', standard: 'Public transport or shuttle', premium: 'Private transfers (airport & stadium)' },
      { id: 'f5', sport: 'football', category: 'Welcome Pack', standard: 'Exclusive GoGame merchandise', premium: 'Official team jersey + premium goodies' },
      { id: 'f6', sport: 'football', category: 'Surprise Reveal', standard: 'Destination revealed 48h before. A secret clue before revealing the destination.', premium: 'Destination revealed 48h before. A secret clue before revealing the destination.' },
      { id: 'f7', sport: 'football', category: 'Starting Price', standard: 'From 299€', premium: 'From 1399€' },
      
      // Basketball packages
      { id: 'b1', sport: 'basketball', category: 'Match Ticket', standard: 'Standard seat (upper and lateral seats)', premium: 'VIP seat' },
      { id: 'b2', sport: 'basketball', category: 'Flights', standard: 'Round-trip from a major city', premium: 'Round-trip from a major city' },
      { id: 'b3', sport: 'basketball', category: 'Hotel', standard: '3-star hotel or apartment', premium: '4–5 star hotel in premium location' },
      { id: 'b4', sport: 'basketball', category: 'Transfers', standard: 'Public transport or shuttle', premium: 'Private transfers (airport & stadium)' },
      { id: 'b5', sport: 'basketball', category: 'Welcome Pack', standard: 'Travel guide + surprise gift', premium: 'Official team jersey + premium goodies' },
      { id: 'b6', sport: 'basketball', category: 'Surprise Reveal', standard: 'Destination revealed 48h before. A secret clue before revealing the destination.', premium: 'Destination revealed 48h before. A secret clue before revealing the destination.' },
      { id: 'b7', sport: 'basketball', category: 'Starting Price', standard: 'From 279€', premium: 'From 1279€' },
    ],
    
    getBySport: function(sport: 'football' | 'basketball') {
      return this.list.filter(pkg => pkg.sport === sport);
    },
    
    getAll: function() {
      return this.list;
    },
    
    add: function(packageData: { sport: 'football' | 'basketball'; category: string; standard: string; premium: string }) {
      const newId = `${packageData.sport}_${Date.now()}`;
      const newPackage = { ...packageData, id: newId };
      this.list.unshift(newPackage); // Add to beginning for easy access
      return newPackage;
    },
    
    update: function(id: string, updates: Partial<{ sport: 'football' | 'basketball'; category: string; standard: string; premium: string }>) {
      const index = this.list.findIndex(pkg => pkg.id === id);
      if (index !== -1) {
        this.list[index] = { ...this.list[index], ...updates };
        return this.list[index];
      }
      return null;
    },
    
    delete: function(id: string) {
      const index = this.list.findIndex(pkg => pkg.id === id);
      if (index !== -1) {
        this.list.splice(index, 1);
        return true;
      }
      return false;
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
    
    getById: function(id: number) {
      return this.list.find(faq => faq.id === id);
    },
    
    getAll: function() {
      return this.list;
    },
    
    add: function(faq: { question: string; answer: string }) {
      const newId = Math.max(...this.list.map(item => item.id)) + 1;
      const newFaq = { ...faq, id: newId };
      this.list.unshift(newFaq); // Add to beginning instead of end
      return newFaq;
    },
    
    update: function(id: number, updates: { question?: string; answer?: string }) {
      const index = this.list.findIndex(faq => faq.id === id);
      if (index !== -1) {
        this.list[index] = { ...this.list[index], ...updates };
        return this.list[index];
      }
      return null;
    },
    
    delete: function(id: number) {
      const index = this.list.findIndex(faq => faq.id === id);
      if (index !== -1) {
        this.list.splice(index, 1);
        return true;
      }
      return false;
    }
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
        review: "I've used several travel platforms for my sports trips, but GoGame completely blew me away. The concept of booking a surprise destination and match was amazing!"
      },
      {
        id: 2,
        name: "Darlene",
        role: "Wellness Coach",
        image: "/homepage/image/avatar2.png",
        rating: 5,
        review: "GoGame provided an unforgettable experience for me and my friends. We chose football as our sport, and they organized everything perfectly"
      },
      {
        id: 3,
        name: "Brooklyn",
        role: "Wellness Coach",
        image: "/homepage/image/avatar3.png",
        rating: 5,
        review: "If you're a sports fan and love surprises, GoGame is for you! I booked a surprise football trip and was amazed by how well everything was organized."
      },
      {
        id: 4,
        name: "Jenny Wilson",
        role: "Sports Enthusiast",
        image: "/homepage/image/avatar1.png",
        rating: 4,
        review: "The surprise element made the whole experience so exciting! The match we attended was incredible, though the hotel could have been better."
      },
      {
        id: 5,
        name: "Robert Fox",
        role: "Travel Blogger",
        image: "/homepage/image/avatar2.png",
        rating: 5,
        review: "As someone who reviews travel experiences for a living, I can say GoGame offers something truly unique. Their attention to detail is impressive!"
      },
      {
        id: 6,
        name: "Wade Warren",
        role: "Football Fan",
        image: "/homepage/image/avatar3.png",
        rating: 5,
        review: "Watched my favorite team play in a stadium I never thought I'd visit! The surprise reveal was perfect, and the matchday experience was unforgettable."
      }
    ],
    
    getById: function(id: number) {
      return this.list.find(review => review.id === id);
    },
    
    getAll: function() {
      return this.list;
    },
    
    add: function(review: { name: string; role: string; image: string; rating: number; review: string }) {
      const newId = Math.max(...this.list.map(item => item.id)) + 1;
      const newReview = { ...review, id: newId };
      this.list.unshift(newReview); // Add to beginning for easy access
      return newReview;
    },
    
    update: function(id: number, updates: Partial<{ name: string; role: string; image: string; rating: number; review: string }>) {
      const index = this.list.findIndex(review => review.id === id);
      if (index !== -1) {
        this.list[index] = { ...this.list[index], ...updates };
        return this.list[index];
      }
      return null;
    },
    
    delete: function(id: number) {
      const index = this.list.findIndex(review => review.id === id);
      if (index !== -1) {
        this.list.splice(index, 1);
        return true;
      }
      return false;
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

  // Pricing data based on sport, package, and nights
  pricing: {
    football: {
      standard: {
        name: "GoGame Kickoff",
        prices: {
          1: 299,
          2: 379,
          3: 459,
          4: 529
        }
      },
      premium: {
        name: "GoGame Legend",
        prices: {
          1: 1299,
          2: 1499,
          3: 1699,
          4: 1899
        }
      }
    },
    basketball: {
      standard: {
        name: "GoGame Slam",
        prices: {
          1: 279,
          2: 359,
          3: 439,
          4: 509
        }
      },
      premium: {
        name: "GoGame MVP",
        prices: {
          1: 1279,
          2: 1479,
          3: 1679,
          4: 1859
        }
      }
    },
    
    // Helper function to get price
    getPrice: function(sport: 'football' | 'basketball', packageType: 'standard' | 'premium', nights: number): number {
      const sportData = this[sport];
      if (!sportData) return 0;
      
      const packageData = sportData[packageType];
      if (!packageData) return 0;
      
      return packageData.prices[nights as keyof typeof packageData.prices] || 0;
    },
    
    // Helper function to get package name
    getPackageName: function(sport: 'football' | 'basketball', packageType: 'standard' | 'premium'): string {
      const sportData = this[sport];
      if (!sportData) return '';
      
      const packageData = sportData[packageType];
      if (!packageData) return '';
      
      return packageData.name;
    }
  },

  // Initialize with dummy data
  initialize: function() {
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
export const faqs = AppData.faqs.list;
export const travelPackages = AppData.travelPackages.list;
export const reviews = AppData.reviews.list;
export const pricing = AppData.pricing;

// Export the main object as default
export default AppData; 