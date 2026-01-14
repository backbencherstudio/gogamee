import { NextResponse } from "next/server";
import { AboutService, jsonSuccess, jsonError } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const values = await AboutService.getAllOurValues();

    // Mapped to match legacy structure: { content: { values: { items: [] } } }
    return NextResponse.json({
      success: true,
      message: "Our values fetched successfully",
      content: {
        values: {
          items: values.map((value) => ({
            id: value._id.toString(),
            title: value.title,
            description: value.description,
            order: value.order,
            isActive: value.isActive,
          })),
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to fetch our values", 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const value = await AboutService.createOurValue({
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    // Legacy action returns { success, message, data: item, content: updated_content }
    // We match the data part
    return NextResponse.json({
      success: true,
      message: "Our value created successfully",
      data: {
        id: value._id.toString(),
        title: value.title,
        description: value.description,
        order: value.order,
        isActive: value.isActive,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to create our value", 500);
  }
}
