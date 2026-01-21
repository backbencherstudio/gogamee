import { NextResponse } from "next/server";
import { FAQService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { faqs } = await FAQService.getAll({
      filters: { isActive: true },
    });

    // Mapped to match legacy response format which appears to be a wrapped object in actions,
    // but looking at route.ts line 10: NextResponse.json(response)
    // Legacy action returns { success, message, data: [] } typically OR just array depending on action.
    // Checking route.ts: "const response = await getAllFaqs();" -> getAllFaqs returns { success, message, list } usually.
    // Wait, let's look at faq/route.ts content again.
    // It imports getAllFaqs.
    // backendgogame/actions/faq usually returns { success: boolean, message: string, list: [] }
    // My previous read of route.ts showed: NextResponse.json(response)

    // So I should return that same shape.
    // Mapped to match legacy response format
    const mappedFaqs = faqs
      .map((faq) => ({
        id: faq._id.toString(),
        question: faq.question,
        answer: faq.answer,
        sort_order: faq.sortOrder,
        category: faq.category,
      }))
      .sort((a, b) => a.sort_order - b.sort_order);

    return NextResponse.json(
      {
        success: true,
        list: mappedFaqs,
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to fetch FAQs"),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    await FAQService.create({
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sort_order ?? 0,
      category: payload.category,
    });

    // Legacy behavior: Return all FAQs after creation
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

    return NextResponse.json(
      {
        success: true,
        list: mappedFaqs,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to create FAQ"),
      },
      { status: 500 },
    );
  }
}
