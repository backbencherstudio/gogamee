import { NextResponse } from "next/server";
import { AboutService, jsonSuccess, jsonError } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const items = await AboutService.getAllWhyChooseUs();

    // Mapped to match legacy structure: { content: { whyChooseUs: { items: [] } } }
    return NextResponse.json({
      success: true,
      message: "Why choose us items fetched successfully",
      content: {
        whyChooseUs: {
          items: items.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            order: item.order,
            isActive: item.isActive,
          })),
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to fetch why choose us items", 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const item = await AboutService.createWhyChooseUs({
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    return NextResponse.json({
      success: true,
      message: "Why choose us item created successfully",
      data: {
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        order: item.order,
        isActive: item.isActive,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to create why choose us item", 500);
  }
}
