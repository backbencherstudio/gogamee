import {
  SocialContact,
  LegalPage,
  ISocialContact,
  ILegalPage,
} from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  deleteCache,
  clearCachePattern,
} from "@/_backend";
import type {
  CreateSocialContactData,
  UpdateSocialContactData,
  CreateLegalPageData,
  UpdateLegalPageData,
  SocialContactFilters,
  LegalPageFilters,
  SettingsQueryOptions,
} from "./settings.types";

class SettingsService {
  // ===== Social Contacts =====

  async createSocialContact(
    data: CreateSocialContactData
  ): Promise<ISocialContact> {
    await connectToDatabase();
    const contact = new SocialContact(data);
    const saved = await contact.save();

    await clearCachePattern("settings:social:*");
    return saved;
  }

  async getAllSocialContacts(options: SettingsQueryOptions = {}): Promise<{
    contacts: ISocialContact[];
    total: number;
    hasMore: boolean;
  }> {
    await connectToDatabase();

    const { filters = {}, sort, limit = 50, skip = 0 } = options;

    const query: any = { deletedAt: { $exists: false } };

    if ((filters as SocialContactFilters).isActive !== undefined)
      query.isActive = (filters as SocialContactFilters).isActive;
    if ((filters as SocialContactFilters).platform)
      query.platform = new RegExp(
        (filters as SocialContactFilters).platform!,
        "i"
      );

    const sortOptions: any = sort
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { order: 1, createdAt: -1 };

    const contacts = await SocialContact.find(query)
      .sort(sortOptions)
      .limit(limit + 1)
      .skip(skip);

    const hasMore = contacts.length > limit;
    const resultContacts = hasMore ? contacts.slice(0, limit) : contacts;
    const total = await SocialContact.countDocuments(query);

    return { contacts: resultContacts, total, hasMore };
  }

  async getActiveSocialContacts(): Promise<ISocialContact[]> {
    const result = await this.getAllSocialContacts({
      filters: { isActive: true },
      limit: 100,
    });
    return result.contacts;
  }

  async getSocialContactById(id: string): Promise<ISocialContact | null> {
    const CACHE_KEY = `settings:social:${id}`;
    const cached = await getCache<ISocialContact>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const contact = await SocialContact.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (contact) {
      await setCache(CACHE_KEY, contact, 600);
    }

    return contact;
  }

  async updateSocialContact(
    id: string,
    data: UpdateSocialContactData
  ): Promise<ISocialContact | null> {
    await connectToDatabase();
    const updated = await SocialContact.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await deleteCache(`settings:social:${id}`);
      await clearCachePattern("settings:social:list:*"); // Assuming lists could be cached with this pattern in future or strictly invalidate
    }

    return updated;
  }

  async deleteSocialContact(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await SocialContact.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (result) {
      await deleteCache(`settings:social:${id}`);
      await clearCachePattern("settings:social:*");
    }

    return !!result;
  }

  // ===== Legal Pages =====

  async createLegalPage(data: CreateLegalPageData): Promise<ILegalPage> {
    await connectToDatabase();
    const legalPage = new LegalPage(data);
    const saved = await legalPage.save();

    await clearCachePattern("settings:legal:*");
    return saved;
  }

  async getAllLegalPages(options: SettingsQueryOptions = {}): Promise<{
    pages: ILegalPage[];
    total: number;
    hasMore: boolean;
  }> {
    await connectToDatabase();

    const { filters = {}, sort, limit = 50, skip = 0 } = options;

    const query: any = { deletedAt: { $exists: false } };

    if ((filters as LegalPageFilters).type)
      query.type = (filters as LegalPageFilters).type;
    if ((filters as LegalPageFilters).isActive !== undefined)
      query.isActive = (filters as LegalPageFilters).isActive;

    const sortOptions: any = sort
      ? { [sort.field]: sort.order === "desc" ? -1 : 1 }
      : { type: 1, createdAt: -1 };

    const pages = await LegalPage.find(query)
      .sort(sortOptions)
      .limit(limit + 1)
      .skip(skip);

    const hasMore = pages.length > limit;
    const resultPages = hasMore ? pages.slice(0, limit) : pages;
    const total = await LegalPage.countDocuments(query);

    return { pages: resultPages, total, hasMore };
  }

  async getLegalPageById(id: string): Promise<ILegalPage | null> {
    const CACHE_KEY = `settings:legal:${id}`;
    const cached = await getCache<ILegalPage>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();
    const page = await LegalPage.findOne({
      _id: id,
      deletedAt: { $exists: false },
    });

    if (page) {
      await setCache(CACHE_KEY, page, 600);
    }

    return page;
  }

  async updateLegalPage(
    id: string,
    data: UpdateLegalPageData
  ): Promise<ILegalPage | null> {
    await connectToDatabase();
    const updated = await LegalPage.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await deleteCache(`settings:legal:${id}`);
      await clearCachePattern("settings:legal:*");
    }

    return updated;
  }

  async deleteLegalPage(id: string): Promise<boolean> {
    await connectToDatabase();
    const result = await LegalPage.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });

    if (result) {
      await deleteCache(`settings:legal:${id}`);
      await clearCachePattern("settings:legal:*");
    }

    return !!result;
  }

  async createOrUpdateLegalPage(
    data: CreateLegalPageData
  ): Promise<ILegalPage> {
    await connectToDatabase();

    // Check if page exists by type
    let page = await LegalPage.findOne({
      type: data.type,
      deletedAt: { $exists: false },
    });

    if (page) {
      // Update existing
      page.title = data.title;
      page.content = data.content;
      page.version = data.version;
      if (data.isActive !== undefined) page.isActive = data.isActive;

      const updated = await page.save();
      await deleteCache(`settings:legal:${updated._id}`);
      await clearCachePattern("settings:legal:*");
      return updated;
    } else {
      // Create new
      const newPage = new LegalPage(data);
      const saved = await newPage.save();
      await clearCachePattern("settings:legal:*");
      return saved;
    }
  }
}

export default new SettingsService();
