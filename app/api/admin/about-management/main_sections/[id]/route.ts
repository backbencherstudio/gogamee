import { NextResponse } from "next/server";
import { AboutService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();

    const section = await AboutService.updateMainSection(id, {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    if (!section) {
      return NextResponse.json(
        { success: false, message: "Main section not found" },
        { status: 404 },
      );
    }

    const { mainSections, ourValues, whyChooseUs } =
      await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Section updated successfully",
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
      { success: false, message: "Failed to update main section" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await AboutService.deleteMainSection(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Main section not found" },
        { status: 404 },
      );
    }

    const { mainSections, ourValues, whyChooseUs } =
      await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Main section deleted successfully",
      data: null,
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
      { success: false, message: "Failed to delete main section" },
      { status: 500 },
    );
  }
}
