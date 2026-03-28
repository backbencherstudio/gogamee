import { StartingPrice } from "../../models";
import { connectToDatabase, getCache, setCache, clearCachePattern } from "@/backend";

class StartingPriceService {
  private async clearCache() { await clearCachePattern("starting-price:*"); }

  async getAll(): Promise<any[]> {
    const cached = await getCache<any[]>("starting-price:all");
    if (cached) return cached;

    await connectToDatabase();
    const prices = await StartingPrice.find({ isActive: true }).lean();
    await setCache("starting-price:all", prices, 3600);
    return prices;
  }

  async getByType(type: string): Promise<any> {
    await connectToDatabase();
    return await StartingPrice.findOne({ type, isActive: true }).lean();
  }

  async updateByType(type: string, data: any): Promise<any> {
    await connectToDatabase();
    const updated = await StartingPrice.findOneAndUpdate({ type }, data, { new: true, upsert: true });
    await this.clearCache();
    return updated;
  }

  async getPrice(type: string, duration: string, category: "standard" | "premium"): Promise<number> {
    await connectToDatabase();
    const doc = await StartingPrice.findOne({ type, isActive: true }).lean();
    return (doc as any)?.pricesByDuration?.[duration]?.[category] || 0;
  }
}

export default new StartingPriceService();
