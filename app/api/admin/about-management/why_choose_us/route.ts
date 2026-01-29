import { NextResponse } from "next/server";
import { AboutService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const content = await AboutService.getAllAboutContent();

    // Mapped to match legacy structure
    return NextResponse.json({
      success: true,
      message: "Why choose us items fetched successfully",
      content: {
        whyChooseUs: content.whyChooseUs,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch why choose us items" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const item = await AboutService.addValueToSection("why_choose_us", {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Why Choose Us item added successfully",
      data: {
        id: (item as any)._id,
        title: item.title,
        description: item.description,
        order: item.order,
      },
      content: content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create why choose us item" },
      { status: 500 },
    );
  }
}
