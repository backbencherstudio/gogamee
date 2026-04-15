// Main application data object interfaces
export interface SportPreference {
  value: string;
  label: string;
  description: string;
}
export interface PackageType {
  value: string;
  label: string;
  description: string;
  features: string[];
  basePrice: number;
  currency: string;
}
export interface DepartureCity {
  value: string;
  label: string;
  gradient: string;
  accent: string;
  country: string;
  description: string;
}

export const AppData: any = {
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
  },

  // Sports Preference Data
  sportsPreference: {
    sports: [
      { value: "football", label: "Football", description: "Maximize time" },
      {
        value: "basketball",
        label: "Basketball",
        description: "Maximize time",
      },
      { value: "both", label: "Both", description: "Maximize time" },
    ],
    getAllSports: function (): SportPreference[] {
      return this.sports;
    },
  },

  // Package Type Data
  packageType: {
    packages: [
      {
        value: "standard",
        label: "Standard",
        description: "Perfect for budget-conscious",
        features: ["3-star hotels", "Basic meals", "Standard match tickets"],
        basePrice: 299,
        currency: "EUR",
      },
      {
        value: "premium",
        label: "Premium",
        description: "Luxury experience",
        features: ["4-5 star hotels", "Gourmet meals", "Premium match tickets"],
        basePrice: 1399,
        currency: "EUR",
      },
    ],
    getAllPackages: function (): PackageType[] {
      return this.packages;
    },
    getPackageByValue: function (v: string): PackageType | undefined {
      return this.packages.find((p: any) => p.value === v);
    },
  },

  // Departure City Data
  departureCity: {
    cities: [
      {
        value: "madrid",
        label: "Madrid",
        gradient: "from-slate-700",
        accent: "hover:from-slate-600",
        country: "Spain",
        description: "Capital city",
      },
      {
        value: "barcelona",
        label: "Barcelona",
        gradient: "from-emerald-600",
        accent: "hover:from-emerald-500",
        country: "Spain",
        description: "Coastal city",
      },
      {
        value: "malaga",
        label: "Málaga",
        gradient: "from-amber-600",
        accent: "hover:from-amber-500",
        country: "Spain",
        description: "Sunny coastal city",
      },
      {
        value: "valencia",
        label: "Valencia",
        gradient: "from-blue-600",
        accent: "hover:from-blue-500",
        country: "Spain",
        description: "Modern city",
      },
    ],
    getAllCities: function (): DepartureCity[] {
      return this.cities;
    },
  },

  // Flight Schedule Data
  flightSchedule: {
    timeSlots: {
      departure: [
        { value: 360, label: "06:00" },
        { value: 660, label: "11:00" },
        { value: 840, label: "14:00" },
        { value: 1080, label: "18:00" },
        { value: 1440, label: "00:00(+1)" },
      ],
      arrival: [
        { value: 660, label: "11:00" },
        { value: 840, label: "14:00" },
        { value: 1140, label: "19:00" },
        { value: 1440, label: "00:00(+1)" },
      ],
    },
    defaultRanges: {
      departure: { start: 360, end: 840 },
      arrival: { start: 840, end: 1440 },
    },
    pricing: { pricePerStep: 20, currency: "EUR" },
    getTimeSlots: function (t: string): any[] {
      return (this.timeSlots as any)[t];
    },
    getDefaultRange: function (t: string): any {
      return (this.defaultRanges as any)[t];
    },
    getPricePerStep: function (): number {
      return this.pricing.pricePerStep;
    },
    getConstants: function (): any {
      return { hoursPerDay: 24, minutesInDay: 1440 };
    },
    getInitialFlightData: function (): any[] {
      return [
        {
          label: "Departure from",
          city: "Barcelona",
          price: "0€",
          icon: "takeoff",
          timeRange: { start: 360, end: 840 },
        },
        {
          label: "Arrival",
          city: "Barcelona",
          price: "0€",
          icon: "landing",
          timeRange: { start: 840, end: 1440 },
        },
      ];
    },
    calculatePriceFromDefault: function (
      r: { start: number; end: number },
      isDep: boolean,
    ): number {
      const type = isDep ? "departure" : "arrival";
      const slots = (this.timeSlots as any)[type].map((s: any) => s.value);
      const def = (this.defaultRanges as any)[type];

      const sIdx = slots.indexOf(r.start);
      const eIdx = slots.indexOf(r.end);
      const dsIdx = slots.indexOf(def.start);
      const deIdx = slots.indexOf(def.end);

      if (sIdx < 0 || eIdx < 0) return 0;
      const steps = Math.abs(sIdx - dsIdx) + Math.abs(eIdx - deIdx);
      return steps * this.pricing.pricePerStep;
    },
    getAvailableTimeSlots: function (t: string): any[] {
      return (this.timeSlots as any)[t];
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
      },
      {
        id: "conference-league",
        name: "Conference League",
        image:
          "/homepage/football/CONFERENCE_LEAGUE_(football_european_comp).png",
        country: "Europe",
      },
      {
        id: "europa-league",
        name: "Europa League",
        image: "/homepage/football/EUROPA_LEAGUE_(football_european_comp).png",
        country: "Europe",
      },
      {
        id: "la-liga",
        name: "La Liga",
        image: "/homepage/football/LALIGA_(football_spain).png",
        country: "Spain",
      },
      {
        id: "bundesliga",
        name: "Bundesliga",
        image: "/homepage/football/BUNDESLIGA_(football_germany).png",
        country: "Germany",
      },
      {
        id: "serie-a",
        name: "Serie A",
        image: "/homepage/football/SERIE_A_(football_italy).png",
        country: "Italy",
      },
      {
        id: "ligue-1",
        name: "Ligue 1",
        image: "/homepage/football/LIGUE_1_(football_france).png",
        country: "France",
      },
      {
        id: "eredivisie",
        name: "Eredivisie",
        image: "/homepage/football/EREDIVISIE_(football_netherlands).png",
        country: "Netherlands",
      },
      {
        id: "european-competition",
        name: "Champions League",
        image:
          "/homepage/football/CHAMPIONS_LEAGUE_(football_european_comp).png",
        country: "Europe",
      },
    ],
    basketball: [
      {
        id: "lnb pro a",
        name: "Lnb Pro A",
        image: "/homepage/basketball/Betclic_Élite.png",
        country: "France",
      },
      {
        id: "basketball-champions-league",
        name: "Basketball Champions League",
        image: "/homepage/basketball/Basketball_Champions_League_logo.png",
        country: "Europe",
      },
      {
        id: "basketbol-super-ligi",
        name: "Basketbol Süper Ligi",
        image:
          "/homepage/basketball/Official_logo_of_the_Turkish_Basketball_Super_League.png",
        country: "Turkey",
      },
      {
        id: "la liga acb",
        name: "La Liga ACB",
        image: "/homepage/basketball/ACB_logo.png",
        country: "Spain",
      },
      {
        id: "lega-basket-serie-a",
        name: "Lega Basket Serie A",
        image: "/homepage/basketball/LegaBasket_Serie_A_Logo.png",
        country: "Italy",
      },
      {
        id: "basketball-bundesliga",
        name: "Basketball Bundesliga",
        image: "/homepage/basketball/BBL.PNG",
        country: "Germany",
      },
      {
        id: "lietuvos-krepsinio-lyga",
        name: "Lietuvos krepšinio lyga",
        image: "/homepage/basketball/LKL.PNG",
        country: "Lithuania",
      },
      {
        id: "european-competition",
        name: "EuroLiga",
        image: "/homepage/basketball/EUROLEAGUE.png",
        country: "Europe",
      },
    ],
    getFootballLeagues: function () {
      return this.football;
    },
    getBasketballLeagues: function () {
      return this.basketball;
    },
    getLeaguesBySport: function (s: string): any[] {
      return s === "football" ? this.football : this.basketball;
    },
  },

  // Extras Data
  extrasData: {
    text: {
      title: "Mejora tu experiencia\n\n¡Añade extras a tu viaje!",
      perPerson: "Por persona",
      included: "Incluído",
      add: "Añadir",
      remove: "Eliminar",
      confirm: "Confirmar",
      totalCost: "Coste Extra de Comodidad",
    },
    initialExtras: [
      {
        id: "breakfast",
        name: "Desayuno",
        price: 10,
        icon: "/stepper/icon/icon1.svg",
        isSelected: false,
        quantity: 0,
        currency: "EUR",
        isIncluded: false,
        isGroupOption: true,
      },
      {
        id: "travel-insurance",
        name: "Seguro de Viaje",
        price: 20,
        icon: "/stepper/icon/icon2.svg",
        isSelected: false,
        quantity: 0,
        currency: "EUR",
        isIncluded: false,
        isGroupOption: true,
      },
      {
        id: "underseat-bag",
        name: "Bolsa pequeña (debajo del asiento)",
        price: 0,
        icon: "/stepper/icon/icon3.svg",
        isSelected: true,
        quantity: 3,
        currency: "EUR",
        isIncluded: true,
        isGroupOption: false,
      },
      {
        id: "extra-luggage",
        name: "Maleta extra",
        price: 40,
        icon: "/stepper/icon/icon4.svg",
        isSelected: false,
        quantity: 0,
        currency: "EUR",
        isIncluded: false,
        isGroupOption: false,
      },
      {
        id: "seats-together",
        name: "¡Sentaros juntos!",
        price: 20,
        icon: "/stepper/icon/icon5.svg",
        isSelected: false,
        quantity: 0,
        currency: "EUR",
        isIncluded: false,
        maxQuantity: 10,
        isGroupOption: true,
      },
    ],
    constants: { defaultMaxQuantity: 10, minQuantity: 1, currencySymbol: "€" },
  },

  // Personal Info Data
  personalInfo: {
    text: {
      title: "Información",
      confirm: "Confirmar",
      primaryTravelerTitle: "Viajero Principal",
      extraTravelerTitle: "Viajero Extra",
      reservationTitle: "Resumen de Reserva",
      paymentMethodTitle: "Método de Pago",
      clearForm: "Limpiar Formulario",
      flightHotel: "Vuelo + Hotel",
      totalCost: "Coste Total",
      departure: "Salida",
      arrival: "Llegada",
      backTo: "Regreso a",
      flightScheduleAdjustments: "Ajustes de Horario de Vuelo",
      europeanCompetition: "EuroLiga",
      leagueRemovals: "Eliminación de Ligas",
      singleTravelerSupplement: "Suplemento Viajero Individual",
      concept: "Concepto",
      price: "Precio",
      quantity: "Cantidad",
      total: "Total",
      packageFallback: "Paquete",
      subtotal: "Subtotal",
      letsGo: "¡Vamos allá!",
      packageTotal: "Total Paquete",
      extrasTotal: "Total Extras",
      flightScheduleTotal: "Total Horarios",
      confirmationTitle: "Confirmación de Datos",
      confirmationLabel1:
        "Confirmo que todos los datos introducidos son correctos y coinciden con la documentación oficial.",
      confirmationLabel2:
        "He leído y acepto los términos y condiciones y la política de privacidad.",
      extraAdultLabel: "Adulto",
      childLabel: "Niño",
      adultsTitle: "Adultos",
      childrenTitle: "Niños",
    },
    formFields: {
      travelerName: {
        label: "Nombre y Apellidos",
        placeholder: "Ej. Juan Pérez",
      },
      email: { label: "Correo Electrónico", placeholder: "ejemplo@correo.com" },
      phone: { label: "Teléfono", placeholder: "+34 600 000 000" },
      dateOfBirth: { label: "Fecha de Nacimiento" },
      documentType: {
        label: "Tipo de Documento",
        id: "DNI/NIE",
        passport: "Pasaporte",
      },
      documentNumber: {
        label: "Número de Documento",
        placeholder: "X1234567Z",
      },
      previousTravelInfo: {
        label: "Observaciones",
        placeholder:
          "¿Has vivido ya una experiencia GoGame? Dinos a qué ciudad y evento viajaste. También puedes añadir cualquier comentario relevante que debamos tener en cuenta.",
      },
    },
    paymentMethods: [
      {
        value: "credit",
        label: "Tarjeta de crédito/débito",
        icon: "/stepper/icon/visa.png",
      },
      { value: "google", label: "Google Pay", icon: "/stepper/icon/gpay.png" },
      { value: "apple", label: "Apple Pay", icon: "/stepper/icon/apay.png" },
    ],
    reservationSummary: {
      title: "Resumen",
      departure: { city: "Madrid", date: "2024-05-15", label: "Salida" },
      return: { city: "Madrid", date: "2024-05-17", label: "Regreso" },
      pricing: {
        concept: "Concepto",
        price: "Precio",
        quantity: "Cantidad",
        total: "Total",
        barcelona: "Barcelona",
        priceValue: "0€",
        quantityValue: "1",
        totalValue: "0€",
        returnPrice: "0€",
        returnTotal: "0€",
      },
      totalCost: "0€",
    },
    storage: { key: "personalinfo_form_data" },
  },

  // Payment Data
  payment: {
    text: {
      title: "Información de pago",
      paymentMethodTitle: "Método de Pago",
      confirmButton: "Confirmar Reserva",
      processingButton: "Procesando...",
      nameOnCardLabel: "Nombre en la tarjeta",
      nameOnCardPlaceholder: "Nombre completo",
      cardNumberLabel: "Número de tarjeta",
      expiryLabel: "Caducidad",
      cvvLabel: "CVC",
    },
    storage: { key: "payment_form_data" },
    paymentMethods: [
      {
        value: "credit",
        label: "Tarjeta de crédito/débito",
        icon: "/stepper/icon/visa.png",
      },
      { value: "google", label: "Google Pay", icon: "/stepper/icon/gpay.png" },
      { value: "apple", label: "Apple Pay", icon: "/stepper/icon/apay.png" },
    ],
  },

  // Remove League Data
  removeLeague: {
    leagues: [
      {
        id: "1",
        name: "La Liga",
        country: "Spain",
        image: "/stepper/img1.png",
      },
      {
        id: "2",
        name: "Premier League",
        country: "England",
        image: "/stepper/img2.png",
      },
      {
        id: "3",
        name: "Bundesliga",
        country: "Germany",
        image: "/stepper/img3.png",
      },
      {
        id: "4",
        name: "Serie A",
        country: "Italy",
        image: "/stepper/img4.png",
      },
      {
        id: "5",
        name: "Eredivisie",
        country: "Netherlands",
        image: "/homepage/image/Eredivisie00.jpg",
      },
      {
        id: "6",
        name: "Ligue 1",
        country: "France",
        image: "/stepper/img6.png",
      },
    ],
    getLeagueById: function (id: string) {
      return this.leagues.find((l: any) => l.id === id);
    },
    getAllLeagues: function () {
      return this.leagues;
    },
    getLeagueByName: function (name: string) {
      return this.leagues.find((l: any) => l.name === name);
    },
    getLeaguesByCountry: function (country: string) {
      return this.leagues.filter((l: any) => l.country === country);
    },
    getRemovalCost: function () {
      return 20;
    },
    getFreeRemovals: function () {
      return 1;
    },
    calculateTotalCost: function (removedCount: number) {
      const free = this.getFreeRemovals();
      const costPerLeague = this.getRemovalCost();
      return Math.max(0, removedCount - free) * costPerLeague;
    },
  },

  // Restore dateRestrictions for Admin Dashboard
  dateRestrictions: {
    european: { enabledDates: [], blockedDates: [], customPrices: {} },
    national: { enabledDates: [], blockedDates: [], customPrices: {} },
    getAllRestrictions: function (): any {
      return this;
    },
  },
};

// Export individual sections
export const heroData: any = AppData.hero;
export const sportsPreferenceData: any = AppData.sportsPreference;
export const packageTypeData: any = AppData.packageType;
export const departureCityData: any = AppData.departureCity;
export const flightScheduleData: any = AppData.flightSchedule;
export const extrasData: any = AppData.extrasData;
export const homepageLeaguesData: any = AppData.homepageLeagues;
export const personalInfoData: any = AppData.personalInfo;
export const paymentData: any = AppData.payment;
export const removeLeagueData: any = AppData.removeLeague;

// Compatibility objects
export const pricingData: any = {
  football: {},
  basketball: {},
  getPackageName: function (sport: string, pkg: string) {
    if (pkg === "standard") return "Estándar";
    if (pkg === "premium") return "Premium";
    return pkg;
  },
};
export const leaguePricingData: any = {
  european: { additionalCost: 50 },
  national: { additionalCost: 0 },
};

export default AppData;
