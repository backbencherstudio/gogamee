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

    const value = await AboutService.updateOurValue(id, {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    if (!value) {
      return jsonError("Our value not found", 404);
    }

    return jsonSuccess(
      {
        id: value._id.toString(),
        title: value.title,
        description: value.description,
        order: value.order,
        isActive: value.isActive,
      },
      "Our value updated successfully"
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to update our value", 500);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await AboutService.deleteOurValue(id);

    if (!deleted) {
      return jsonError("Our value not found", 404);
    }

    return jsonSuccess(null, "Our value deleted successfully");
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to delete our value", 500);
  }
}
