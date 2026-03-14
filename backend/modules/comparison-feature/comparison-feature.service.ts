import { ComparisonFeature } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/backend";
import type {
  UpdateComparisonFeatureData,
} from "./comparison-feature.types";

class ComparisonFeatureService {
  async getByType(type: string) {
    const CACHE_KEY = `comparison-features:type:${type}`;
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const result = await ComparisonFeature.findOne({ type, isActive: true });

    if (result) {
      await setCache(CACHE_KEY, result, 3600);
    }

    return result;
  }

  async updateByType(
    type: string,
    data: UpdateComparisonFeatureData,
  ) {
    await connectToDatabase();
    const updated = await ComparisonFeature.findOneAndUpdate(
      { type },
      { ...data },
      { new: true, runValidators: true, upsert: true },
    );

    if (updated) {
      await deleteCache(`comparison-features:type:${type}`);
      await clearCachePattern("comparison-features:all");
    }

    return {
      success: !!updated,
      message: updated ? "Comparison features updated successfully" : "Failed to update comparison features",
      data: updated
    };
  }
}

export default new ComparisonFeatureService();
