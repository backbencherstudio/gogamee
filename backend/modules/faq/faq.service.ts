import { FAQ, IFAQ } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/backend";
import type {
  CreateFAQData,
  UpdateFAQData,
  FAQFilters,
  FAQQueryOptions,
} from "./faq.types";

class FAQService {
  /**
   * Create a new FAQ
   */
  async create(data: CreateFAQData): Promise<IFAQ> {
    await connectToDatabase();
    const faq = new FAQ(data);
    const saved = await faq.save();

    // Invalidate caches
    await clearCachePattern("faq:*");

    return saved;
  }

  /**
   * Get all FAQs with optional filtering
   */
  async getAll(options: FAQQueryOptions = {}): Promise<{
    faqs: IFAQ[];
    total: number;
    hasMore: boolean;
  }> {
    await connectToDatabase();

    const { filters = {}, sort, limit = 50, page = 1 } = options;
    const skip = options.skip ?? (page - 1) * limit;

    // Build query
    const query: any = { deletedAt: { $exists: false } };

    if (filters.category) {
      query.category = new RegExp(`^${filters.category}$`, "i");
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    // Build sort
    const sortOptions: any = {};
    if (sort) {
      sortOptions[sort.field] = sort.order === "desc" ? -1 : 1;
    } else {
      sortOptions.sortOrder = 1;
      sortOptions.createdAt = 1;
    }

    // Execute query
    const faqs = await FAQ.find(query)
      .sort(sortOptions)
      .limit(limit + 1)
      .skip(skip);

    const hasMore = faqs.length > limit;
    const resultFAQs = hasMore ? faqs.slice(0, limit) : faqs;

    const total = await FAQ.countDocuments(query);

    return {
      faqs: resultFAQs,
      total,
      hasMore,
    };
  }

  /**
   * Get FAQ by ID
   */
  async getById(id: string): Promise<IFAQ | null> {
    const CACHE_KEY = `faq:${id}`;
    const cached = await getCache<IFAQ>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const faq = await FAQ.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (faq) {
      await setCache(CACHE_KEY, faq, 600); // 10 mins
    }

    return faq;
  }

  /**
   * Update FAQ by ID
   */
  async updateById(id: string, data: UpdateFAQData): Promise<IFAQ | null> {
    await connectToDatabase();
    const updated = await FAQ.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await deleteCache(`faq:${id}`);
      await clearCachePattern("faq:list:*");
      await clearCachePattern("faq:active");
    }

    return updated;
  }

  /**
   * Delete FAQ by ID (soft delete)
   */
  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await FAQ.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (result) {
      await deleteCache(`faq:${id}`);
      await clearCachePattern("faq:*");
    }

    return !!result;
  }

  /**
   * Get active FAQs sorted by order
   */
  async getActiveFAQs(): Promise<IFAQ[]> {
    const CACHE_KEY = "faq:active";
    const cached = await getCache<IFAQ[]>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const faqs = await FAQ.find({
      isActive: true,
      deletedAt: { $exists: false },
    }).sort({ sortOrder: 1, createdAt: 1 });

    await setCache(CACHE_KEY, faqs, 3600); // 1 hour

    return faqs;
  }

  /**
   * Reorder FAQs
   */
  async reorder(
    orderedIds: { id: string; sortOrder: number }[],
  ): Promise<void> {
    await connectToDatabase();

    const updatePromises = orderedIds.map(({ id, sortOrder }) =>
      FAQ.findByIdAndUpdate(id, { sortOrder }),
    );

    await Promise.all(updatePromises);

    await clearCachePattern("faq:*");
  }
}

export default new FAQService();
