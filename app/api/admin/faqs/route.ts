import { NextRequest } from "next/server";
import { FAQService } from "@/backend";
import { sendResponse, sendPaginatedResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const { faqs, total } = await FAQService.getAll({ limit, page });
  const list = faqs.map((f: any) => ({ id: f.id, question: f.question, answer: f.answer, sort_order: f.sortOrder, category: f.category }));

  return sendPaginatedResponse(list, total, page, limit, "FAQs fetched successfully");
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const newFaq = await FAQService.create({ 
    question: payload.question, 
    answer: payload.answer, 
    sortOrder: payload.sort_order ?? 0, 
    category: payload.category 
  });

  return sendResponse(newFaq, "FAQ created successfully", undefined, 201);
});
