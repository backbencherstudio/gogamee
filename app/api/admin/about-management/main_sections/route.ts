import { NextResponse } from "next/server";
import { AboutService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Fetch all about content (Main Sections, Our Values, Why Choose Us)
    const { mainSections, ourValues, whyChooseUs } =
      await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "About content fetched successfully",
      content: {
        headline: "Experience unforgettable live sports adventures.",
        sections: mainSections.map((section) => ({
          id: section._id.toString(),
          title: section.title,
          description: section.description,
          order: section.order,
          created_at: section.createdAt,
          updated_at: section.updatedAt,
          deleted_at: section.deletedAt || null,
        })),
        values: {
          title: "Our Values",
          items: ourValues.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            order: item.order,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            deleted_at: item.deletedAt || null,
          })),
        },
        whyChooseUs: {
          title: "Why Choose GoGame",
          items: whyChooseUs.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            order: item.order,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            deleted_at: item.deletedAt || null,
          })),
        },
        meta: {
          version: 1,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch about content" },
      { status: 500 },
    );
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

    // Fetch updated content to return in the response
    const { mainSections, ourValues, whyChooseUs } =
      await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Section created successfully",
      data: {
        id: section._id.toString(),
        title: section.title,
        description: section.description,
        order: section.order,
        created_at: section.createdAt,
        updated_at: section.updatedAt,
        deleted_at: section.deletedAt || null,
      },
      content: {
        headline: "Experience unforgettable live sports adventures.",
        sections: mainSections.map((s) => ({
          id: s._id.toString(),
          title: s.title,
          description: s.description,
          order: s.order,
          created_at: s.createdAt,
          updated_at: s.updatedAt,
          deleted_at: s.deletedAt || null,
        })),
        values: {
          title: "Our Values",
          items: ourValues.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            order: item.order,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            deleted_at: item.deletedAt || null,
          })),
        },
        whyChooseUs: {
          title: "Why Choose GoGame",
          items: whyChooseUs.map((item) => ({
            id: item._id.toString(),
            title: item.title,
            description: item.description,
            order: item.order,
            created_at: item.createdAt,
            updated_at: item.updatedAt,
            deleted_at: item.deletedAt || null,
          })),
        },
        meta: {
          version: 1,
          updatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create main section" },
      { status: 500 },
    );
  }
}
