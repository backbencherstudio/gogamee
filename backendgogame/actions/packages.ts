// import { randomUUID } from "crypto";
// import { readStore, updateStore } from "../lib/jsonStore";
// import {
//   packageStoreSchema,
//   packageItemSchema,
//   startingPriceStoreSchema,
//   startingPriceItemSchema,
//   type PackageItem,
//   type StartingPriceItem,
// } from "../schemas";

// const PACKAGE_STORE_FILE = "packages.json";
// const STARTING_PRICE_FILE = "startingPrices.json";

// export interface PackagePayload {
//   sport: string;
//   category: string;
//   standard: string;
//   premium: string;
//   standardPrice?: number;
//   premiumPrice?: number;
//   currency?: string;
// }

// export interface PackageUpdatePayload {
//   sport?: string;
//   category?: string;
//   standard?: string;
//   premium?: string;
//   standardPrice?: number;
//   premiumPrice?: number;
//   currency?: string;
// }

// export interface PackageResponse {
//   success: boolean;
//   message: string;
//   list?: PackageItem[];
//   data?: PackageItem;
//   count?: number;
//   filter?: Record<string, unknown>;
// }

// export interface StartingPriceResponse {
//   success: boolean;
//   message: string;
//   data: StartingPriceItem[];
// }

// const DURATION_KEYS = ["1", "2", "3", "4"] as const;

// type DurationKey = (typeof DURATION_KEYS)[number];

// type PricesByDuration = Record<
//   DurationKey,
//   { standard: number; premium: number }
// >;

// function normalizePricesByDuration(
//   prices: Partial<Record<DurationKey, { standard: number; premium: number }>>
// ): PricesByDuration {
//   const result: Partial<PricesByDuration> = {};
//   DURATION_KEYS.forEach((key) => {
//     const entry = prices[key];
//     result[key] = {
//       standard: entry?.standard ?? 0,
//       premium: entry?.premium ?? 0,
//     };
//   });
//   return result as PricesByDuration;
// }

// async function readPackages() {
//   const raw = await readStore(PACKAGE_STORE_FILE);
//   console.log(raw);
//   return packageStoreSchema.parse(raw);
// }

// async function readStartingPrices() {
//   const raw = await readStore(STARTING_PRICE_FILE);
//   return startingPriceStoreSchema.parse(raw);
// }

// export async function getAllPackages(sport?: string): Promise<PackageResponse> {
//   const store = await readPackages();
//   const list = sport
//     ? store.packages.filter(
//         (item) => item.sport.toLowerCase() === sport.toLowerCase()
//       )
//     : store.packages;

//   return {
//     success: true,
//     message: "Packages fetched successfully",
//     list,
//     count: list.length,
//     filter: sport ? { sport } : undefined,
//   };
// }

// export async function getPackageById(id: string): Promise<PackageResponse> {
//   const store = await readPackages();
//   const found = store.packages.find((item) => item.id === id);

//   if (!found) {
//     return {
//       success: false,
//       message: "Package not found",
//     };
//   }

//   return {
//     success: true,
//     message: "Package fetched successfully",
//     data: found,
//   };
// }

// export async function addPackage(
//   payload: PackagePayload
// ): Promise<PackageResponse> {
//   const now = new Date();
//   const item: PackageItem = packageItemSchema.parse({
//     id: `package-${randomUUID()}`,
//     ...payload,
//   });

//   await updateStore(PACKAGE_STORE_FILE, (current) => {
//     const parsed = packageStoreSchema.parse(current);
//     return {
//       packages: [...parsed.packages, item],
//       meta: {
//         ...parsed.meta,
//         updatedAt: now.toISOString(),
//       },
//     };
//   });

//   return {
//     success: true,
//     message: "Package created successfully",
//     data: item,
//   };
// }

// export async function editPackage(
//   id: string,
//   payload: PackageUpdatePayload
// ): Promise<PackageResponse> {
//   let updated: PackageItem | null = null;

//   await updateStore(PACKAGE_STORE_FILE, (current) => {
//     const parsed = packageStoreSchema.parse(current);
//     const packages = parsed.packages.map((item) => {
//       if (item.id !== id) {
//         return item;
//       }
//       updated = packageItemSchema.parse({
//         ...item,
//         ...payload,
//       });
//       return updated;
//     });

//     if (!updated) {
//       throw new Error(`Package not found: ${id}`);
//     }

//     return {
//       packages,
//       meta: {
//         ...parsed.meta,
//         updatedAt: new Date().toISOString(),
//       },
//     };
//   });

//   if (!updated) {
//     throw new Error(`Failed to update package: ${id}`);
//   }

//   return {
//     success: true,
//     message: "Package updated successfully",
//     data: updated,
//   };
// }

// export async function deletePackage(id: string): Promise<PackageResponse> {
//   await updateStore(PACKAGE_STORE_FILE, (current) => {
//     const parsed = packageStoreSchema.parse(current);
//     return {
//       packages: parsed.packages.filter((item) => item.id !== id),
//       meta: {
//         ...parsed.meta,
//         updatedAt: new Date().toISOString(),
//       },
//     };
//   });

//   return {
//     success: true,
//     message: "Package deleted successfully",
//   };
// }

// export async function getAvailableSports(): Promise<string[]> {
//   const store = await readPackages();
//   const sports = new Set(store.packages.map((item) => item.sport));
//   return Array.from(sports);
// }

// export async function getStartingPrice(
//   sport: "football" | "basketball" | "combined"
// ): Promise<StartingPriceResponse> {
//   const store = await readStartingPrices();
//   const data = store.startingPrices.filter((item) => item.type === sport);

//   return {
//     success: true,
//     message: "Starting price fetched successfully",
//     data,
//   };
// }

// export interface UpdateStartingPricePayload {
//   category?: string;
//   standardDescription?: string;
//   premiumDescription?: string;
//   currency: string;
//   pricesByDuration: Partial<
//     Record<DurationKey, { standard: number; premium: number }>
//   >;
// }

// export async function updateStartingPrice(
//   sport: "football" | "basketball" | "combined",
//   payload: UpdateStartingPricePayload
// ): Promise<StartingPriceResponse> {
//   let updated: StartingPriceItem | null = null;
//   const now = new Date().toISOString();

//   await updateStore(STARTING_PRICE_FILE, (current) => {
//     const parsed = startingPriceStoreSchema.parse(current);
//     const startingPrices = parsed.startingPrices.map((item) => {
//       if (item.type !== sport) {
//         return item;
//       }

//       const pricesByDuration = normalizePricesByDuration(
//         payload.pricesByDuration
//       );

//       updated = startingPriceItemSchema.parse({
//         ...item,
//         ...payload,
//         pricesByDuration,
//         updatedAt: now,
//       });
//       return updated;
//     });

//     if (!updated) {
//       const pricesByDuration = normalizePricesByDuration(
//         payload.pricesByDuration
//       );
//       const fallback: StartingPriceItem = startingPriceItemSchema.parse({
//         id: `starting-${sport}`,
//         type: sport,
//         currency: payload.currency,
//         standardDescription:
//           payload.standardDescription ?? `${sport} standard package baseline`,
//         premiumDescription:
//           payload.premiumDescription ?? `${sport} premium package baseline`,
//         pricesByDuration,
//         updatedAt: now,
//       });
//       startingPrices.push(fallback);
//       updated = fallback;
//     }

//     return {
//       startingPrices,
//       meta: {
//         ...parsed.meta,
//         updatedAt: now,
//       },
//     };
//   });

//   if (!updated) {
//     throw new Error("Failed to update starting price");
//   }

//   return {
//     success: true,
//     message: "Starting price updated successfully",
//     data: [updated],
//   };
// }
