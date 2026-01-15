import { NextResponse } from "next/server";
import { DateManagementService } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const payload = await request.json();

    const dateEntry = await DateManagementService.updateById(id, payload);

    if (!dateEntry) {
      return NextResponse.json(
        { success: false, message: "Date not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        id: dateEntry._id.toString(),
        date: dateEntry.date,
        status: dateEntry.status,
        football_standard_package_price:
          dateEntry.football_standard_package_price,
        football_premium_package_price:
          dateEntry.football_premium_package_price,
        baskatball_standard_package_price:
          dateEntry.baskatball_standard_package_price,
        baskatball_premium_package_price:
          dateEntry.baskatball_premium_package_price,
        updated_football_standard_package_price:
          dateEntry.updated_football_standard_package_price || null,
        updated_football_premium_package_price:
          dateEntry.updated_football_premium_package_price || null,
        updated_baskatball_standard_package_price:
          dateEntry.updated_baskatball_standard_package_price || null,
        updated_baskatball_premium_package_price:
          dateEntry.updated_baskatball_premium_package_price || null,
        package: dateEntry.package || null,
        sportname: dateEntry.sportname,
        league: dateEntry.league || "national",
        notes: dateEntry.notes || null,
        destinationCity: dateEntry.destinationCity || null,
        assignedMatch: dateEntry.assignedMatch || null,
        approve_status: dateEntry.approve_status || "pending",
        created_at: dateEntry.createdAt,
        updated_at: dateEntry.updatedAt,
        deleted_at: null,
        duration: dateEntry.duration || "1",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update date" },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await DateManagementService.deleteById(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Date not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Date deleted successfully",
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete date" },
      { status: 500 }
    );
  }
}
