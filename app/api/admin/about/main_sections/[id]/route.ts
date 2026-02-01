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

    const value = await AboutService.updateValue("main_section", id, {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    if (!value) {
      return NextResponse.json(
        { success: false, message: "Main section not found" },
        { status: 404 },
      );
    }

    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Section updated successfully",
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
      { success: false, message: "Failed to update main section" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await AboutService.deleteValue("main_section", id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Main section not found" },
        { status: 404 },
      );
    }

    const content = await AboutService.getAllAboutContent();

    return NextResponse.json({
      success: true,
      message: "Main section deleted successfully",
      data: null,
      content,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete main section" },
      { status: 500 },
    );
  }
}
