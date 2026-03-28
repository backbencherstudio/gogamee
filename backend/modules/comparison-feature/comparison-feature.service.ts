import { ComparisonFeature } from "../../models";
import { connectToDatabase, getCache, setCache, deleteCache, clearCachePattern } from "@/backend";

class ComparisonFeatureService {
  private async clearCache(type?: string) {
    if (type) await deleteCache(`comparison-features:type:${type}`);
    await clearCachePattern("comparison-features:*");
  }

  async getByType(type: string) {
    const CACHE_KEY = `comparison-features:type:${type}`;
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const result = await ComparisonFeature.findOne({ type, isActive: true }).lean();
    
    if (result) {
      const formatted = { ...result, id: (result as any)._id.toString() };
      delete (formatted as any)._id;
      delete (formatted as any).__v;
      await setCache(CACHE_KEY, formatted, 3600);
      return formatted;
    }
    return null;
  }

  async updateByType(type: string, data: any) {
    await connectToDatabase();
    
    // Explicitly mapping payload to schema fields
    const updateData = {
      type: type,
      features: data.features || [],
      isActive: true
    };

    const updated = await ComparisonFeature.findOneAndUpdate(
      { type },
      { $set: updateData },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    ).lean();

    if (updated) {
      await this.clearCache(type);
    }

    return {
      success: !!updated,
      message: "Comparison features updated successfully",
      data: updated
    };
  }
}

export default new ComparisonFeatureService();
