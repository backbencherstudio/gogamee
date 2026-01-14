import { NextResponse } from "next/server";
import { FAQService, jsonError } from "@/_backend";

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
    return NextResponse.json(
      {
        success: true,
        message: "FAQs fetched successfully",
        list: faqs.map((faq) => ({
          id: faq._id.toString(),
          question: faq.question,
          answer: faq.answer,
          sort_order: faq.sortOrder,
          category: faq.category,
        })),
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to fetch FAQs", 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const faq = await FAQService.create({
      question: payload.question,
      answer: payload.answer,
      sortOrder: payload.sort_order ?? 0,
      category: payload.category,
    });

    return NextResponse.json(
      {
        success: true,
        message: "FAQ created successfully",
        data: {
          id: faq._id.toString(),
          question: faq.question,
          answer: faq.answer,
          sort_order: faq.sortOrder,
          category: faq.category,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to create FAQ", 500);
  }
}
