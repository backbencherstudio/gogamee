import { NextResponse } from "next/server";
import { DateManagementService, jsonSuccess, jsonError } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();

    const dateEntry = await DateManagementService.updateById(id, payload);

    if (!dateEntry) {
      return jsonError("Date not found", 404);
    }

    return jsonSuccess(
      {
        id: dateEntry._id.toString(),
        ...dateEntry.toObject(),
      },
      "Date updated successfully"
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to update date", 500);
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await DateManagementService.deleteById(id);

    if (!deleted) {
      return jsonError("Date not found", 404);
    }

    return jsonSuccess(null, "Date deleted successfully");
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to delete date", 500);
  }
}
