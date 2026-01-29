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
      message: "Our values fetched successfully",
      content: {
        values: content.values,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch our values" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const value = await AboutService.addValueToSection("our_values", {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Value created successfully",
      data: {
        id: (value as any)._id,
        title: value.title,
        description: value.description || "",
        order: value.order,
      },
      content: content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create our value" },
      { status: 500 },
    );
  }
}
