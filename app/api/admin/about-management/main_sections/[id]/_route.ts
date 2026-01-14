import { NextResponse } from "next/server";
import { AboutService, jsonSuccess, jsonError } from "@/_backend";

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
      return jsonError("Main section not found", 404);
    }

    return jsonSuccess(
      {
        id: section._id.toString(),
        title: section.title,
        description: section.description,
        order: section.order,
        isActive: section.isActive,
      },
      "Main section updated successfully"
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to update main section", 500);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await AboutService.deleteMainSection(id);

    if (!deleted) {
      return jsonError("Main section not found", 404);
    }

    return jsonSuccess(null, "Main section deleted successfully");
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to delete main section", 500);
  }
}
