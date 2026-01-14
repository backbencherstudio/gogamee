import {
  AboutMainSection,
  AboutOurValues,
  AboutWhyChooseUs,
  IAboutMainSection,
  IAboutOurValues,
  IAboutWhyChooseUs,
} from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/_backend";
import type {
  CreateAboutItemData,
  UpdateAboutItemData,
  AboutItemFilters,
  AboutQueryOptions,
} from "./about.types";

class AboutService {
  // Generic methods for about items
  async createMainSection(
    data: CreateAboutItemData
  ): Promise<IAboutMainSection> {
    await connectToDatabase();
    const section = new AboutMainSection(data);
    const saved = await section.save();

    await clearCachePattern("about:main:*");
    await clearCachePattern("about:content");

    return saved;
  }

  async getAllMainSections(options: AboutQueryOptions = {}): Promise<{
    sections: IAboutMainSection[];
    total: number;
    hasMore: boolean;
  }> {
    await connectToDatabase();

    const { filters = {}, sort, limit = 50, skip = 0 } = options;

    const query: any = { deletedAt: { $exists: false } };

    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.search) {
      query.$or = [
        { title: new RegExp(filters.search, "i") },
        { description: new RegExp(filters.search, "i") },
      ];
    }

    const sortOptions: any = sort
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { order: 1, createdAt: -1 };

    const sections = await AboutMainSection.find(query)
      .sort(sortOptions)
      .limit(limit + 1)
      .skip(skip);

    const hasMore = sections.length > limit;
    const resultSections = hasMore ? sections.slice(0, limit) : sections;
    const total = await AboutMainSection.countDocuments(query);

    return { sections: resultSections, total, hasMore };
  }

  async getMainSectionById(id: string): Promise<IAboutMainSection | null> {
    const CACHE_KEY = `about:main:${id}`;
    const cached = await getCache<IAboutMainSection>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const section = await AboutMainSection.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (section) {
      await setCache(CACHE_KEY, section, 600);
    }

    return section;
  }

  async updateMainSection(
    id: string,
    data: UpdateAboutItemData
  ): Promise<IAboutMainSection | null> {
    await connectToDatabase();
    const updated = await AboutMainSection.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await deleteCache(`about:main:${id}`);
      await clearCachePattern("about:content");
    }

    return updated;
  }

  async deleteMainSection(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await AboutMainSection.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (result) {
      await deleteCache(`about:main:${id}`);
      await clearCachePattern("about:content");
    }

    return !!result;
  }

  // ===== Our Values =====

  async createOurValue(data: CreateAboutItemData): Promise<IAboutOurValues> {
    await connectToDatabase();
    const value = new AboutOurValues(data);
    const saved = await value.save();

    await clearCachePattern("about:values:*");
    await clearCachePattern("about:content");

    return saved;
  }

  async getAllOurValues(
    options: AboutQueryOptions = {}
  ): Promise<IAboutOurValues[]> {
    const CACHE_KEY = "about:values:all";
    // Note: options not fully supported in cache key for simplicity here,
    // assuming mainly full list fetch. If filtered, we skip cache or simple cache.
    // For now, let's cache the list if no complex options, or just standard list.

    await connectToDatabase();

    const { filters = {}, sort } = options;
    const query: any = { deletedAt: { $exists: false } };
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const sortOptions: any = sort
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { order: 1, createdAt: -1 };

    const values = await AboutOurValues.find(query).sort(sortOptions);
    return values;
  }

  async getOurValueById(id: string): Promise<IAboutOurValues | null> {
    const CACHE_KEY = `about:values:${id}`;
    const cached = await getCache<IAboutOurValues>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const value = await AboutOurValues.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (value) await setCache(CACHE_KEY, value, 600);
    return value;
  }

  async updateOurValue(
    id: string,
    data: UpdateAboutItemData
  ): Promise<IAboutOurValues | null> {
    await connectToDatabase();
    const updated = await AboutOurValues.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await deleteCache(`about:values:${id}`);
      await clearCachePattern("about:content");
      await clearCachePattern("about:values:all"); // invalidating list if we cached it (skipped above but good practice)
    }
    return updated;
  }

  async deleteOurValue(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await AboutOurValues.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (result) {
      await deleteCache(`about:values:${id}`);
      await clearCachePattern("about:content");
    }
    return !!result;
  }

  // ===== Why Choose Us =====

  async createWhyChooseUs(
    data: CreateAboutItemData
  ): Promise<IAboutWhyChooseUs> {
    await connectToDatabase();
    const item = new AboutWhyChooseUs(data);
    const saved = await item.save();

    await clearCachePattern("about:why:*");
    await clearCachePattern("about:content");

    return saved;
  }

  async getAllWhyChooseUs(
    options: AboutQueryOptions = {}
  ): Promise<IAboutWhyChooseUs[]> {
    await connectToDatabase();
    const { filters = {}, sort } = options;
    const query: any = { deletedAt: { $exists: false } };
    if (filters.isActive !== undefined) query.isActive = filters.isActive;

    const sortOptions: any = sort
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { order: 1, createdAt: -1 };

    return await AboutWhyChooseUs.find(query).sort(sortOptions);
  }

  async getWhyChooseUsById(id: string): Promise<IAboutWhyChooseUs | null> {
    const CACHE_KEY = `about:why:${id}`;
    const cached = await getCache<IAboutWhyChooseUs>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const item = await AboutWhyChooseUs.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (item) await setCache(CACHE_KEY, item, 600);
    return item;
  }

  async updateWhyChooseUs(
    id: string,
    data: UpdateAboutItemData
  ): Promise<IAboutWhyChooseUs | null> {
    await connectToDatabase();
    const updated = await AboutWhyChooseUs.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await deleteCache(`about:why:${id}`);
      await clearCachePattern("about:content");
    }
    return updated;
  }

  async deleteWhyChooseUs(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await AboutWhyChooseUs.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (result) {
      await deleteCache(`about:why:${id}`);
      await clearCachePattern("about:content");
    }
    return !!result;
  }

  // Similar methods for Our Values and Why Choose Us can be added here
  // For brevity, I'll add basic implementations

  async getAllAboutContent(): Promise<{
    mainSections: IAboutMainSection[];
    ourValues: IAboutOurValues[];
    whyChooseUs: IAboutWhyChooseUs[];
  }> {
    const CACHE_KEY = "about:content";
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();

    const [mainSections, ourValues, whyChooseUs] = await Promise.all([
      AboutMainSection.find({ deletedAt: { $exists: false } }).sort({
        order: 1,
        createdAt: 1,
      }),
      AboutOurValues.find({ deletedAt: { $exists: false } }).sort({
        order: 1,
        createdAt: 1,
      }),
      AboutWhyChooseUs.find({ deletedAt: { $exists: false } }).sort({
        order: 1,
        createdAt: 1,
      }),
    ]);

    const content = {
      mainSections,
      ourValues,
      whyChooseUs,
    };

    await setCache(CACHE_KEY, content, 3600); // 1 hour cache

    return content;
  }
}

export default new AboutService();
