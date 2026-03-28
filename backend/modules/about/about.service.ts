import { AboutPageSection } from "../../models";
import { connectToDatabase, getCache, setCache, clearCachePattern } from "@/backend";

class AboutService {
  private async clearCache() { await clearCachePattern("about:*"); }

  async getAllAboutContent(): Promise<any> {
    const cached = await getCache("about:content");
    if (cached) return cached;

    await connectToDatabase();
    const sections = await AboutPageSection.find({ deletedAt: { $exists: false } }).sort({ order: 1 }).lean();

    const formatted = {
      headline: sections.find(s => s.type === "headline")?.title || "Live sports adventures.",
      sections: sections.filter(s => s.type === "main_section").map(s => ({ id: s._id.toString(), title: s.title, description: s.description, order: s.order })),
      values: {
        title: "Our Values",
        items: sections.filter(s => s.type === "our_value").map(s => ({ id: s._id.toString(), title: s.title, description: s.description, order: s.order }))
      },
      whyChooseUs: {
        title: "Why Choose GoGame",
        items: sections.filter(s => s.type === "why_choose_us").map(s => ({ id: s._id.toString(), title: s.title, description: s.description, order: s.order }))
      }
    };

    await setCache("about:content", formatted, 3600);
    return formatted;
  }

  async addSection(data: any): Promise<any> {
    await connectToDatabase();
    const section = await new AboutPageSection(data).save();
    await this.clearCache();
    return section;
  }

  async updateSection(id: string, data: any): Promise<any> {
    await connectToDatabase();
    const updated = await AboutPageSection.findByIdAndUpdate(id, { $set: data }, { new: true });
    await this.clearCache();
    return updated;
  }

  async deleteSection(id: string): Promise<boolean> {
    await connectToDatabase();
    const deleted = await AboutPageSection.findByIdAndUpdate(id, { deletedAt: new Date() });
    await this.clearCache();
    return !!deleted;
  }

  // Compatibility Methods
  async updateValue(type: string, id: string, data: any): Promise<any> {
    return await this.updateSection(id, { ...data, type });
  }

  async addValue(type: string, data: any): Promise<any> {
    return await this.addSection({ ...data, type });
  }

  async addValueToSection(type: string, data: any): Promise<any> {
    return await this.addSection({ ...data, type });
  }

  async deleteValue(type: string, id: string): Promise<boolean> {
    return await this.deleteSection(id);
  }

  async updateHeadline(title: string): Promise<any> {
    await connectToDatabase();
    const updated = await AboutPageSection.findOneAndUpdate({ type: "headline" }, { title }, { upsert: true, new: true });
    await this.clearCache();
    return updated;
  }
}

export default new AboutService();
