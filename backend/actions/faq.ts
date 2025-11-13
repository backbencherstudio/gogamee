"use server";

import { randomUUID } from "crypto";
import { readStore, updateStore } from "../lib/jsonStore";
import { faqStoreSchema, faqItemSchema, type FaqItem } from "../schemas";

const FAQ_STORE_FILE = "faqs.json";

export interface FaqPayload {
  question: string;
  answer: string;
  sort_order?: number;
}

export interface FaqResponse {
  success: boolean;
  list: FaqItem[];
}

async function readFaqs() {
  const raw = await readStore(FAQ_STORE_FILE);
  return faqStoreSchema.parse(raw);
}

export async function getAllFaqs(): Promise<FaqResponse> {
  const store = await readFaqs();
  return {
    success: true,
    list: store.faqs.sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function addFaq(payload: FaqPayload): Promise<FaqResponse> {
  const next = faqItemSchema.parse({
    id: `faq-${randomUUID()}`,
    question: payload.question,
    answer: payload.answer,
    sort_order: payload.sort_order ?? 1,
  });

  await updateStore(FAQ_STORE_FILE, (current) => {
    const parsed = faqStoreSchema.parse(current);
    return {
      faqs: [...parsed.faqs, next],
      meta: {
        ...parsed.meta,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  return getAllFaqs();
}

export async function editFaq(
  id: string,
  payload: Partial<FaqPayload>
): Promise<FaqResponse> {
  await updateStore(FAQ_STORE_FILE, (current) => {
    const parsed = faqStoreSchema.parse(current);
    const faqs = parsed.faqs.map((item) => {
      if (item.id !== id) {
        return item;
      }
      return faqItemSchema.parse({
        ...item,
        ...payload,
      });
    });

    return {
      faqs,
      meta: {
        ...parsed.meta,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  return getAllFaqs();
}

export async function deleteFaq(id: string): Promise<FaqResponse> {
  await updateStore(FAQ_STORE_FILE, (current) => {
    const parsed = faqStoreSchema.parse(current);
    return {
      faqs: parsed.faqs.filter((item) => item.id !== id),
      meta: {
        ...parsed.meta,
        updatedAt: new Date().toISOString(),
      },
    };
  });

  return getAllFaqs();
}

