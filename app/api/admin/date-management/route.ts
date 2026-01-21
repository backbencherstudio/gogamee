import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { DateManagementService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const status = searchParams.get("status") ?? undefined;

    const dates = await DateManagementService.getAll({
      sportname: sport,
      dateFrom: startDate,
      dateTo: endDate,
      status,
    });

    const mappedDates = dates.map((date) => ({
      id: date._id.toString(),
      date: date.date,
      status: date.status,
      football_standard_package_price: date.football_standard_package_price,
      football_premium_package_price: date.football_premium_package_price,
      baskatball_standard_package_price: date.baskatball_standard_package_price,
      baskatball_premium_package_price: date.baskatball_premium_package_price,
      updated_football_standard_package_price:
        date.updated_football_standard_package_price || null,
      updated_football_premium_package_price:
        date.updated_football_premium_package_price || null,
      updated_baskatball_standard_package_price:
        date.updated_baskatball_standard_package_price || null,
      updated_baskatball_premium_package_price:
        date.updated_baskatball_premium_package_price || null,
      package: date.package || null,
      sportname: date.sportname,
      league: date.league || "national",
      notes: date.notes || null,
      destinationCity: date.destinationCity || null,
      assignedMatch: date.assignedMatch || null,
      approve_status: date.approve_status || "pending",
      created_at: date.createdAt,
      updated_at: date.updatedAt,
      deleted_at: null,
      duration: date.duration || "1",
    }));

    return NextResponse.json(mappedDates, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch dates" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const dateEntry = await DateManagementService.create(payload);

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
      },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create date" },
      { status: 500 },
    );
  }
}
