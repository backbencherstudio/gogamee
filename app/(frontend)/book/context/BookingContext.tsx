"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

export interface Traveler {
  id: string;
  type: "adult" | "kid" | "baby";
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth: string;
  documentType: "Passport" | "ID";
  documentNumber: string;
  isPrimary?: boolean;
}

export interface League {
  id: string;
  name: string;
  group: "National" | "European";
  country?: string;
  isSelected: boolean;
}

export interface ExtraService {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  icon: string;
  isSelected: boolean;
  quantity: number;
  maxQuantity?: number;
  isIncluded?: boolean;
  isGroupOption?: boolean;
  currency?: string;
}

export const BOOKING_CONSTANTS = {
  SINGLE_TRAVELER_SUPPLEMENT: 50,
  EUROPEAN_LEAGUE_UPGRADE: 50,
  LEAGUE_REMOVAL_COST: 20,
  BOOKING_FEE: 50,
  CURRENCY: "EUR",
  CURRENCY_SYMBOL: "€",
} as const;

interface HeroData {
  selectedSport: string;
  selectedPackage: string;
  selectedCity: string;
  peopleCount: {
    adults: number;
    kids: number;
    babies: number;
  };
  fromHero: boolean;
  startFromStep: number;
}

export interface BookingContextType {
  currentStep: number;
  formData: {
    selectedSport: string;
    selectedPackage: string;
    selectedCity: string;

    travelers: {
      adults: Traveler[];
      kids: Traveler[];
      babies: Traveler[];
    };

    leagues: League[];

    departureDate: string;
    returnDate: string;
    duration: {
      days: number;
      nights: number;
    };
    selectedDatePrice?: {
      standard: number;
      premium: number;
      combined?: number;
    };

    flightSchedule: {
      departure: { start: number; end: number; rangeLabel: string };
      arrival: { start: number; end: number; rangeLabel: string };
    } | null;
    extras: ExtraService[];

    paymentInfo: {
      cardNumber: string;
      expiryDate: string;
      cvv: string;
      cardholderName: string;
    };
    calculatedTotals?: {
      basePrice: number;
      extrasCost: number;
      flightScheduleCost: number;
      leagueCost: number;
      totalCost: number;
      totalPeople: number;
      duration: number;
      nights: number;
    };
    fromHero?: boolean;
  };
  updateFormData: (stepData: Partial<BookingContextType["formData"]>) => void;
  updateExtras: (extras: ExtraService[]) => void;
  calculateTotalCost: () => number;
  getSelectedExtras: () => ExtraService[];
  getTotalPeople: () => number;
  clearBookingData: () => void;
  nextStep: (immediateData?: Partial<BookingContextType["formData"]>) => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  isHydrated: boolean;

  apiCache: ApiDataCache;
}

export interface ApiDataCache {
  dates: any[];
  packagePrices: {
    football: any | null;
    basketball: any | null;
    combined: any | null;
  };
  extras: any[];
  isLoading: {
    dates: boolean;
    packages: boolean;
    extras: boolean;
  };
}

export const BookingContext = createContext<BookingContextType | undefined>(
  undefined,
);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const getDefaultFormData = (): BookingContextType["formData"] => ({
    selectedSport: "football",
    selectedPackage: "standard",
    selectedCity: "",
    travelers: {
      adults: [],
      kids: [],
      babies: [],
    },
    leagues: [],
    departureDate: "",
    returnDate: "",
    duration: { days: 0, nights: 0 },
    flightSchedule: null,
    extras: [],
    paymentInfo: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
    },
    calculatedTotals: undefined,
    fromHero: false,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] =
    useState<BookingContextType["formData"]>(getDefaultFormData);
  const [isHydrated, setIsHydrated] = useState(false);
  const heroDataProcessedRef = useRef(false);

  const [apiCache, setApiCache] = useState<ApiDataCache>({
    dates: [],
    packagePrices: {
      football: null,
      basketball: null,
      combined: null,
    },
    extras: [],
    isLoading: {
      dates: false,
      packages: false,
      extras: false,
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const heroData = localStorage.getItem("gogame_hero_data");
      if (heroData && !heroDataProcessedRef.current) {
        heroDataProcessedRef.current = true;
        try {
          const parsedHeroData = JSON.parse(heroData);
          const mapHeroDataToStepper = (heroData: HeroData) => {
            const mappedSport = heroData.selectedSport;
            let mappedCity = heroData.selectedCity;
            if (mappedCity === "málaga") {
              mappedCity = "malaga";
            }

            // Correctly initialize traveler arrays based on peopleCount from Hero
            const initializeTravelers = (
              count: number,
              type: "adult" | "kid" | "baby",
            ) => {
              return Array.from({ length: count }, (_, i) => ({
                id: `${type}-${i + 1}-${Date.now()}`,
                type: type,
                name: "",
                dateOfBirth: "",
                documentType: "ID" as const,
                documentNumber: "",
                isPrimary: type === "adult" && i === 0,
              }));
            };

            return {
              selectedSport: mappedSport,
              selectedPackage: heroData.selectedPackage,
              selectedCity: mappedCity,
              travelers: {
                adults: initializeTravelers(
                  heroData.peopleCount?.adults || 1,
                  "adult",
                ),
                kids: initializeTravelers(
                  heroData.peopleCount?.kids || 0,
                  "kid",
                ),
                babies: initializeTravelers(
                  heroData.peopleCount?.babies || 0,
                  "baby",
                ),
              },
            };
          };

          const mappedHeroData = mapHeroDataToStepper(parsedHeroData);

          const heroFormData = {
            ...getDefaultFormData(),
            ...mappedHeroData,
            fromHero: true,
          };

          setFormData(heroFormData);
          setCurrentStep(parsedHeroData.startFromStep);
          localStorage.removeItem("gogame_hero_data");
          localStorage.removeItem("gogame_booking_step");

          setIsHydrated(true);

          setTimeout(() => {
            setCurrentStep(parsedHeroData.startFromStep);
          }, 100);

          setTimeout(() => {
            if (currentStep !== parsedHeroData.startFromStep) {
              setCurrentStep(parsedHeroData.startFromStep);
            }
          }, 200);

          return;
        } catch (error) {
          console.error("Error parsing hero data:", error);
          localStorage.removeItem("gogame_hero_data");
          heroDataProcessedRef.current = false;
        }
      }

      if (!heroDataProcessedRef.current) {
        const savedData = localStorage.getItem("gogame_booking_data");
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            setFormData((prev) => ({
              ...prev,
              ...parsedData,
              // Deep merge travelers to ensure nested arrays exist
              travelers: {
                ...prev.travelers,
                ...(parsedData.travelers || {}),
              },
            }));
          } catch (error) {
            console.error("Error parsing localStorage data:", error);
          }
        }

        const savedStep = localStorage.getItem("gogame_booking_step");
        if (savedStep) {
          try {
            const step = parseFloat(savedStep);
            setCurrentStep(step);
          } catch (error) {
            console.error("Error parsing localStorage step:", error);
          }
        }

        setIsHydrated(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("gogame_booking_data", JSON.stringify(formData));
    }
  }, [formData, isHydrated]);

  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      const heroData = localStorage.getItem("gogame_hero_data");
      if (!heroData) {
        localStorage.setItem("gogame_booking_step", currentStep.toString());
      }
    }
  }, [currentStep, isHydrated]);

  const updateFormData = (
    stepData: Partial<BookingContextType["formData"]>,
  ) => {
    setFormData((prev) => {
      const newData = { ...prev, ...stepData };
      return newData;
    });
  };

  const updateExtras = (extras: ExtraService[]) => {
    setFormData((prev) => ({ ...prev, extras }));
  };

  const calculateTotalCost = () => {
    const selectedExtras = formData.extras.filter(
      (extra) => extra.isSelected && !extra.isIncluded,
    );
    return selectedExtras.reduce(
      (total, extra) => total + extra.price * extra.quantity,
      0,
    );
  };

  const getSelectedExtras = () => {
    return formData.extras.filter((extra) => extra.isSelected);
  };

  const getTotalPeople = () => {
    // Safely access travelers data with fallbacks
    const travelers = formData?.travelers || {};
    const adultsCount = travelers.adults?.length || 0;
    const kidsCount = travelers.kids?.length || 0;
    const babiesCount = travelers.babies?.length || 0;

    return adultsCount + kidsCount + babiesCount;
  };

  const clearBookingData = () => {
    setFormData({
      selectedSport: "football",
      selectedPackage: "standard",
      selectedCity: "",
      travelers: {
        adults: [],
        kids: [],
        babies: [],
      },
      leagues: [],
      departureDate: "",
      returnDate: "",
      duration: { days: 0, nights: 0 },
      flightSchedule: null,
      extras: [],
      paymentInfo: {
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
      },
      fromHero: false,
    });
    setCurrentStep(0); // Reset to step 1
    localStorage.removeItem("gogame_booking_data");
    localStorage.removeItem("gogame_booking_step");
  };

  const nextStep = (
    immediateData?: Partial<BookingContextType["formData"]>,
  ) => {
    const currentData = { ...formData, ...immediateData };

    if (currentStep === 4) {
      // ALWAYS go to step 4.5 (Remove League) regardless of league type
      setCurrentStep(4.5);
    } else if (currentStep === 4.5) {
      setCurrentStep(5);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, 9));
    }
  };

  const previousStep = () => {
    if (currentStep === 4.5) {
      setCurrentStep(4);
    } else if (currentStep === 5) {
      // ALWAYS go back to step 4.5 (Remove League)
      setCurrentStep(4.5);
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const value: BookingContextType = {
    currentStep,
    formData,
    updateFormData,
    updateExtras,
    calculateTotalCost,
    getSelectedExtras,
    getTotalPeople,
    clearBookingData,
    nextStep,
    previousStep,
    goToStep,
    isHydrated,
    apiCache,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within BookingProvider");
  }
  return context;
};
