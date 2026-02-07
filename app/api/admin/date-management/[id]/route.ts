import { NextResponse } from "next/server";
import { DateManagementService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();

    let dateEntry;

    if (payload.prices) {
      dateEntry = await DateManagementService.updateSportPrice(id, payload);
    } else if (payload.status) {
      dateEntry = await DateManagementService.updateSportStatus(id, payload);
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload: 'prices' or 'status' required",
        },
        { status: 400 },
      );
    }

    if (!dateEntry) {
      return NextResponse.json(
        { success: false, message: "Date not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Date updated successfully",
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update date" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();
    const sportName = payload.sportName;
    if (
      !sportName ||
      !["football", "basketball", "combined"].includes(sportName)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 },
      );
    }
    const deleted = await DateManagementService.deleteWithIdAndSportName(
      id,
      sportName,
    );

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Date not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Date deleted successfully",
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete date" },
      { status: 500 },
    );
  }
}
