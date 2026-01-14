import { StartingPrice, IStartingPrice } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/_backend";
import type {
  CreateStartingPriceData,
  UpdateStartingPriceData,
} from "./starting-price.types";

class StartingPriceService {
  async create(data: CreateStartingPriceData): Promise<IStartingPrice> {
    await connectToDatabase();

    const startingPrice = new StartingPrice(data);
    const saved = await startingPrice.save();

    await clearCachePattern("starting-price:*");
    return saved;
  }

  async getAll(): Promise<IStartingPrice[]> {
    const CACHE_KEY = "starting-price:all";
    const cached = await getCache<IStartingPrice[]>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const prices = await StartingPrice.find({ isActive: true }).sort({
      type: 1,
    });

    await setCache(CACHE_KEY, prices, 3600); // 1 hour
    return prices;
  }

  async getByType(type: string): Promise<IStartingPrice | null> {
    const CACHE_KEY = `starting-price:type:${type}`;
    const cached = await getCache<IStartingPrice>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const price = await StartingPrice.findOne({ type, isActive: true });

    if (price) {
      await setCache(CACHE_KEY, price, 3600);
    }

    return price;
  }

  async updateByType(
    type: string,
    data: UpdateStartingPriceData
  ): Promise<IStartingPrice | null> {
    await connectToDatabase();
    const updated = await StartingPrice.findOneAndUpdate(
      { type },
      { ...data, lastModifiedBy: data.lastModifiedBy },
      { new: true, runValidators: true, upsert: true }
    );

    if (updated) {
      await deleteCache(`starting-price:type:${type}`);
      await clearCachePattern("starting-price:all");
    }

    return updated;
  }

  async getPrice(
    type: string,
    duration: 1 | 2 | 3 | 4,
    priceType: "standard" | "premium"
  ): Promise<number | null> {
    const startingPrice = await this.getByType(type);
    if (!startingPrice) return null;

    const durationPrices =
      startingPrice.pricesByDuration[
        duration.toString() as keyof typeof startingPrice.pricesByDuration
      ];
    return durationPrices ? durationPrices[priceType] : null;
  }

  async getFormattedPrice(
    type: string,
    duration: 1 | 2 | 3 | 4,
    priceType: "standard" | "premium"
  ): Promise<string> {
    const startingPrice = await this.getByType(type);
    if (!startingPrice) return "Price not set";

    const price = await this.getPrice(type, duration, priceType);
    if (!price) return "Price not set";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: startingPrice.currency,
    }).format(price);
  }

  async getPriceRange(type: string): Promise<{
    min: number;
    max: number;
    currency: string;
  } | null> {
    const startingPrice = await this.getByType(type);
    if (!startingPrice) return null;

    const prices = Object.values(startingPrice.pricesByDuration).flatMap(
      (duration) => [duration.standard, duration.premium]
    );

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      currency: startingPrice.currency,
    };
  }

  async toggleActive(type: string): Promise<IStartingPrice | null> {
    await connectToDatabase();

    const startingPrice = await StartingPrice.findOne({ type });
    if (!startingPrice) return null;

    startingPrice.isActive = !startingPrice.isActive;
    const updated = await startingPrice.save();

    if (updated) {
      await deleteCache(`starting-price:type:${type}`);
      await clearCachePattern("starting-price:all");
    }

    return updated;
  }
}

export default new StartingPriceService();
