import { connectToDatabase } from "..";
import { toErrorMessage } from "../lib/errors";
import { DateManagement, StartingPrice } from "../models";

export const PricingConfig = {
  leagueSurcharge: {
    european: 50,
    national: 0,
  },

  leagueRemoval: {
    freeRemovals: 1,
    costPerRemoval: 20, // Per person
  },

  flightPreference: {
    costPerStep: 20,
  },

  singleTravelerSupplement: 50,
  bookingFee: 50,

  extras: {
    breakfast: 10,
    "travel-insurance": 20,
    "underseat-bag": 0,
    "extra-luggage": 40,
    "seats-together": 20,
  } as Record<string, number>,
} as const;

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

export interface PriceCalculationInput {
  selectedSport: "football" | "basketball" | "both" | string;
  selectedPackage: "standard" | "premium" | string;
  selectedLeague: "european" | "national" | string;
  totalPeople: number;
  departureDate: string;
  travelDuration: number; // In days
  removedLeaguesCount: number;
  hasRemovedLeagues: boolean;
  bookingExtras?: BookingExtra[];
  departureTimeStart?: number;
  departureTimeEnd?: number;
  arrivalTimeStart?: number;
  arrivalTimeEnd?: number;
}

export interface PriceBreakdown {
  packageCost: number;
  extrasCost: number;
  leagueRemovalCost: number;
  leagueSurcharge: number;
  flightPreferenceCost: number;
  singleTravelerSupplement: number;
  bookingFee: number;
  totalBaseCost: number;
  totalCost: number;
  currency: string;
  basePricePerPerson: number;
  breakdown: {
    description: string;
    amount: number;
    quantity?: number;
    unitPrice?: number;
  }[];
}

export class PricingService {
  static async calculatePrice(
    input: PriceCalculationInput,
  ): Promise<PriceBreakdown> {
    try {
      const durationKey = this.calculateDurationKey(input.travelDuration);

      const basePricePerPerson = await this.calculateBasePrice(
        input.departureDate,
        durationKey,
        input.selectedSport,
        input.selectedPackage,
      );

      const totalBaseCost = basePricePerPerson * input.totalPeople;

      const leagueSurchargePerPerson = this.calculateLeagueSurcharge(
        input.selectedLeague,
      );
      const leagueSurchargeTotal = leagueSurchargePerPerson * input.totalPeople;

      const extrasCost = this.calculateExtrasCost(input.bookingExtras || []);

      const leagueRemovalCostTotal = this.calculateLeagueRemovalCost(
        input.removedLeaguesCount,
        input.hasRemovedLeagues,
        input.totalPeople,
        input.selectedLeague,
      );

      const flightPreferencePerPerson = this.calculateFlightPreferenceCost(
        input.departureTimeStart,
        input.departureTimeEnd,
        input.arrivalTimeStart,
        input.arrivalTimeEnd,
      );
      const flightPreferenceTotal =
        flightPreferencePerPerson * input.totalPeople;

      const singleTravelerSupplement =
        input.totalPeople === 1 ? PricingConfig.singleTravelerSupplement : 0;

      const bookingFee = PricingConfig.bookingFee;

      const totalCost =
        totalBaseCost +
        leagueSurchargeTotal +
        extrasCost +
        leagueRemovalCostTotal +
        flightPreferenceTotal +
        singleTravelerSupplement +
        bookingFee;

      const breakdown = [
        {
          description: `Base Package (${input.selectedSport} - ${input.selectedPackage})`,
          amount: totalBaseCost,
          quantity: input.totalPeople,
          unitPrice: basePricePerPerson,
        },
      ];

      if (leagueSurchargeTotal > 0) {
        breakdown.push({
          description: "League Surcharge (European Competition)",
          amount: leagueSurchargeTotal,
          quantity: input.totalPeople,
          unitPrice: leagueSurchargePerPerson,
        });
      }

      if (extrasCost > 0 && input.bookingExtras) {
        input.bookingExtras
          .filter((extra) => extra.isSelected && !extra.isIncluded)
          .forEach((extra) => {
            const price = PricingConfig.extras[extra.id] ?? extra.price;
            breakdown.push({
              description: `Extra: ${extra.name}`,
              amount: price * extra.quantity,
              quantity: extra.quantity,
              unitPrice: price,
            });
          });
      }

      if (leagueRemovalCostTotal > 0) {
        const removedCount = input.removedLeaguesCount;
        const paidRemovals = Math.max(
          0,
          removedCount - PricingConfig.leagueRemoval.freeRemovals,
        );
        const costPerPerson =
          paidRemovals * PricingConfig.leagueRemoval.costPerRemoval;

        breakdown.push({
          description: `League Removals (${paidRemovals} paid)`,
          amount: leagueRemovalCostTotal,
          quantity: input.totalPeople,
          unitPrice: costPerPerson,
        });
      }

      if (flightPreferenceTotal > 0) {
        breakdown.push({
          description: "Flight Time Preferences",
          amount: flightPreferenceTotal,
          quantity: input.totalPeople,
          unitPrice: flightPreferencePerPerson,
        });
      }

      if (singleTravelerSupplement > 0) {
        breakdown.push({
          description: "Single Traveler Supplement",
          amount: singleTravelerSupplement,
          quantity: 1,
          unitPrice: PricingConfig.singleTravelerSupplement,
        });
      }

      if (bookingFee > 0) {
        breakdown.push({
          description: "Booking Fee",
          amount: bookingFee,
          quantity: 1,
          unitPrice: bookingFee,
        });
      }

      return {
        packageCost: totalBaseCost,
        extrasCost,
        leagueRemovalCost: leagueRemovalCostTotal,
        leagueSurcharge: leagueSurchargeTotal,
        flightPreferenceCost: flightPreferenceTotal,
        singleTravelerSupplement,
        bookingFee,
        totalBaseCost,
        totalCost,
        currency: "EUR",
        basePricePerPerson,
        breakdown,
      };
    } catch (error) {
      console.error("❌ Pricing calculation error:", error);
      throw new Error(toErrorMessage(error, "Failed to calculate price"));
    }
  }

  private static calculateDurationKey(days: number): "1" | "2" | "3" | "4" {
    const nights = Math.max(0, days - 1);
    if (nights <= 1) return "1";
    if (nights === 2) return "2";
    if (nights === 3) return "3";
    return "4";
  }

  private static async calculateBasePrice(
    date: string,
    durationKey: "1" | "2" | "3" | "4",
    sport: string,
    pkg: string,
  ): Promise<number> {
    try {
      await connectToDatabase();

      const dateObj = new Date(date);
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();

      const startOfDay = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
      const endOfDay = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));

      const dateEntry = await DateManagement.findOne({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: "enabled",
        duration: durationKey,
      });

      if (dateEntry) {
        let basePrice = 0;
        const sportLower = sport?.toLowerCase();
        const pkgLower = pkg?.toLowerCase() as "standard" | "premium";

        if (sportLower === "both" || sportLower === "combined") {
          // Direct lookup for Combined Package (Standard/Premium)
          basePrice = dateEntry.prices?.combined?.[pkgLower] ?? 0;
        } else if (sportLower === "football") {
          basePrice = dateEntry.prices?.football?.[pkgLower] ?? 0;
        } else if (sportLower === "basketball") {
          basePrice = dateEntry.prices?.basketball?.[pkgLower] ?? 0;
        }

        return basePrice;
      }

      const sportLower = sport?.toLowerCase();
      const pkgLower = pkg?.toLowerCase() as "standard" | "premium";

      // Handle "both" sport type
      if (sportLower === "both") {
        const footballPrice = await StartingPrice.findOne({
          type: "football",
          isActive: true,
        }).lean();
        const basketballPrice = await StartingPrice.findOne({
          type: "basketball",
          isActive: true,
        }).lean();

        let total = 0;
        if (footballPrice?.pricesByDuration?.[durationKey]) {
          total += footballPrice.pricesByDuration[durationKey][pkgLower] || 0;
        }
        if (basketballPrice?.pricesByDuration?.[durationKey]) {
          total += basketballPrice.pricesByDuration[durationKey][pkgLower] || 0;
        }
        return total;
      }

      // Single sport
      const startingPrice = await StartingPrice.findOne({
        type: sportLower,
        isActive: true,
      }).lean();

      if (!startingPrice || !startingPrice.pricesByDuration) {
        console.error(`❌ No StartingPrice found for sport: ${sportLower}`);
        return 0;
      }

      const durationPrices = startingPrice.pricesByDuration[durationKey];
      if (!durationPrices) {
        console.error(`❌ No prices found for duration: ${durationKey}`);
        return 0;
      }

      const price = durationPrices[pkgLower] || 0;
      return price;
    } catch (error) {
      console.error("Error fetching database prices:", error);
      throw error;
    }
  }

  private static calculateLeagueSurcharge(league: string): number {
    if (league?.toLowerCase() === "european") {
      return PricingConfig.leagueSurcharge.european;
    }
    return PricingConfig.leagueSurcharge.national;
  }

  private static calculateExtrasCost(bookingExtras: BookingExtra[]): number {
    return bookingExtras
      .filter((extra) => extra.isSelected && !extra.isIncluded)
      .reduce((sum, extra) => {
        // Use hardcoded price from config, fallback to 0 if not found (security)
        const price = PricingConfig.extras[extra.id] ?? 0;
        return sum + price * extra.quantity;
      }, 0);
  }

  private static calculateLeagueRemovalCost(
    removedCount: number,
    hasRemovedLeagues: boolean,
    totalPeople: number,
    selectedLeague: string,
  ): number {
    const isEuropean = selectedLeague?.toLowerCase() === "european";
    if (isEuropean) return 0;

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

  private static calculateFlightPreferenceCost(
    depStart?: number,
    depEnd?: number,
    arrStart?: number,
    arrEnd?: number,
  ): number {
    if (!depStart && !arrStart) return 0;

    const departureSlots = [360, 660, 840, 1080, 1440];
    const arrivalSlots = [660, 840, 1140, 1440];
    const defaultDeparture = { start: 360, end: 840 };
    const defaultArrival = { start: 840, end: 1440 };

    const findSlotIndex = (slots: number[], value: number) =>
      slots.findIndex((s) => Math.abs(s - value) < 30);

    // Departure cost
    // Ensure inputs are numbers (handle undefined)
    const safeDepStart = depStart || 0;
    const safeDepEnd = depEnd || 0;

    const depStartIdx = findSlotIndex(departureSlots, safeDepStart);
    const depEndIdx = findSlotIndex(departureSlots, safeDepEnd);
    const defDepStartIdx = findSlotIndex(
      departureSlots,
      defaultDeparture.start,
    );
    const defDepEndIdx = findSlotIndex(departureSlots, defaultDeparture.end);

    const departureCost =
      depStartIdx >= 0 &&
      depEndIdx >= 0 &&
      defDepStartIdx >= 0 &&
      defDepEndIdx >= 0
        ? (Math.abs(depStartIdx - defDepStartIdx) +
            Math.abs(depEndIdx - defDepEndIdx)) *
          PricingConfig.flightPreference.costPerStep
        : 0;

    // Arrival cost
    // Ensure inputs are numbers (handle undefined)
    const safeArrStart = arrStart || 0;
    const safeArrEnd = arrEnd || 0;

    const arrStartIdx = findSlotIndex(arrivalSlots, safeArrStart);
    const arrEndIdx = findSlotIndex(arrivalSlots, safeArrEnd);
    const defArrStartIdx = findSlotIndex(arrivalSlots, defaultArrival.start);
    const defArrEndIdx = findSlotIndex(arrivalSlots, defaultArrival.end);

    const arrivalCost =
      arrStartIdx >= 0 &&
      arrEndIdx >= 0 &&
      defArrStartIdx >= 0 &&
      defArrEndIdx >= 0
        ? (Math.abs(arrStartIdx - defArrStartIdx) +
            Math.abs(arrEndIdx - defArrEndIdx)) *
          PricingConfig.flightPreference.costPerStep
        : 0;

    return departureCost + arrivalCost;
  }
}
