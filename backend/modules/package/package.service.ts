import { Package, IPackage } from "../../models";
import { connectToDatabase, getCache, setCache, deleteCache, clearCachePattern } from "@/backend";
import type { CreatePackageData, UpdatePackageData, PackageQueryOptions } from "./package.types";

class PackageService {
  private async clearCache() { await clearCachePattern("package:*"); }

  private mapToLean(pkg: any) {
    if (!pkg) return null;
    const obj = pkg.toObject ? pkg.toObject() : pkg;
    const { __v, _id, ...rest } = obj;
    return { id: _id.toString(), ...rest };
  }

  async checkDuplicate(data: any): Promise<any> {
    await connectToDatabase();
    const query: any = { sport: new RegExp(`^${data.sport}$`, "i"), included: new RegExp(`^${data.included}$`, "i"), plan: data.plan, duration: data.duration, isActive: true };
    if (data.excludeId) query._id = { $ne: data.excludeId };
    const existing = await Package.findOne(query);
    return { exists: !!existing, existingPackage: existing || undefined };
  }

  async create(data: CreatePackageData): Promise<any> {
    const dup = await this.checkDuplicate(data);
    if (dup.exists) throw new Error(`Package already exists for this combination.`);
    await connectToDatabase();
    const saved = await new Package({ ...data, currency: data.currency || "EUR", sortOrder: data.sortOrder || 0 }).save();
    await this.clearCache();
    return this.mapToLean(saved);
  }

  async getAll(options: PackageQueryOptions = {}): Promise<any> {
    await connectToDatabase();
    const { filters = {}, sort, limit = 50, page = 1 } = options;
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.sport) query.sport = new RegExp(`^${filters.sport}$`, "i");
    if (filters.included) query.included = new RegExp(`^${filters.included}$`, "i");
    if (filters.plan) query.plan = filters.plan;
    if (filters.duration) query.duration = filters.duration;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const sortOptions: any = sort ? { [sort.field]: sort.order === "desc" ? -1 : 1 } : { sortOrder: 1, createdAt: -1 };
    const packages = await Package.find(query).sort(sortOptions).limit(limit).skip(skip).lean();
    const total = await Package.countDocuments(query);

    return { packages: packages.map(p => this.mapToLean(p)), total, hasMore: total > skip + limit };
  }

  async getById(id: string): Promise<any> {
    const CACHE_KEY = `package:${id}`;
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const pkg = await Package.findById(id).lean();
    if (pkg) {
      const lean = this.mapToLean(pkg);
      await setCache(CACHE_KEY, lean, 600);
      return lean;
    }
    return null;
  }

  async updateById(id: string, data: UpdatePackageData): Promise<any> {
    await connectToDatabase();
    const updated = await Package.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (updated) {
      await deleteCache(`package:${id}`);
      await this.clearCache();
    }
    return this.mapToLean(updated);
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Package.findByIdAndUpdate(id, { isActive: false });
    if (result) {
      await deleteCache(`package:${id}`);
      await this.clearCache();
    }
    return !!result;
  }

  async getAvailableSports(): Promise<string[]> {
    const CACHE_KEY = "package:sports";
    const cached = await getCache<string[]>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const sports = await Package.distinct("sport", { isActive: true });
    await setCache(CACHE_KEY, sports, 3600);
    return sports;
  }
}

export default new PackageService();
