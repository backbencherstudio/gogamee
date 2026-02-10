import { AboutPageSection, IAboutSection } from "../../models";
import {
  connectToDatabase,
  getCache,
  setCache,
  clearCachePattern,
} from "@/backend";
import type {
  CreateAboutSectionData,
  UpdateAboutSectionData,
} from "./about.types";

class AboutService {
  /**
   * Retrieves all About page content formatted for the API response.
   */
  async getAllAboutContent(): Promise<any> {
    const CACHE_KEY = "about:content";
    const cached = await getCache<any>(CACHE_KEY);
    if (cached) return cached;

    await connectToDatabase();

    const sections = await AboutPageSection.find({
      deletedAt: { $exists: false },
    }).sort({ order: 1 });

    const headlineDoc = sections.find((s) => s.type === "headline");
    const mainSectionDoc = sections.find((s) => s.type === "main_section");
    const ourValuesDoc = sections.find((s) => s.type === "our_values");
    const whyChooseUsDoc = sections.find((s) => s.type === "why_choose_us");

    const content = {
      headline: headlineDoc
        ? headlineDoc.title
        : "Experience unforgettable live sports adventures.",

      sections: mainSectionDoc
        ? [...mainSectionDoc.values]
            .sort((a: any, b: any) => a.order - b.order)
            .map((v: any) => ({
              id: v._id?.toString(),
              title: v.title,
              description: v.description,
              order: v.order,
            }))
        : [],

      values: {
        title: ourValuesDoc?.title || "Our Values",
        items: ourValuesDoc
          ? [...ourValuesDoc.values]
              .sort((a: any, b: any) => a.order - b.order)
              .map((v: any) => ({
                id: v._id?.toString(),
                title: v.title,
                description: v.description,
                order: v.order,
              }))
          : [],
      },

      whyChooseUs: {
        title: whyChooseUsDoc?.title || "Why Choose GoGame",
        items: whyChooseUsDoc
          ? [...whyChooseUsDoc.values]
              .sort((a: any, b: any) => a.order - b.order)
              .map((v: any) => ({
                id: v._id?.toString(),
                title: v.title,
                description: v.description,
                order: v.order,
              }))
          : [],
      },

      meta: {
        version: 2,
        updatedAt: new Date().toISOString(),
      },
    };

    await setCache(CACHE_KEY, content, 3600);
    return content;
  }

  /**
   * Adds a new section (mainly for "main_section" type).
   */
  async addSection(data: CreateAboutSectionData): Promise<IAboutSection> {
    await connectToDatabase();
    const section = await AboutPageSection.create({
      type: data.type || "main_section",
      title: data.title,
      description: data.description,
      values: data.values || [],
      order: data.order ?? 0,
      isActive: data.isActive ?? true,
    });
    await clearCachePattern("about:content");
    return section;
  }

  /**
   * Updates or creates the headline section (singleton).
   */
  async updateHeadline(title: string): Promise<IAboutSection> {
    await connectToDatabase();

    // Find existing headline section
    let headline = await AboutPageSection.findOne({
      type: "headline",
      deletedAt: { $exists: false },
    });

    if (headline) {
      // Update existing
      headline.title = title;
      await headline.save();
    } else {
      // Create new
      headline = await AboutPageSection.create({
        type: "headline",
        title,
        description: "",
        values: [],
        order: 0,
        isActive: true,
      });
    }

    await clearCachePattern("about:content");
    return headline;
  }

  /**
   * Updates a section by ID (top-level document).
   */
  async updateSection(
    sectionId: string,
    data: UpdateAboutSectionData,
  ): Promise<IAboutSection | null> {
    await connectToDatabase();
    const section = await AboutPageSection.findByIdAndUpdate(
      sectionId,
      { $set: data },
      { new: true },
    );
    await clearCachePattern("about:content");
    return section;
  }

  /**
   * Soft deletes a section by ID.
   */
  async deleteSection(sectionId: string): Promise<boolean> {
    await connectToDatabase();
    const section = await AboutPageSection.findByIdAndUpdate(
      sectionId,
      { deletedAt: new Date() },
      { new: true },
    );
    await clearCachePattern("about:content");
    return !!section;
  }

  // =================================================================
  // Value Management (Our Values / Why Choose Us)
  // These are now sub-documents inside specific AboutPageSection docs
  // =================================================================

  private async getOrCreateSectionByType(
    type: "our_values" | "why_choose_us" | "main_section",
  ) {
    let section = await AboutPageSection.findOne({
      type,
      deletedAt: { $exists: false },
    });

    if (!section) {
      let title = "Main Sections";
      if (type === "our_values") title = "Our Values";
      if (type === "why_choose_us") title = "Why Choose Us";

      section = await AboutPageSection.create({
        type,
        title,
        description: "",
        values: [],
        order: 99,
      });
    }
    return section;
  }

  async addValueToSection(
    sectionType: "our_values" | "why_choose_us" | "main_section",
    valueData: {
      title: string;
      description: string;
      order?: number;
      isActive?: boolean;
    },
  ) {
    await connectToDatabase();
    const section = await this.getOrCreateSectionByType(sectionType);

    const newValue = {
      title: valueData.title,
      description: valueData.description,
      order: valueData.order ?? 0,
      // Mongoose subdocs automatically get an _id
    };

    section.values.push(newValue as any);
    await section.save();
    await clearCachePattern("about:content");

    return section.values[section.values.length - 1];
  }

  async updateValue(
    sectionType: "our_values" | "why_choose_us" | "main_section",
    valueId: string,
    data: {
      title?: string;
      description?: string;
      order?: number;
      isActive?: boolean;
    },
  ) {
    await connectToDatabase();
    const section = await AboutPageSection.findOne({
      type: sectionType,
      "values._id": valueId,
    });

    if (!section) return null;

    const valueFn = section.values.id(valueId);
    if (!valueFn) return null;

    if (data.title !== undefined) valueFn.title = data.title;
    if (data.description !== undefined) valueFn.description = data.description;
    if (data.order !== undefined) valueFn.order = data.order;

    await section.save();
    await clearCachePattern("about:content");
    return valueFn;
  }

  async deleteValue(
    sectionType: "our_values" | "why_choose_us" | "main_section",
    valueId: string,
  ) {
    await connectToDatabase();
    const section = await AboutPageSection.findOne({
      type: sectionType,
      "values._id": valueId,
    });

    if (!section) return null;

    (section.values as any).pull({ _id: valueId });
    await section.save();
    await clearCachePattern("about:content");
    return true;
  }
}

export default new AboutService();
