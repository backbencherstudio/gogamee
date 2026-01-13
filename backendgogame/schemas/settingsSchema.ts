import { z } from "zod";
import { metaSchema } from "./common";

// Social Media & Contact Links Schema
export const socialContactLinksSchema = z.object({
  whatsapp: z.string().url().or(z.literal("")),
  instagram: z.string().url().or(z.literal("")),
  tiktok: z.string().url().or(z.literal("")),
  linkedin: z.string().url().or(z.literal("")),
  email: z.string().email().or(z.literal("")),
});

export const socialContactStoreSchema = z.object({
  links: socialContactLinksSchema,
  meta: metaSchema,
});

export type SocialContactLinks = z.infer<typeof socialContactLinksSchema>;
export type SocialContactStore = z.infer<typeof socialContactStoreSchema>;

// Legal Pages Schema
export const legalPageContentSchema = z.object({
  en: z.string(),
  es: z.string(),
});

export type LegalPageContent = z.infer<typeof legalPageContentSchema>;

export const legalPagesStoreSchema = z.object({
  privacy: legalPageContentSchema,
  cookie: legalPageContentSchema,
  terms: legalPageContentSchema,
  meta: metaSchema,
});

export type LegalPagesStore = z.infer<typeof legalPagesStoreSchema>;

