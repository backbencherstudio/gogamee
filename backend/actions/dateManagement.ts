"use server";

import { randomUUID } from "crypto";
import { readStore, updateStore } from "../lib/jsonStore";
import {
  dateStoreSchema,
  dateManagementItemSchema,
  startingPriceStoreSchema,
  type DateManagementItem,
  type DateDuration,
} from "../schemas";

const DATE_STORE_FILE = "dates.json";
const STARTING_PRICE_FILE = "startingPrices.json";

export interface CreateDatePayload {
  date: string;
  status?: string;
  football_standard_package_price?: number;
  football_premium_package_price?: number;
  baskatball_standard_package_price?: number;
  baskatball_premium_package_price?: number;
  updated_football_standard_package_price?: number | null;
  updated_football_premium_package_price?: number | null;
  updated_baskatball_standard_package_price?: number | null;
  updated_baskatball_premium_package_price?: number | null;
  package?: string;
  sportname?: string;
  league?: string;
  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  approve_status?: string;
  duration?: DateDuration;
}

export interface UpdateDatePayload {
  sportname?: string;
  football_standard_package_price?: number;
  football_premium_package_price?: number;
  baskatball_standard_package_price?: number;
  baskatball_premium_package_price?: number;
  updated_football_standard_package_price?: number | null;
  updated_football_premium_package_price?: number | null;
  updated_baskatball_standard_package_price?: number | null;
  updated_baskatball_premium_package_price?: number | null;
  package?: string;
  league?: string;
  notes?: string;
  destinationCity?: string;
  assignedMatch?: string;
  status?: string;
  approve_status?: string;
  duration?: DateDuration;
}

async function readDates() {
  const raw = await readStore(DATE_STORE_FILE);
  return dateStoreSchema.parse(raw);
}

async function getBasePrices(duration: DateDuration) {
  const raw = await readStore(STARTING_PRICE_FILE);
  const parsed = startingPriceStoreSchema.parse(raw);

  const football = parsed.startingPrices.find(
    (item) => item.type === "football"
  );
  const basketball = parsed.startingPrices.find(
    (item) => item.type === "basketball"
  );

  const resolvedDuration = duration ?? "1";
  const footballDuration =
    football?.pricesByDuration?.[resolvedDuration] ??
    football?.pricesByDuration?.["1"];
  const basketballDuration =
    basketball?.pricesByDuration?.[resolvedDuration] ??
    basketball?.pricesByDuration?.["1"];

  return {
    football_standard: footballDuration?.standard ?? 379,
    football_premium: footballDuration?.premium ?? 1499,
    basketball_standard: basketballDuration?.standard ?? 359,
    basketball_premium: basketballDuration?.premium ?? 1479,
  };
}

export async function getAllDates(): Promise<DateManagementItem[]> {
  const store = await readDates();
  return store.dates;
}

export async function createDate(
  payload: CreateDatePayload
): Promise<DateManagementItem> {
  const now = new Date();
  const id = `date-${randomUUID()}`;
  const duration: DateDuration = payload.duration ?? "1";
  const basePrices = await getBasePrices(duration);

  const entry: DateManagementItem = dateManagementItemSchema.parse({
    id,
    date: payload.date,
    status: payload.status ?? "enabled",
    football_standard_package_price:
      payload.football_standard_package_price ?? basePrices.football_standard,
    football_premium_package_price:
      payload.football_premium_package_price ?? basePrices.football_premium,
    baskatball_standard_package_price:
      payload.baskatball_standard_package_price ??
      basePrices.basketball_standard,
    baskatball_premium_package_price:
      payload.baskatball_premium_package_price ?? basePrices.basketball_premium,
    updated_football_standard_package_price:
      payload.updated_football_standard_package_price ?? null,
    updated_football_premium_package_price:
      payload.updated_football_premium_package_price ?? null,
    updated_baskatball_standard_package_price:
      payload.updated_baskatball_standard_package_price ?? null,
    updated_baskatball_premium_package_price:
      payload.updated_baskatball_premium_package_price ?? null,
    package: payload.package ?? null,
    sportname: payload.sportname ?? "football",
    league: payload.league ?? "national",
    notes: payload.notes ?? null,
    destinationCity: payload.destinationCity ?? null,
    assignedMatch: payload.assignedMatch ?? null,
    approve_status: payload.approve_status ?? "pending",
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    deleted_at: null,
    duration,
  });

  await updateStore(DATE_STORE_FILE, (current) => {
    const parsed = dateStoreSchema.parse(current);
    return {
      dates: [...parsed.dates, entry],
      meta: {
        ...parsed.meta,
        updatedAt: now.toISOString(),
      },
    };
  });

  return entry;
}

export async function updateDate(
  id: string,
  payload: UpdateDatePayload
): Promise<DateManagementItem> {
  let updated: DateManagementItem | null = null;

  await updateStore(DATE_STORE_FILE, (current) => {
    const parsed = dateStoreSchema.parse(current);
    const dates = parsed.dates.map((item) => {
      if (item.id !== id) {
        return item;
      }

      updated = dateManagementItemSchema.parse({
        ...item,
        ...payload,
        updated_at: new Date().toISOString(),
        duration: payload.duration ?? item.duration ?? "1",
      });

      return updated;
    });

    if (!updated) {
      throw new Error(`Date not found: ${id}`);
    }

    return {
      dates,
      meta: {
        ...parsed.meta,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  if (!updated) {
    throw new Error(`Failed to update date: ${id}`);
  }

  return updated;
}

export async function deleteDate(id: string): Promise<void> {
  await updateStore(DATE_STORE_FILE, (current) => {
    const parsed = dateStoreSchema.parse(current);
    return {
      dates: parsed.dates.filter((item) => item.id !== id),
      meta: {
        ...parsed.meta,
        updatedAt: new Date().toISOString(),
      },
    };
  });
}

