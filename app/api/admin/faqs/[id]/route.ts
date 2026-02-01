import { NextResponse } from "next/server";
import { FAQService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

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
      return NextResponse.json(
        { success: false, message: "FAQ not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "FAQ fetched successfully",
      data: {
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder,
        category: faq.category,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: toErrorMessage(error, "Failed to fetch FAQ") },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();

    await FAQService.updateById(id, {
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sort_order,
      category: payload.category,
    });

    // Legacy behavior: Return all FAQs after update
    const { faqs } = await FAQService.getAll({
      filters: { isActive: true },
    });

    const mappedFaqs = faqs
      .map((faq) => ({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder,
        category: faq.category,
      }))
      .sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json({
      success: true,
      list: mappedFaqs,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update FAQ"),
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await FAQService.deleteById(id);

    // Legacy behavior: Return all FAQs after delete
    const { faqs } = await FAQService.getAll({
      filters: { isActive: true },
    });

    const mappedFaqs = faqs
      .map((faq) => ({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder,
        category: faq.category,
      }))
      .sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json({
      success: true,
      list: mappedFaqs,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to delete FAQ"),
      },
      { status: 500 },
    );
  }
}
