import { SocialContact, LegalPage } from "../../models";
import { connectToDatabase, getCache, setCache, deleteCache, clearCachePattern } from "@/backend";

class SettingsService {
  private async clearSocialCache() { await clearCachePattern("settings:social:*"); }
  private async clearLegalCache() { await clearCachePattern("settings:legal:*"); }

  private mapToLean(doc: any) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    const { __v, _id, ...rest } = obj;
    return { id: _id.toString(), ...rest };
  }

  // Social Contacts
  async createSocialContact(data: any): Promise<any> {
    await connectToDatabase();
    const saved = await new SocialContact(data).save();
    await this.clearSocialCache();
    return this.mapToLean(saved);
  }

  async getAllSocialContacts(options: any = {}): Promise<any> {
    await connectToDatabase();
    const query: any = { deletedAt: { $exists: false } };
    if (options.filters?.isActive !== undefined) query.isActive = options.filters.isActive;
    const contacts = await SocialContact.find(query).sort({ order: 1 }).lean();
    return { contacts: contacts.map(c => this.mapToLean(c)), total: contacts.length };
  }

  async getActiveSocialContacts(): Promise<any[]> {
    const { contacts } = await this.getAllSocialContacts({ filters: { isActive: true } });
    return contacts;
  }

  async updateSocialContact(id: string, data: any): Promise<any> {
    await connectToDatabase();
    const updated = await SocialContact.findByIdAndUpdate(id, data, { new: true });
    await this.clearSocialCache();
    return this.mapToLean(updated);
  }

  async upsertSocialContact(data: any): Promise<any> {
    await connectToDatabase();
    const contact = await SocialContact.findOneAndUpdate({ platform: data.platform }, data, { upsert: true, new: true });
    await this.clearSocialCache();
    return this.mapToLean(contact);
  }

  async deleteSocialContact(id: string): Promise<boolean> {
    await connectToDatabase();
    const deleted = await SocialContact.findByIdAndUpdate(id, { deletedAt: new Date() });
    await this.clearSocialCache();
    return !!deleted;
  }

  // Legal Pages
  async createOrUpdateLegalPage(data: any): Promise<any> {
    await connectToDatabase();
    const page = await LegalPage.findOneAndUpdate({ type: data.type, deletedAt: { $exists: false } }, data, { upsert: true, new: true });
    await this.clearLegalCache();
    return this.mapToLean(page);
  }

  async getAllLegalPages(options: any = {}): Promise<any> {
    await connectToDatabase();
    const query: any = { deletedAt: { $exists: false } };
    if (options.filters?.type) query.type = options.filters.type;
    if (options.filters?.isActive !== undefined) query.isActive = options.filters.isActive;
    const pages = await LegalPage.find(query).lean();
    return { pages: pages.map(p => this.mapToLean(p)), total: pages.length };
  }

  async getLegalPageByType(type: string): Promise<any> {
    await connectToDatabase();
    return this.mapToLean(await LegalPage.findOne({ type, deletedAt: { $exists: false } }).lean());
  }
}

export default new SettingsService();
