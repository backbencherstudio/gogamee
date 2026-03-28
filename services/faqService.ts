import { createBaseService } from "./baseService";
import { ApiResponse } from "../app/lib/api-response";

// ========== FAQ Interfaces ==========
export interface FaqItem {
  id: string;
  question: string;
  question_es?: string;
  answer: string;
  answer_es?: string;
  sort_order: number;
}

export type FaqPayload = Partial<FaqItem>;

// Initialize Base Service
const faqBaseService = createBaseService<FaqItem, FaqPayload>("/admin/faqs");

// ========== FAQ API Functions ==========

export const getAllFaqs = faqBaseService.getAll;
export const addFaq = faqBaseService.create;
export const editFaq = faqBaseService.update;
export const deleteFaq = faqBaseService.delete;
