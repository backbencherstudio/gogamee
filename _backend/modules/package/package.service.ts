import { Package, IPackage } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/_backend";
import type {
  CreatePackageData,
  UpdatePackageData,
  PackageFilters,
  PackageQueryOptions,
} from "./package.types";

class PackageService {
  async create(data: CreatePackageData): Promise<IPackage> {
    await connectToDatabase();

    const packageData = {
      ...data,
      currency: data.currency || "EUR",
      sortOrder: data.sortOrder || 0,
    };

    const pkg = new Package(packageData);
    const saved = await pkg.save();

    // Invalidate caches
    await clearCachePattern("package:*");

    return saved;
  }

  async getAll(options: PackageQueryOptions = {}): Promise<{
    packages: IPackage[];
    total: number;
    hasMore: boolean;
  }> {
    await connectToDatabase();

    const { filters = {}, sort, limit = 50, skip = 0 } = options;

    const query: any = {};

    if (filters.sport) {
      query.sport = new RegExp(`^${filters.sport}$`, "i");
    }

    if (filters.category) {
      query.category = new RegExp(`^${filters.category}$`, "i");
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.$or = [
        {
          standardPrice: {
            ...(filters.minPrice !== undefined && { $gte: filters.minPrice }),
            ...(filters.maxPrice !== undefined && { $lte: filters.maxPrice }),
          },
        },
        {
          premiumPrice: {
            ...(filters.minPrice !== undefined && { $gte: filters.minPrice }),
            ...(filters.maxPrice !== undefined && { $lte: filters.maxPrice }),
          },
        },
      ];
    }

    const sortOptions: any = sort
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { sortOrder: 1, createdAt: -1 };

    const packages = await Package.find(query)
      .sort(sortOptions)
      .limit(limit + 1)
      .skip(skip);

    const hasMore = packages.length > limit;
    const resultPackages = hasMore ? packages.slice(0, limit) : packages;

    const total = await Package.countDocuments(query);

    return { packages: resultPackages, total, hasMore };
  }

  async getById(id: string): Promise<IPackage | null> {
    const CACHE_KEY = `package:${id}`;
    const cached = await getCache<IPackage>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const pkg = await Package.findById(id);

    if (pkg) {
      await setCache(CACHE_KEY, pkg, 600); // 10 mins
    }

    return pkg;
  }

  async updateById(
    id: string,
    data: UpdatePackageData
  ): Promise<IPackage | null> {
    await connectToDatabase();
    const updated = await Package.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await deleteCache(`package:${id}`);
      await clearCachePattern("package:list:*");
      await clearCachePattern("package:stats");
      await clearCachePattern("package:sports");
    }

    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Package.findByIdAndUpdate(id, { isActive: false });

    if (result) {
      await deleteCache(`package:${id}`);
      await clearCachePattern("package:*");
    }

    return !!result;
  }

  async hardDeleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Package.findByIdAndDelete(id);

    if (result) {
      await deleteCache(`package:${id}`);
      await clearCachePattern("package:*");
    }

    return !!result;
  }

  async getAvailableSports(): Promise<string[]> {
    const CACHE_KEY = "package:sports";
    const cached = await getCache<string[]>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const sports = await Package.distinct("sport", { isActive: true });

    await setCache(CACHE_KEY, sports, 3600); // 1 hour

    return sports;
  }

  async getCategoriesBySport(sport: string): Promise<string[]> {
    await connectToDatabase();
    const categories = await Package.distinct("category", {
      sport: new RegExp(`^${sport}$`, "i"),
      isActive: true,
    });
    return categories;
  }

  async getBySport(sport: string): Promise<IPackage[]> {
    await connectToDatabase();
    return await Package.find({
      sport: new RegExp(`^${sport}$`, "i"),
      isActive: true,
    }).sort({ sortOrder: 1, createdAt: -1 });
  }

  async updateSortOrder(
    updates: { id: string; sortOrder: number }[]
  ): Promise<void> {
    await connectToDatabase();

    const bulkOps = updates.map(({ id, sortOrder }) => ({
      updateOne: {
        filter: { _id: id },
        update: { sortOrder },
      },
    }));

    await Package.bulkWrite(bulkOps);

    // Invalidate all package caches as order changed
    await clearCachePattern("package:*");
  }

  async getStats(): Promise<{
    totalPackages: number;
    activePackages: number;
    totalSports: number;
    packagesBySport: { sport: string; count: number }[];
  }> {
    // Check cache
    const CACHE_KEY = "package:stats";
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();

    const [totalStats, activeStats, sportsStats] = await Promise.all([
      Package.countDocuments(),
      Package.countDocuments({ isActive: true }),
      Package.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: "$sport", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const stats = {
      totalPackages: totalStats,
      activePackages: activeStats,
      totalSports: sportsStats.length,
      packagesBySport: sportsStats.map((item) => ({
        sport: item._id,
        count: item.count,
      })),
    };

    await setCache(CACHE_KEY, stats, 600); // 10 mins
    return stats;
  }

  async toggleActiveStatus(id: string): Promise<IPackage | null> {
    await connectToDatabase();

    const pkg = await Package.findById(id);
    if (!pkg) return null;

    pkg.isActive = !pkg.isActive;
    const updated = await pkg.save();

    if (updated) {
      await deleteCache(`package:${id}`);
      await clearCachePattern("package:*");
    }

    return updated;
  }
}

export default new PackageService();
