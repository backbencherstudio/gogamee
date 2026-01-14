import { NextResponse } from "next/server";
import { AboutService, jsonSuccess, jsonError } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { sections } = await AboutService.getAllMainSections();

    // Mapped to match legacy structure where it returns 'content' containing 'sections'
    // Legacy route: GET /main_sections returns getAboutManagement() -> { success, content: { sections: [], ... } }
    // We construct a partial content object to satisfy the frontend expectation of response.content.sections
    return NextResponse.json({
      success: true,
      message: "About content fetched successfully",
      content: {
        sections: sections.map((section) => ({
          id: section._id.toString(),
          title: section.title,
          description: section.description,
          order: section.order,
          isActive: section.isActive,
        })),
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to fetch main sections", 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const section = await AboutService.createMainSection({
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    // Legacy addMainSection returns: { success, message, data: section, content: full_content }
    // We return data matching that
    return NextResponse.json({
      success: true,
      message: "Section created successfully",
      data: {
        id: section._id.toString(),
        title: section.title,
        description: section.description,
        order: section.order,
        isActive: section.isActive,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to create main section", 500);
  }
}
