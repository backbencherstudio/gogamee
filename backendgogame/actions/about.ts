import { randomUUID } from "crypto";
import { readStore, updateStore } from "../lib/jsonStore";
import {
  aboutContentSchema,
  mainSectionSchema,
  aboutItemSchema,
  type AboutContent,
  type Meta,
} from "../schemas";

const ABOUT_STORE_FILE = "about.json";

export interface AboutResponse {
  success: boolean;
  message: string;
  hero?: {
    title: string;
    backgroundImage: string;
  };
  content?: AboutContent;
  data?: unknown;
}

export interface MainSectionPayload {
  title: string;
  description: string;
  order?: number;
}

export interface MainSectionUpdatePayload {
  title?: string;
  description?: string;
  order?: number;
}

export interface AboutItemPayload {
  title: string;
  description: string;
  order?: number;
}

export interface AboutItemUpdatePayload {
  title?: string;
  description?: string;
  order?: number;
}

async function readAbout(): Promise<AboutContent> {
  const raw = await readStore(ABOUT_STORE_FILE);
  return aboutContentSchema.parse(raw);
}

function stampMeta(meta: Meta) {
  return {
    ...meta,
    updatedAt: new Date().toISOString(),
  };
}

export async function getAboutManagement(): Promise<AboutResponse> {
  const content = await readAbout();
  return {
    success: true,
    message: "About content fetched successfully",
    content,
  };
}

export async function addMainSection(
  payload: MainSectionPayload
): Promise<AboutResponse> {
  const now = new Date().toISOString();
  const section = mainSectionSchema.parse({
    id: `section-${randomUUID()}`,
    title: payload.title,
    description: payload.description,
    order: payload.order ?? 1,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });

  let result: AboutContent | null = null;

  await updateStore(ABOUT_STORE_FILE, (current) => {
    const parsed = aboutContentSchema.parse(current);
    const sections = [...parsed.sections, section].sort(
      (a, b) => a.order - b.order
    );
    result = {
      ...parsed,
      sections,
      meta: stampMeta(parsed.meta),
    };
    return result;
  });

  return {
    success: true,
    message: "Section created successfully",
    data: section,
    content: result ?? undefined,
  };
}

export async function editMainSection(
  id: string,
  payload: MainSectionUpdatePayload
): Promise<AboutResponse> {
  let updated: AboutContent | null = null;
  let updatedSection = null;

  await updateStore(ABOUT_STORE_FILE, (current) => {
    const parsed = aboutContentSchema.parse(current);
    const sections = parsed.sections.map((item) => {
      if (item.id !== id) {
        return item;
      }
      const next = mainSectionSchema.parse({
        ...item,
        ...payload,
        updated_at: new Date().toISOString(),
      });
      updatedSection = next;
      return next;
    });

    updated = {
      ...parsed,
      sections: sections.sort((a, b) => a.order - b.order),
      meta: stampMeta(parsed.meta),
    };

    return updated;
  });

  if (!updated || !updatedSection) {
    throw new Error(`Section not found: ${id}`);
  }

  return {
    success: true,
    message: "Section updated successfully",
    data: updatedSection,
    content: updated,
  };
}

function makeAboutItem(payload: AboutItemPayload) {
  const now = new Date().toISOString();
  return aboutItemSchema.parse({
    id: `about-item-${randomUUID()}`,
    title: payload.title,
    description: payload.description,
    order: payload.order ?? 1,
    created_at: now,
    updated_at: now,
    deleted_at: null,
  });
}

export async function addOurValue(
  payload: AboutItemPayload
): Promise<AboutResponse> {
  let updated: AboutContent | null = null;
  const value = makeAboutItem(payload);

  await updateStore(ABOUT_STORE_FILE, (current) => {
    const parsed = aboutContentSchema.parse(current);
    updated = {
      ...parsed,
      values: {
        ...parsed.values,
        items: [...parsed.values.items, value].sort(
          (a, b) => a.order - b.order
        ),
      },
      meta: stampMeta(parsed.meta),
    };
    return updated;
  });

  return {
    success: true,
    message: "Value created successfully",
    data: value,
    content: updated ?? undefined,
  };
}

export async function editOurValue(
  id: string,
  payload: AboutItemUpdatePayload
): Promise<AboutResponse> {
  let updated: AboutContent | null = null;
  let updatedValue = null;

  await updateStore(ABOUT_STORE_FILE, (current) => {
    const parsed = aboutContentSchema.parse(current);
    const items = parsed.values.items.map((item) => {
      if (item.id !== id) {
        return item;
      }
      const next = aboutItemSchema.parse({
        ...item,
        ...payload,
        updated_at: new Date().toISOString(),
      });
      updatedValue = next;
      return next;
    });

    updated = {
      ...parsed,
      values: {
        ...parsed.values,
        items: items.sort((a, b) => a.order - b.order),
      },
      meta: stampMeta(parsed.meta),
    };

    return updated;
  });

  if (!updated || !updatedValue) {
    throw new Error(`Value not found: ${id}`);
  }

  return {
    success: true,
    message: "Value updated successfully",
    data: updatedValue,
    content: updated,
  };
}

export async function addWhyChooseUs(
  payload: AboutItemPayload
): Promise<AboutResponse> {
  let updated: AboutContent | null = null;
  const item = makeAboutItem(payload);

  await updateStore(ABOUT_STORE_FILE, (current) => {
    const parsed = aboutContentSchema.parse(current);
    updated = {
      ...parsed,
      whyChooseUs: {
        ...parsed.whyChooseUs,
        items: [...parsed.whyChooseUs.items, item].sort(
          (a, b) => a.order - b.order
        ),
      },
      meta: stampMeta(parsed.meta),
    };
    return updated;
  });

  return {
    success: true,
    message: "Why Choose Us item added successfully",
    data: item,
    content: updated ?? undefined,
  };
}

export async function editWhyChooseUs(
  id: string,
  payload: AboutItemUpdatePayload
): Promise<AboutResponse> {
  let updated: AboutContent | null = null;
  let updatedItem = null;

  await updateStore(ABOUT_STORE_FILE, (current) => {
    const parsed = aboutContentSchema.parse(current);
    const items = parsed.whyChooseUs.items.map((item) => {
      if (item.id !== id) {
        return item;
      }
      const next = aboutItemSchema.parse({
        ...item,
        ...payload,
        updated_at: new Date().toISOString(),
      });
      updatedItem = next;
      return next;
    });

    updated = {
      ...parsed,
      whyChooseUs: {
        ...parsed.whyChooseUs,
        items: items.sort((a, b) => a.order - b.order),
      },
      meta: stampMeta(parsed.meta),
    };
    return updated;
  });

  if (!updated || !updatedItem) {
    throw new Error(`Why Choose Us item not found: ${id}`);
  }

  return {
    success: true,
    message: "Why Choose Us item updated successfully",
    data: updatedItem,
    content: updated,
  };
}

