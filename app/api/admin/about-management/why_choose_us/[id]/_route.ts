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

    const item = await AboutService.updateWhyChooseUs(id, {
      title: payload.title,
      description: payload.description,
      order: payload.order,
      isActive: payload.isActive,
    });

    if (!item) {
      return jsonError("Why choose us item not found", 404);
    }

    return jsonSuccess(
      {
        id: item._id.toString(),
        title: item.title,
        description: item.description,
        order: item.order,
        isActive: item.isActive,
      },
      "Why choose us item updated successfully"
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to update why choose us item", 500);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await AboutService.deleteWhyChooseUs(id);

    if (!deleted) {
      return jsonError("Why choose us item not found", 404);
    }

    return jsonSuccess(null, "Why choose us item deleted successfully");
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to delete why choose us item", 500);
  }
}
