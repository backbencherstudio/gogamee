import { NextResponse } from "next/server";
import { FAQService, jsonSuccess, jsonError } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const faq = await FAQService.getById(id);

    if (!faq) {
      return jsonError("FAQ not found", 404);
    }

    return jsonSuccess(
      {
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder,
        category: faq.category,
      },
      "FAQ fetched successfully"
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to fetch FAQ", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();

    const faq = await FAQService.updateById(id, {
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sort_order,
      category: payload.category,
    });

    if (!faq) {
      return jsonError("FAQ not found", 404);
    }

    return jsonSuccess(
      {
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder,
        category: faq.category,
      },
      "FAQ updated successfully"
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to update FAQ", 500);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await FAQService.deleteById(id);

    if (!deleted) {
      return jsonError("FAQ not found", 404);
    }

    return jsonSuccess(null, "FAQ deleted successfully");
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to delete FAQ", 500);
  }
}
