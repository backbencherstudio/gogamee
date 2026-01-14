import { Testimonial, ITestimonial } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/_backend";
import type {
  CreateTestimonialData,
  UpdateTestimonialData,
  TestimonialFilters,
  TestimonialQueryOptions,
} from "./testimonial.types";

class TestimonialService {
  async create(data: CreateTestimonialData): Promise<ITestimonial> {
    await connectToDatabase();

    const testimonial = new Testimonial(data);
    const saved = await testimonial.save();

    await clearCachePattern("testimonial:*");
    return saved;
  }

  async getAll(options: TestimonialQueryOptions = {}): Promise<{
    testimonials: ITestimonial[];
    total: number;
    hasMore: boolean;
  }> {
    await connectToDatabase();

    const { filters = {}, sort, limit = 50, skip = 0 } = options;

    const query: any = { deletedAt: { $exists: false } };

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    if (filters.featured !== undefined) {
      query.featured = filters.featured;
    }

    if (filters.verified !== undefined) {
      query.verified = filters.verified;
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.minRating !== undefined || filters.maxRating !== undefined) {
      query.rating = {};
      if (filters.minRating !== undefined) {
        query.rating.$gte = filters.minRating;
      }
      if (filters.maxRating !== undefined) {
        query.rating.$lte = filters.maxRating;
      }
    }

    const sortOptions: any = sort
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { featured: -1, sortOrder: 1, createdAt: -1 };

    const testimonials = await Testimonial.find(query)
      .sort(sortOptions)
      .limit(limit + 1)
      .skip(skip);

    const hasMore = testimonials.length > limit;
    const resultTestimonials = hasMore
      ? testimonials.slice(0, limit)
      : testimonials;

    const total = await Testimonial.countDocuments(query);

    return { testimonials: resultTestimonials, total, hasMore };
  }

  async getById(id: string): Promise<ITestimonial | null> {
    const CACHE_KEY = `testimonial:${id}`;
    const cached = await getCache<ITestimonial>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const testimonial = await Testimonial.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (testimonial) {
      await setCache(CACHE_KEY, testimonial, 600);
    }

    return testimonial;
  }

  async updateById(
    id: string,
    data: UpdateTestimonialData
  ): Promise<ITestimonial | null> {
    await connectToDatabase();
    const updated = await Testimonial.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await deleteCache(`testimonial:${id}`);
      await clearCachePattern("testimonial:list:*");
      await clearCachePattern("testimonial:stats");
      await clearCachePattern("testimonial:featured");
    }

    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Testimonial.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (result) {
      await deleteCache(`testimonial:${id}`);
      await clearCachePattern("testimonial:*");
    }

    return !!result;
  }

  async hardDeleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Testimonial.findByIdAndDelete(id);

    if (result) {
      await deleteCache(`testimonial:${id}`);
      await clearCachePattern("testimonial:*");
    }

    return !!result;
  }

  async restoreById(id: string): Promise<ITestimonial | null> {
    await connectToDatabase();
    const restored = await Testimonial.findByIdAndUpdate(
      id,
      { $unset: { deletedAt: 1 } },
      { new: true }
    );

    if (restored) {
      await deleteCache(`testimonial:${id}`);
      await clearCachePattern("testimonial:*");
    }

    return restored;
  }

  async toggleFeatured(id: string): Promise<ITestimonial | null> {
    await connectToDatabase();

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) return null;

    testimonial.featured = !testimonial.featured;
    const save = await testimonial.save();

    if (save) {
      await deleteCache(`testimonial:${id}`);
      await clearCachePattern("testimonial:featured");
    }

    return save;
  }

  async getRatingStats(): Promise<{
    total: number;
    averageRating: number;
    ratingDistribution: { rating: number; count: number }[];
  }> {
    const CACHE_KEY = "testimonial:stats";
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();

    const [stats, distribution] = await Promise.all([
      Testimonial.aggregate([
        { $match: { deletedAt: { $exists: false }, isActive: true } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            averageRating: { $avg: "$rating" },
          },
        },
      ]),
      Testimonial.aggregate([
        { $match: { deletedAt: { $exists: false }, isActive: true } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),
    ]);

    const result = stats[0] || { total: 0, averageRating: 0 };

    const finalStats = {
      total: result.total || 0,
      averageRating: result.averageRating || 0,
      ratingDistribution: distribution.map((item) => ({
        rating: item._id,
        count: item.count,
      })),
    };

    await setCache(CACHE_KEY, finalStats, 3600);

    return finalStats;
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

    await Testimonial.bulkWrite(bulkOps);
    await clearCachePattern("testimonial:*");
  }

  async getFeatured(limit: number = 6): Promise<ITestimonial[]> {
    const CACHE_KEY = `testimonial:featured:${limit}`;
    const cached = await getCache<ITestimonial[]>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const featured = await Testimonial.find({
      isActive: true,
      featured: true,
      deletedAt: { $exists: false },
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(limit);

    await setCache(CACHE_KEY, featured, 1800); // 30 mins

    return featured;
  }
}

export default new TestimonialService();
