import { NextRequest } from "next/server";
import { FAQService } from "@/backend";
import {
  sendResponse,
  sendError,
  sendPaginatedResponse,
} from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const { faqs, total } = await FAQService.getAll({
      filters: {},
      limit,
      page,
    });

    const list = faqs
      .map((faq: any) => ({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder,
        category: faq.category,
      }))
      .sort((a: any, b: any) => a.sort_order - b.sort_order);

    return sendPaginatedResponse(
      list,
      total,
      page,
      limit,
      "FAQs fetched successfully",
    );
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to fetch FAQs", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    await FAQService.create({
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sort_order ?? 0,
      category: payload.category,
    });

    // Return new list to match legacy behavior (frontend refresh)
    const { faqs } = await FAQService.getAll({
      filters: {},
    });

    const list = faqs
      .map((faq: any) => ({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder,
        category: faq.category,
      }))
      .sort((a: any, b: any) => a.sort_order - b.sort_order);

    return sendResponse(list, "FAQ created successfully", undefined, 201);
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to create FAQ", 500, error);
  }
}
