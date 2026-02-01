import { toErrorMessage } from "../lib/errors";

/**
 * Pricing Configuration
 * All pricing rules and constants in one place
 */
export const PricingConfig = {
  // Base package prices by sport, package type, and nights
  basePrices: {
    football: {
      standard: {
        1: 299,
        2: 379,
        3: 459,
        4: 529,
      },
      premium: {
        1: 1299,
        2: 1499,
        3: 1699,
        4: 1899,
      },
    },
    basketball: {
      standard: {
        1: 279,
        2: 359,
        3: 439,
        4: 509,
      },
      premium: {
        1: 1279,
        2: 1479,
        3: 1679,
        4: 1859,
      },
    },
  },

  // League surcharges
  leagueSurcharge: {
    european: 50,
    national: 0,
  },

  // League removal pricing
  leagueRemoval: {
    freeRemovals: 1,
    costPerRemoval: 20, // Per person
  },

  // Flight preference pricing
  flightPreference: {
    costPerStep: 20,
  },

  // Extras pricing (fallback if not in booking data)
  defaultExtras: {
    breakfast: 10,
    "travel-insurance": 20,
    "underseat-bag": 0,
    "extra-luggage": 40,
    "seats-together": 20,
  },
} as const;

/**
 * Booking Extra Interface
 */
export interface BookingExtra {
  id: string;
  name: string;
  description: string;
  price: number;
  isSelected: boolean;
  quantity: number;
  maxQuantity?: number;
  isIncluded?: boolean;
  currency: string;
}

/**
 * Price Calculation Input
 */
export interface PriceCalculationInput {
  selectedSport: "football" | "basketball";
  selectedPackage: "standard" | "premium";
  selectedLeague: "european" | "national" | string;
  totalPeople: number;
  adults: number;
  kids: number;
  babies: number;
  departureDate: string;
  returnDate: string;
  removedLeaguesCount: number;
  hasRemovedLeagues: boolean;
  bookingExtras?: BookingExtra[];
  departureTimeStart?: number;
  departureTimeEnd?: number;
  arrivalTimeStart?: number;
  arrivalTimeEnd?: number;
}

/**
 * Price Breakdown Result
 */
export interface PriceBreakdown {
  packageCost: number;
  extrasCost: number;
  leagueRemovalCost: number;
  leagueSurcharge: number;
  flightPreferenceCost: number;
  totalCost: number;
  currency: string;
  breakdown: {
    description: string;
    amount: number;
  }[];
}

/**
 * Centralized Pricing Service
 * All price calculations happen here - NEVER trust client prices!
 */
export class PricingService {
  /**
   * Calculate total price with full breakdown
   */
  static async calculatePrice(
    input: PriceCalculationInput,
  ): Promise<PriceBreakdown> {
    try {
      // 1. Calculate nights
      const nights = this.calculateNights(
        input.departureDate,
        input.returnDate,
      );

      // 2. Base package cost (from database)
      const packageCost = await this.calculatePackageCost(
        input.selectedSport,
        input.selectedPackage,
        nights,
      );

      // 3. League surcharge
      const leagueSurcharge = this.calculateLeagueSurcharge(
        input.selectedLeague,
      );

      // 4. Extras cost
      const extrasCost = this.calculateExtrasCost(input.bookingExtras || []);

      // 5. League removal cost
      const leagueRemovalCost = this.calculateLeagueRemovalCost(
        input.removedLeaguesCount,
        input.hasRemovedLeagues,
        input.totalPeople,
      );

      // 6. Flight preference cost (if applicable)
      const flightPreferenceCost = this.calculateFlightPreferenceCost(
        input.departureTimeStart,
        input.departureTimeEnd,
        input.arrivalTimeStart,
        input.arrivalTimeEnd,
      );

      // 7. Total
      const totalCost =
        packageCost +
        leagueSurcharge +
        extrasCost +
        leagueRemovalCost +
        flightPreferenceCost;

      // Build itemized breakdown
      const breakdown = [
        {
          description: `${input.selectedSport} - ${input.selectedPackage} (${nights} ${nights === 1 ? "night" : "nights"})`,
          amount: packageCost,
        },
      ];

      if (leagueSurcharge > 0) {
        breakdown.push({
          description: "European League Surcharge",
          amount: leagueSurcharge,
        });
      }

      if (extrasCost > 0) {
        breakdown.push({
          description: "Extras",
          amount: extrasCost,
        });
      }

      if (leagueRemovalCost > 0) {
        breakdown.push({
          description: `League Removals (${input.removedLeaguesCount})`,
          amount: leagueRemovalCost,
        });
      }

      if (flightPreferenceCost > 0) {
        breakdown.push({
          description: "Flight Preferences",
          amount: flightPreferenceCost,
        });
      }

      return {
        packageCost,
        extrasCost,
        leagueRemovalCost,
        leagueSurcharge,
        flightPreferenceCost,
        totalCost,
        currency: "EUR",
        breakdown,
      };
    } catch (error) {
      console.error("❌ Pricing calculation error:", error);
      throw new Error(toErrorMessage(error, "Failed to calculate price"));
    }
  }

  /**
   * Calculate number of nights
   */
  private static calculateNights(
    departureDate: string,
    returnDate: string,
  ): number {
    const departure = new Date(departureDate);
    const returnD = new Date(returnDate);
    const diffTime = Math.abs(returnD.getTime() - departure.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(4, diffDays)); // Clamp between 1-4
  }

  /**
   * Calculate base package cost from database
   */
  private static async calculatePackageCost(
    sport: "football" | "basketball",
    packageType: "standard" | "premium",
    nights: number,
  ): Promise<number> {
    try {
      // Query database for current prices
      const { StartingPrice } = await import("../../backend/models");

      const startingPrice = await StartingPrice.findOne({
        type: sport,
        isActive: true,
      }).lean();

      if (!startingPrice || !startingPrice.pricesByDuration) {
        console.warn(`No active pricing found for ${sport}, using fallback`);
        // Fallback to config
        const sportPrices = PricingConfig.basePrices[sport];
        if (!sportPrices) {
          throw new Error(`Invalid sport: ${sport}`);
        }

        const packagePrices = sportPrices[packageType];
        if (!packagePrices) {
          throw new Error(`Invalid package type: ${packageType}`);
        }

        const nightsKey = nights as 1 | 2 | 3 | 4;
        const price = packagePrices[nightsKey];
        if (!price) {
          throw new Error(`No price for ${nights} nights`);
        }

        return price;
      }

      // Get price from database
      const nightsKey = nights.toString() as "1" | "2" | "3" | "4";
      const durationPrices = startingPrice.pricesByDuration[nightsKey];

      if (!durationPrices) {
        throw new Error(`No pricing found for ${nights} nights`);
      }

      return durationPrices[packageType];
    } catch (error) {
      console.error("Error fetching database prices:", error);
      throw error;
    }
  }

  /**
   * Calculate league surcharge
   */
  private static calculateLeagueSurcharge(league: string): number {
    if (league === "european") {
      return PricingConfig.leagueSurcharge.european;
    }
    return PricingConfig.leagueSurcharge.national;
  }

  /**
   * Calculate extras cost from booking extras array
   */
  private static calculateExtrasCost(bookingExtras: BookingExtra[]): number {
    return bookingExtras
      .filter((extra) => extra.isSelected && extra.price > 0)
      .reduce((sum, extra) => sum + extra.price * extra.quantity, 0);
  }

  /**
   * Calculate league removal cost
   * Formula: (removedCount - freeRemovals) * costPerRemoval * totalPeople
   */
  private static calculateLeagueRemovalCost(
    removedCount: number,
    hasRemovedLeagues: boolean,
    totalPeople: number,
  ): number {
    if (!hasRemovedLeagues || removedCount === 0) {
      return 0;
    }

    const paidRemovals = Math.max(
      0,
      removedCount - PricingConfig.leagueRemoval.freeRemovals,
    );
    const costPerPerson =
      paidRemovals * PricingConfig.leagueRemoval.costPerRemoval;
    return costPerPerson * totalPeople;
  }

  /**
   * Calculate flight preference cost
   * Based on steps moved from default time ranges
   */
  private static calculateFlightPreferenceCost(
    departureTimeStart?: number,
    departureTimeEnd?: number,
    arrivalTimeStart?: number,
    arrivalTimeEnd?: number,
  ): number {
    // Default ranges
    const defaultDeparture = { start: 360, end: 840 }; // 06:00 to 14:00
    const defaultArrival = { start: 840, end: 1440 }; // 14:00 to 00:00(+1)

    // Available time slots
    const departureSlots = [360, 660, 840, 1080, 1440];
    const arrivalSlots = [660, 840, 1140, 1440];

    let totalSteps = 0;

    // Calculate departure steps
    if (departureTimeStart !== undefined && departureTimeEnd !== undefined) {
      const startStep = this.findClosestSlotIndex(
        departureSlots,
        departureTimeStart,
      );
      const endStep = this.findClosestSlotIndex(
        departureSlots,
        departureTimeEnd,
      );
      const defaultStartStep = this.findClosestSlotIndex(
        departureSlots,
        defaultDeparture.start,
      );
      const defaultEndStep = this.findClosestSlotIndex(
        departureSlots,
        defaultDeparture.end,
      );

      totalSteps +=
        Math.abs(startStep - defaultStartStep) +
        Math.abs(endStep - defaultEndStep);
    }

    // Calculate arrival steps
    if (arrivalTimeStart !== undefined && arrivalTimeEnd !== undefined) {
      const startStep = this.findClosestSlotIndex(
        arrivalSlots,
        arrivalTimeStart,
      );
      const endStep = this.findClosestSlotIndex(arrivalSlots, arrivalTimeEnd);
      const defaultStartStep = this.findClosestSlotIndex(
        arrivalSlots,
        defaultArrival.start,
      );
      const defaultEndStep = this.findClosestSlotIndex(
        arrivalSlots,
        defaultArrival.end,
      );

      totalSteps +=
        Math.abs(startStep - defaultStartStep) +
        Math.abs(endStep - defaultEndStep);
    }

    return totalSteps * PricingConfig.flightPreference.costPerStep;
  }

  /**
   * Find closest slot index
   */
  private static findClosestSlotIndex(slots: number[], value: number): number {
    let closestIndex = 0;
    let minDiff = Math.abs(slots[0] - value);

    for (let i = 1; i < slots.length; i++) {
      const diff = Math.abs(slots[i] - value);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  /**
   * Validate price against client-submitted price
   * Returns true if within acceptable tolerance
   */
  static validateClientPrice(
    serverPrice: number,
    clientPrice: number,
    tolerance: number = 5,
  ): {
    isValid: boolean;
    difference: number;
    serverPrice: number;
    clientPrice: number;
  } {
    const difference = Math.abs(serverPrice - clientPrice);
    const isValid = difference <= tolerance;

    if (!isValid) {
      console.warn("⚠️ Price mismatch detected:", {
        serverPrice,
        clientPrice,
        difference,
      });
    }

    return {
      isValid,
      difference,
      serverPrice,
      clientPrice,
    };
  }
}
