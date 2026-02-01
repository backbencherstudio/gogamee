import { NextRequest } from "next/server";
import { AboutService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const content = await AboutService.getAllAboutContent();

    // Mapped to match legacy structure but inside data
    // Previously: content: { values: ... }
    // New: data: { values: ... }
    return sendResponse(
      {
        values: content.values,
      },
      "Our values fetched successfully",
    );
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to fetch our values", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const value = await AboutService.addValueToSection("our_values", {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    const content = await AboutService.getAllAboutContent();

    return sendResponse(
      {
        item: {
          id: (value as any)._id,
          title: value.title,
          description: value.description || "",
          order: value.order,
        },
        content: content,
      },
      "Value created successfully",
      undefined,
      201,
    );
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to create our value", 500, error);
  }
}
