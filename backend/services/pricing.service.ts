import { connectToDatabase } from "..";
import { toErrorMessage } from "../lib/errors";
import { DateManagement, StartingPrice } from "../models";
import { codeService } from "./code.service";

export const PricingConfig = {
  leagueSurcharge: { european: 50, national: 0 },
  leagueRemoval: { freeRemovals: 1, costPerRemoval: 20 },
  flightPreference: { costPerStep: 20 },
  singleTravelerSupplement: 50,
  babySupplement: 50,
  bookingFee: 0,
  extras: {
    breakfast: 10,
    "travel-insurance": 20,
    "underseat-bag": 0,
    "extra-luggage": 40,
    "seats-together": 20,
  } as Record<string, number>,
} as const;

export interface PriceCalculationInput {
  selectedSport: string;
  selectedPackage: string;
  selectedLeague: string;
  totalPeople: number;
  babiesCount?: number;
  departureDate: string;
  travelDuration: number;
  removedLeaguesCount: number;
  hasRemovedLeagues: boolean;
  bookingExtras?: any[];
  departureTimeStart?: number;
  departureTimeEnd?: number;
  arrivalTimeStart?: number;
  arrivalTimeEnd?: number;
  discountCode?: string;
}

export class PricingService {
  static async calculatePrice(input: PriceCalculationInput) {
    const { totalPeople, babiesCount = 0, travelDuration, selectedLeague } = input;
    const pricingPeopleCount = Math.max(0, totalPeople - babiesCount);
    const durationKey = this.getDurationKey(travelDuration);

    const basePricePerPerson = await this.getBasePrice(input.departureDate, durationKey, input.selectedSport, input.selectedPackage, selectedLeague);
    
    // Components Calculation
    const packageCost = basePricePerPerson * pricingPeopleCount;
    const babySupplement = babiesCount * PricingConfig.babySupplement;
    const leagueSurcharge = (selectedLeague.toLowerCase() === "european" ? PricingConfig.leagueSurcharge.european : 0) * pricingPeopleCount;
    const singleSupplement = pricingPeopleCount === 1 ? PricingConfig.singleTravelerSupplement : 0;
    
    const extrasCost = (input.bookingExtras || [])
      .filter(e => e.isSelected && !e.isIncluded)
      .reduce((sum, e) => sum + (PricingConfig.extras[e.id] ?? 0) * e.quantity, 0);

    const leagueRemovalCost = this.calculateRemovalCost(input.removedLeaguesCount, input.hasRemovedLeagues, pricingPeopleCount, selectedLeague);
    const flightPrefCost = this.calculateFlightCost(input) * pricingPeopleCount;

    const subtotal = packageCost + babySupplement + leagueSurcharge + singleSupplement + extrasCost + leagueRemovalCost + flightPrefCost + PricingConfig.bookingFee;
    const appliedCode = input.discountCode
      ? await codeService.validate(input.discountCode, subtotal)
      : null;
    if (input.discountCode && appliedCode && !appliedCode.valid) {
      throw new Error(appliedCode.message);
    }
    const discountAmount =
      appliedCode?.valid && appliedCode.discountAmount
        ? Number(appliedCode.discountAmount)
        : 0;
    const totalCost = Math.max(0, subtotal - discountAmount);

    const breakdown = this.buildBreakdown(input, {
      packageCost, basePricePerPerson, pricingPeopleCount, babySupplement, babiesCount,
      leagueSurcharge, extrasCost, leagueRemovalCost, flightPrefCost, singleSupplement, discountAmount
    });

    return {
      packageCost, extrasCost, leagueRemovalCost, leagueSurcharge, 
      flightPreferenceCost: flightPrefCost, singleTravelerSupplement: singleSupplement,
      bookingFee: PricingConfig.bookingFee, totalBaseCost: packageCost, subtotal,
      discountAmount, totalCost,
      appliedCode:
        appliedCode?.valid && appliedCode.code
          ? {
              codeId: appliedCode.code._id?.toString() || appliedCode.code.id,
              code: appliedCode.code.code,
              codeKind: appliedCode.code.codeKind,
              discountType: appliedCode.code.discountType,
              value: appliedCode.code.value,
              discountAmount,
            }
          : null,
      currency: "EUR", basePricePerPerson, breakdown
    };
  }

  private static getDurationKey(days: number): "1" | "2" | "3" | "4" {
    const nights = Math.max(0, days - 1);
    return nights <= 1 ? "1" : nights === 2 ? "2" : nights === 3 ? "3" : "4";
  }

  private static calculateRemovalCost(count: number, has: boolean, people: number, league: string): number {
    if (league.toLowerCase() === "european" || !has || count === 0) return 0;
    return Math.max(0, count - PricingConfig.leagueRemoval.freeRemovals) * PricingConfig.leagueRemoval.costPerRemoval * people;
  }

  private static calculateFlightCost(input: PriceCalculationInput): number {
    const { departureTimeStart: ds, departureTimeEnd: de, arrivalTimeStart: as, arrivalTimeEnd: ae } = input;
    if (!ds && !as) return 0;

    const getSteps = (slots: number[], start: number, end: number, defS: number, defE: number) => {
      const sIdx = slots.indexOf(start);
      const eIdx = slots.indexOf(end);
      const dsIdx = slots.indexOf(defS);
      const deIdx = slots.indexOf(defE);
      
      if (sIdx < 0 || eIdx < 0) return 0;
      
      // Frontend logic: only charge if start OR end is different from default
      // and only if both start and end are provided.
      // Actually, looking at common patterns, it's usually step distance.
      // If sIdx or eIdx is different from default, calculate steps.
      return Math.abs(sIdx - dsIdx) + Math.abs(eIdx - deIdx);
    };

    const depSteps = getSteps([360, 660, 840, 1080, 1440], ds || 360, de || 840, 360, 840);
    const arrSteps = getSteps([660, 840, 1140, 1440], as || 840, ae || 1440, 840, 1440);
    
    return (depSteps + arrSteps) * PricingConfig.flightPreference.costPerStep;
  }

  private static async getBasePrice(date: string, duration: string, sport: string, pkg: string, league: string): Promise<number> {
    await connectToDatabase();
    const formattedDate = date.substring(0, 10);
    const sportKey = sport.toLowerCase() === "both" ? "combined" : sport.toLowerCase();
    const pkgKey = pkg.toLowerCase() as "standard" | "premium";
    const leagueKey = league.toLowerCase() === "european" ? "european" : "national";

    const dateEntry = await DateManagement.findOne({
      date: { $regex: `^${formattedDate}` },
      duration, 
      league: leagueKey
    });

    if (dateEntry) {
      const price = (dateEntry.sports as any)?.[sportKey]?.[pkgKey];
      if (typeof price === "number" && price > 0) return price;
      
      // If sportKey price is not found, but it's "combined", try summing football + basketball
      if (sportKey === "combined") {
        const f = (dateEntry.sports as any)?.football?.[pkgKey] || 0;
        const b = (dateEntry.sports as any)?.basketball?.[pkgKey] || 0;
        if (f > 0 || b > 0) return f + b;
      }
    }

    // Fallback to StartingPrice
    if (sport.toLowerCase() === "both") {
      const [f, b] = await Promise.all([
        StartingPrice.findOne({ type: "football", isActive: true }).lean(),
        StartingPrice.findOne({ type: "basketball", isActive: true }).lean()
      ]);
      const fPrice = (f as any)?.pricesByDuration?.[duration]?.[pkgKey] || 0;
      const bPrice = (b as any)?.pricesByDuration?.[duration]?.[pkgKey] || 0;
      return fPrice + bPrice;
    }

    const sp = await StartingPrice.findOne({ type: sport.toLowerCase(), isActive: true }).lean();
    return (sp as any)?.pricesByDuration?.[duration]?.[pkgKey] || 0;
  }

  private static buildBreakdown(input: any, vals: any) {
    const items = [
      { description: `Base Package (${input.selectedSport} - ${input.selectedPackage})`, amount: vals.packageCost, quantity: vals.pricingPeopleCount, unitPrice: vals.basePricePerPerson }
    ];

    if (vals.babySupplement > 0) items.push({ description: "Baby Supplement", amount: vals.babySupplement, quantity: input.babiesCount, unitPrice: PricingConfig.babySupplement });
    if (vals.leagueSurcharge > 0) items.push({ description: "League Surcharge (European)", amount: vals.leagueSurcharge, quantity: vals.pricingPeopleCount, unitPrice: PricingConfig.leagueSurcharge.european });
    
    if (vals.extrasCost > 0) {
      input.bookingExtras?.filter((e: any) => e.isSelected && !e.isIncluded).forEach((e: any) => {
        const p = PricingConfig.extras[e.id] ?? e.price;
        items.push({ description: `Extra: ${e.name}`, amount: p * e.quantity, quantity: e.quantity, unitPrice: p });
      });
    }

    if (vals.leagueRemovalCost > 0) items.push({ description: "League Removals", amount: vals.leagueRemovalCost, quantity: vals.pricingPeopleCount, unitPrice: vals.leagueRemovalCost / vals.pricingPeopleCount });
    if (vals.flightPrefCost > 0) items.push({ description: "Flight Preferences", amount: vals.flightPrefCost, quantity: vals.pricingPeopleCount, unitPrice: vals.flightPrefCost / vals.pricingPeopleCount });
    if (vals.singleSupplement > 0) items.push({ description: "Single Traveler Supplement", amount: vals.singleSupplement, quantity: 1, unitPrice: PricingConfig.singleTravelerSupplement });
    if (vals.discountAmount > 0) items.push({ description: "Codigo de descuento o regalo", amount: -vals.discountAmount, quantity: 1, unitPrice: -vals.discountAmount });

    return items;
  }
}
