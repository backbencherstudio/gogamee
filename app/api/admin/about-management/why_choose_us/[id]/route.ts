import { NextResponse } from "next/server";
import { AboutService } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();

    const item = await AboutService.updateWhyChooseUs(id, {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Why choose us item not found" },
        { status: 404 }
      );
    }

    const { mainSections, ourValues, whyChooseUs } =
      await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Why Choose Us item updated successfully",
      data: {
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        order: item.order,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        deleted_at: item.deletedAt || null,
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
          items: ourValues.map((val) => ({
            id: val._id.toString(),
            title: val.title,
            description: val.description,
            order: val.order,
            created_at: val.createdAt,
            updated_at: val.updatedAt,
            deleted_at: val.deletedAt || null,
          })),
        },
        whyChooseUs: {
          title: "Why Choose GoGame",
          items: whyChooseUs.map((w) => ({
            id: w._id.toString(),
            title: w.title,
            description: w.description,
            order: w.order,
            created_at: w.createdAt,
            updated_at: w.updatedAt,
            deleted_at: w.deletedAt || null,
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
      { success: false, message: "Failed to update why choose us item" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await AboutService.deleteWhyChooseUs(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Why choose us item not found" },
        { status: 404 }
      );
    }

    const { mainSections, ourValues, whyChooseUs } =
      await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Why choose us item deleted successfully",
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
          items: ourValues.map((val) => ({
            id: val._id.toString(),
            title: val.title,
            description: val.description,
            order: val.order,
            created_at: val.createdAt,
            updated_at: val.updatedAt,
            deleted_at: val.deletedAt || null,
          })),
        },
        whyChooseUs: {
          title: "Why Choose GoGame",
          items: whyChooseUs.map((w) => ({
            id: w._id.toString(),
            title: w.title,
            description: w.description,
            order: w.order,
            created_at: w.createdAt,
            updated_at: w.updatedAt,
            deleted_at: w.deletedAt || null,
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
      { success: false, message: "Failed to delete why choose us item" },
      { status: 500 }
    );
  }
}
