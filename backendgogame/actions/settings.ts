// import { readStore, updateStore, writeStore } from "../lib/jsonStore";
// import {
//   socialContactStoreSchema,
//   socialContactLinksSchema,
//   legalPagesStoreSchema,
//   legalPageContentSchema,
//   type SocialContactLinks,
//   type LegalPageContent,
//   type Meta,
// } from "../schemas";

// const SOCIAL_CONTACT_STORE_FILE = "socialContact.json";
// const LEGAL_PAGES_STORE_FILE = "legalPages.json";

// function stampMeta(meta: Meta) {
//   return {
//     ...meta,
//     updatedAt: new Date().toISOString(),
//   };
// }

// // ========== Social Media & Contact Links ==========

// export interface SocialContactResponse {
//   success: boolean;
//   message: string;
//   links?: SocialContactLinks;
// }

// async function readSocialContact() {
//   try {
//     const raw = await readStore(SOCIAL_CONTACT_STORE_FILE);
//     return socialContactStoreSchema.parse(raw);
//   } catch (error) {
//     // Return default if file doesn't exist
//     const defaultData = {
//       links: {
//         whatsapp: "",
//         instagram: "",
//         tiktok: "",
//         linkedin: "",
//         email: "",
//       },
//       meta: {
//         version: 1,
//         updatedAt: new Date().toISOString(),
//       },
//     };
//     await writeStore(SOCIAL_CONTACT_STORE_FILE, defaultData);
//     return socialContactStoreSchema.parse(defaultData);
//   }
// }

// export async function getSocialContactLinks(): Promise<SocialContactResponse> {
//   const store = await readSocialContact();
//   return {
//     success: true,
//     message: "Social media and contact links fetched successfully",
//     links: store.links,
//   };
// }

// export async function updateSocialContactLinks(
//   links: Partial<SocialContactLinks>
// ): Promise<SocialContactResponse> {
//   const parsed = await readSocialContact();
//   const updatedLinks = socialContactLinksSchema.parse({
//     ...parsed.links,
//     ...links,
//   });

//   const updatedData = {
//     links: updatedLinks,
//     meta: stampMeta(parsed.meta),
//   };

//   await updateStore(SOCIAL_CONTACT_STORE_FILE, () => updatedData);

//   return {
//     success: true,
//     message: "Social media and contact links updated successfully",
//     links: updatedData.links,
//   };
// }

// // ========== Legal Pages ==========

// export interface LegalPagesResponse {
//   success: boolean;
//   message: string;
//   content?: {
//     privacy: LegalPageContent;
//     cookie: LegalPageContent;
//     terms: LegalPageContent;
//   };
// }

// async function readLegalPages() {
//   try {
//     const raw = await readStore(LEGAL_PAGES_STORE_FILE);
//     return legalPagesStoreSchema.parse(raw);
//   } catch (error) {
//     // Return default if file doesn't exist
//     const defaultData = {
//       privacy: {
//         en: "",
//         es: "",
//       },
//       cookie: {
//         en: "",
//         es: "",
//       },
//       terms: {
//         en: "",
//         es: "",
//       },
//       meta: {
//         version: 1,
//         updatedAt: new Date().toISOString(),
//       },
//     };
//     await writeStore(LEGAL_PAGES_STORE_FILE, defaultData);
//     return legalPagesStoreSchema.parse(defaultData);
//   }
// }

// export async function getLegalPages(): Promise<LegalPagesResponse> {
//   const store = await readLegalPages();
//   return {
//     success: true,
//     message: "Legal pages content fetched successfully",
//     content: {
//       privacy: store.privacy,
//       cookie: store.cookie,
//       terms: store.terms,
//     },
//   };
// }

// export async function updatePrivacyPolicy(
//   content: LegalPageContent
// ): Promise<LegalPagesResponse> {
//   const parsed = await readLegalPages();
//   const validatedContent = legalPageContentSchema.parse(content);

//   const updatedData = {
//     ...parsed,
//     privacy: validatedContent,
//     meta: stampMeta(parsed.meta),
//   };

//   await updateStore(LEGAL_PAGES_STORE_FILE, () => updatedData);

//   return {
//     success: true,
//     message: "Privacy policy updated successfully",
//     content: {
//       privacy: updatedData.privacy,
//       cookie: updatedData.cookie,
//       terms: updatedData.terms,
//     },
//   };
// }

// export async function updateCookiePolicy(
//   content: LegalPageContent
// ): Promise<LegalPagesResponse> {
//   const parsed = await readLegalPages();
//   const validatedContent = legalPageContentSchema.parse(content);

//   const updatedData = {
//     ...parsed,
//     cookie: validatedContent,
//     meta: stampMeta(parsed.meta),
//   };

//   await updateStore(LEGAL_PAGES_STORE_FILE, () => updatedData);

//   return {
//     success: true,
//     message: "Cookie policy updated successfully",
//     content: {
//       privacy: updatedData.privacy,
//       cookie: updatedData.cookie,
//       terms: updatedData.terms,
//     },
//   };
// }

// export async function updateTermsConditions(
//   content: LegalPageContent
// ): Promise<LegalPagesResponse> {
//   const parsed = await readLegalPages();
//   const validatedContent = legalPageContentSchema.parse(content);

//   const updatedData = {
//     ...parsed,
//     terms: validatedContent,
//     meta: stampMeta(parsed.meta),
//   };

//   await updateStore(LEGAL_PAGES_STORE_FILE, () => updatedData);

//   return {
//     success: true,
//     message: "Terms and conditions updated successfully",
//     content: {
//       privacy: updatedData.privacy,
//       cookie: updatedData.cookie,
//       terms: updatedData.terms,
//     },
//   };
// }
