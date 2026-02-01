import { NextRequest } from "next/server";
import { AboutService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const content = await AboutService.getAllAboutContent();

    // Mapped to match legacy structure but inside data
    return sendResponse(
      {
        whyChooseUs: content.whyChooseUs,
      },
      "Why choose us items fetched successfully",
    );
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to fetch why choose us items", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const item = await AboutService.addValueToSection("why_choose_us", {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    const content = await AboutService.getAllAboutContent();

    return sendResponse(
      {
        item: {
          id: (item as any)._id,
          title: item.title,
          description: item.description,
          order: item.order,
        },
        content: content,
      },
      "Why Choose Us item added successfully",
    );
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to create why choose us item", 500, error);
  }
}
