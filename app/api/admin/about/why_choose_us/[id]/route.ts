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

    const item = await AboutService.updateValue("why_choose_us", id, {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Why choose us item not found" },
        { status: 404 },
      );
    }

    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Why Choose Us item updated successfully",
      data: {
        id: (item as any)._id,
        title: item.title,
        description: item.description,
        order: item.order,
      },
      content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update why choose us item" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await AboutService.deleteValue("why_choose_us", id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Why choose us item not found" },
        { status: 404 },
      );
    }

    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Why choose us item deleted successfully",
      data: null,
      content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete why choose us item" },
      { status: 500 },
    );
  }
}
