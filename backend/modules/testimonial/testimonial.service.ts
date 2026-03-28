import { Testimonial, ITestimonial } from "../../models";
import { connectToDatabase, getCache, setCache, deleteCache, clearCachePattern } from "@/backend";
import type { CreateTestimonialData, UpdateTestimonialData, TestimonialQueryOptions } from "./testimonial.types";

class TestimonialService {
  private async clearCache() { await clearCachePattern("testimonial:*"); }

  private mapToLean(testimonial: any) {
    if (!testimonial) return null;
    const obj = testimonial.toObject ? testimonial.toObject() : testimonial;
    const { __v, _id, ...rest } = obj;
    return { id: _id.toString(), ...rest };
  }

  async create(data: CreateTestimonialData): Promise<any> {
    await connectToDatabase();
    const saved = await new Testimonial(data).save();
    await this.clearCache();
    return this.mapToLean(saved);
  }

  async getAll(options: TestimonialQueryOptions = {}): Promise<any> {
    await connectToDatabase();
    const { filters = {}, sort, limit = 50, page = 1 } = options;
    const skip = (page - 1) * limit;
    const query: any = { deletedAt: { $exists: false } };

    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.featured !== undefined) query.featured = filters.featured;
    if (filters.source) query.source = filters.source;

    const sortOptions: any = sort ? { [sort.field]: sort.order === "desc" ? -1 : 1 } : { featured: -1, sortOrder: 1, createdAt: -1 };
    const testimonials = await Testimonial.find(query).sort(sortOptions).limit(limit).skip(skip).lean();
    const total = await Testimonial.countDocuments(query);

    return { testimonials: testimonials.map(t => this.mapToLean(t)), total, hasMore: total > skip + limit };
  }

  async getById(id: string): Promise<any> {
    const CACHE_KEY = `testimonial:${id}`;
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const testimonial = await Testimonial.findOne({ _id: id, deletedAt: { $exists: false } }).lean();
    if (testimonial) {
      const lean = this.mapToLean(testimonial);
      await setCache(CACHE_KEY, lean, 600);
      return lean;
    }
    return null;
  }

  async updateById(id: string, data: UpdateTestimonialData): Promise<any> {
    await connectToDatabase();
    const updated = await Testimonial.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (updated) {
      await deleteCache(`testimonial:${id}`);
      await this.clearCache();
    }
    return this.mapToLean(updated);
  }

  async deleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Testimonial.findByIdAndUpdate(id, { deletedAt: new Date() });
    if (result) {
      await deleteCache(`testimonial:${id}`);
      await this.clearCache();
    }
    return !!result;
  }

  async hardDeleteById(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await Testimonial.findByIdAndDelete(id);
    if (result) {
      await deleteCache(`testimonial:${id}`);
      await this.clearCache();
    }
    return !!result;
  }

  async getRatingStats(): Promise<any> {
    const CACHE_KEY = "testimonial:stats";
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const [stats, distribution] = await Promise.all([
      Testimonial.aggregate([{ $match: { deletedAt: { $exists: false }, isActive: true } }, { $group: { _id: null, total: { $sum: 1 }, averageRating: { $avg: "$rating" } } }]),
      Testimonial.aggregate([{ $match: { deletedAt: { $exists: false }, isActive: true } }, { $group: { _id: "$rating", count: { $sum: 1 } } }, { $sort: { _id: -1 } }])
    ]);

    const result = {
      total: stats[0]?.total || 0,
      averageRating: stats[0]?.averageRating || 0,
      ratingDistribution: distribution.map(item => ({ rating: item._id, count: item.count }))
    };

    await setCache(CACHE_KEY, result, 3600);
    return result;
  }

  async getFeatured(limit: number = 6): Promise<any[]> {
    const CACHE_KEY = `testimonial:featured:${limit}`;
    const cached = await getCache<any[]>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const featured = await Testimonial.find({ isActive: true, featured: true, deletedAt: { $exists: false } }).sort({ sortOrder: 1, createdAt: -1 }).limit(limit).lean();
    const mapped = featured.map(t => this.mapToLean(t));
    await setCache(CACHE_KEY, mapped, 1800);
    return mapped;
  }
}

export default new TestimonialService();
