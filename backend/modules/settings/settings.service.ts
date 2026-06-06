import {
  SocialContact,
  LegalPage,
  ComingSoonSettings,
  HomepageContent,
  defaultHomepageContent,
} from "../../models";
import {
  connectToDatabase,
  clearCachePattern,
} from "@/backend";

class SettingsService {
  private async clearSocialCache() {
    await clearCachePattern("settings:social:*");
  }

  private async clearLegalCache() {
    await clearCachePattern("settings:legal:*");
  }

  private async clearHomepageCache() {
    await clearCachePattern("settings:homepage:*");
  }

  private mapToLean(doc: any) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    const { __v, _id, ...rest } = obj;
    return { id: _id.toString(), ...rest };
  }

  async createSocialContact(data: any): Promise<any> {
    await connectToDatabase();
    const saved = await new SocialContact(data).save();
    await this.clearSocialCache();
    return this.mapToLean(saved);
  }

  async getAllSocialContacts(options: any = {}): Promise<any> {
    await connectToDatabase();
    const query: any = { deletedAt: { $exists: false } };
    if (options.filters?.isActive !== undefined) {
      query.isActive = options.filters.isActive;
    }
    const contacts = await SocialContact.find(query).sort({ order: 1 }).lean();
    return { contacts: contacts.map((c) => this.mapToLean(c)), total: contacts.length };
  }

  async getActiveSocialContacts(): Promise<any[]> {
    const { contacts } = await this.getAllSocialContacts({
      filters: { isActive: true },
    });
    return contacts;
  }

  async updateSocialContact(id: string, data: any): Promise<any> {
    await connectToDatabase();
    const updated = await SocialContact.findByIdAndUpdate(id, data, {
      new: true,
    });
    await this.clearSocialCache();
    return this.mapToLean(updated);
  }

  async upsertSocialContact(data: any): Promise<any> {
    await connectToDatabase();
    const contact = await SocialContact.findOneAndUpdate(
      { platform: data.platform },
      data,
      { upsert: true, new: true },
    );
    await this.clearSocialCache();
    return this.mapToLean(contact);
  }

  async deleteSocialContact(id: string): Promise<boolean> {
    await connectToDatabase();
    const deleted = await SocialContact.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });
    await this.clearSocialCache();
    return !!deleted;
  }

  async createOrUpdateLegalPage(data: any): Promise<any> {
    await connectToDatabase();
    const page = await LegalPage.findOneAndUpdate(
      { type: data.type, deletedAt: { $exists: false } },
      data,
      { upsert: true, new: true },
    );
    await this.clearLegalCache();
    return this.mapToLean(page);
  }

  async getAllLegalPages(options: any = {}): Promise<any> {
    await connectToDatabase();
    const query: any = { deletedAt: { $exists: false } };
    if (options.filters?.type) query.type = options.filters.type;
    if (options.filters?.isActive !== undefined) {
      query.isActive = options.filters.isActive;
    }
    const pages = await LegalPage.find(query).lean();
    return { pages: pages.map((p) => this.mapToLean(p)), total: pages.length };
  }

  async getLegalPageByType(type: string): Promise<any> {
    await connectToDatabase();
    return this.mapToLean(
      await LegalPage.findOne({
        type,
        deletedAt: { $exists: false },
      }).lean(),
    );
  }

  async getComingSoonSettings(): Promise<any> {
    await connectToDatabase();
    let settings = await ComingSoonSettings.findOne().lean();

    if (!settings) {
      const created = await new ComingSoonSettings({}).save();
      settings = created.toObject();
    }

    return this.mapToLean(settings);
  }

  async updateComingSoonSettings(data: {
    isEnabled?: boolean;
    launchDate?: Date | null;
    headline?: string;
    subtext?: string;
    privacyNote?: string;
  }): Promise<any> {
    await connectToDatabase();
    const existing = await ComingSoonSettings.findOne();

    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      return this.mapToLean(existing);
    }

    const created = await new ComingSoonSettings(data).save();
    return this.mapToLean(created);
  }

  async getHomepageContent(): Promise<any> {
    await connectToDatabase();
    let content = await HomepageContent.findOne().lean();

    if (!content) {
      const created = await new HomepageContent(defaultHomepageContent).save();
      content = created.toObject();
    }

    return this.mapToLean(content);
  }

  async updateHomepageContent(data: {
    heroTitle: string;
    heroSubtitle: string;
    howItWorksTitle: string;
    howItWorksIntro: string;
    steps: Array<{ title: string; description: string }>;
  }): Promise<any> {
    await connectToDatabase();
    const existing = await HomepageContent.findOne();

    if (existing) {
      Object.assign(existing, data);
      await existing.save();
      await this.clearHomepageCache();
      return this.mapToLean(existing);
    }

    const created = await new HomepageContent(data).save();
    await this.clearHomepageCache();
    return this.mapToLean(created);
  }
}

export default new SettingsService();
