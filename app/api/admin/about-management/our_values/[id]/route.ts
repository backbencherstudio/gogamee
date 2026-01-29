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

    const value = await AboutService.updateValue("our_values", id, {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    if (!value) {
      return NextResponse.json(
        { success: false, message: "Our value not found" },
        { status: 404 },
      );
    }

    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Value updated successfully",
      data: {
        id: (value as any)._id,
        title: value.title,
        description: value.description,
        order: value.order,
      },
      content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update our value" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await AboutService.deleteValue("our_values", id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Our value not found" },
        { status: 404 },
      );
    }

    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Our value deleted successfully",
      data: null,
      content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete our value" },
      { status: 500 },
    );
  }
}
