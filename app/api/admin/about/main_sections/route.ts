import { NextRequest } from "next/server";
import { AboutService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch all about content
    const content = await AboutService.getAllAboutContent();

    return sendResponse(content, "About content fetched successfully");
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to fetch about content", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const value = await AboutService.addValueToSection("main_section", {
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
          description: value.description,
          order: value.order,
        },
        content,
      },
      "Main section added successfully",
    );
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to create main section", 500, error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();

    if (!payload.headline) {
      return sendError("Headline is required", 400);
    }

    const headlineSection = await AboutService.updateHeadline(payload.headline);
    const content = await AboutService.getAllAboutContent();

    return sendResponse(
      {
        item: {
          id: headlineSection._id.toString(),
          title: headlineSection.title,
        },
        content,
      },
      "Headline updated successfully",
    );
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to update headline", 500, error);
  }
}
