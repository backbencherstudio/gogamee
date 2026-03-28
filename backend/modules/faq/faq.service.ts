import { FAQ, IFAQ } from "../../models";
import { connectToDatabase, getCache, setCache, deleteCache, clearCachePattern } from "@/backend";
import type { CreateFAQData, UpdateFAQData, FAQQueryOptions } from "./faq.types";

class FAQService {
  private async clearCache() { await clearCachePattern("faq:*"); }

  private mapToLean(faq: any) {
    if (!faq) return null;
    try {
      const obj = faq.toObject ? faq.toObject() : faq;
      const id = obj._id ? obj._id.toString() : (obj.id || "");
      const { __v, _id, ...rest } = obj;
      return { id, ...rest };
    } catch (err) {
      console.error("Error mapping FAQ to lean:", err);
      return null;
    }
  }

  async create(data: CreateFAQData): Promise<any> {
    await connectToDatabase();
    const saved = await new FAQ(data).save();
    await this.clearCache();
    return this.mapToLean(saved);
  }

  async getAll(options: FAQQueryOptions = {}): Promise<any> {
    await connectToDatabase();
    const { filters = {}, sort, limit = 50, page = 1 } = options;
    const skip = (page - 1) * limit;
    const query: any = { deletedAt: { $exists: false } };

    if (filters.category) query.category = new RegExp(`^${filters.category}$`, "i");
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const sortOptions: any = sort ? { [sort.field]: sort.order === "desc" ? -1 : 1 } : { sortOrder: 1, createdAt: 1 };
    const faqs = await FAQ.find(query).sort(sortOptions).limit(limit).skip(skip).lean();
    const total = await FAQ.countDocuments(query);

    return { 
      faqs: (faqs || []).map(f => this.mapToLean(f)).filter(Boolean), 
      total: total || 0, 
      hasMore: (total || 0) > skip + (faqs?.length || 0) 
    };
  }

  async getById(id: string): Promise<any> {
    const CACHE_KEY = `faq:${id}`;
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const faq = await FAQ.findOne({ _id: id, deletedAt: { $exists: false } }).lean();
    if (faq) {
      const lean = this.mapToLean(faq);
      if (lean) {
        await setCache(CACHE_KEY, lean, 600);
        return lean;
      }
    }
    return null;
  }

  async updateById(id: string, data: UpdateFAQData): Promise<any> {
    await connectToDatabase();
    const updated = await FAQ.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (updated) {
      await deleteCache(`faq:${id}`);
      await this.clearCache();
    }
    return this.mapToLean(updated);
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await FAQ.findByIdAndUpdate(id, { deletedAt: new Date() });
    if (result) {
      await deleteCache(`faq:${id}`);
      await this.clearCache();
    }
    return !!result;
  }

  async getActiveFAQs(): Promise<any[]> {
    const CACHE_KEY = "faq:active";
    const cached = await getCache<any[]>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const faqs = await FAQ.find({ isActive: true, deletedAt: { $exists: false } }).sort({ sortOrder: 1, createdAt: 1 }).lean();
    const mapped = (faqs || []).map(f => this.mapToLean(f)).filter(Boolean);
    await setCache(CACHE_KEY, mapped, 3600);
    return mapped || [];
  }

  async reorder(orderedIds: { id: string; sortOrder: number }[]): Promise<void> {
    await connectToDatabase();
    await Promise.all((orderedIds || []).map(({ id, sortOrder }) => FAQ.findByIdAndUpdate(id, { sortOrder })));
    await this.clearCache();
  }
}

export default new FAQService();
