import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { DateManagementService, jsonError } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const status = searchParams.get("status") ?? undefined;

    // Legacy route filters by 'date' (startsWith) and 'league'
    // My service supports dateFrom/dateTo.
    // Legacy mapping:
    // date -> dateFrom (roughly, legacy is startsWith so might need regex if strictly matching legacy behavior, but pure date is likely fine)

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
      sportname: date.sportname,
      league: date.league,
      package: date.package,
      football_standard_package_price: date.football_standard_package_price,
      football_premium_package_price: date.football_premium_package_price,
      baskatball_standard_package_price: date.baskatball_standard_package_price,
      baskatball_premium_package_price: date.baskatball_premium_package_price,
      updated_football_standard_package_price:
        date.updated_football_standard_package_price,
      updated_football_premium_package_price:
        date.updated_football_premium_package_price,
      updated_baskatball_standard_package_price:
        date.updated_baskatball_standard_package_price,
      updated_baskatball_premium_package_price:
        date.updated_baskatball_premium_package_price,
      notes: date.notes,
      destinationCity: date.destinationCity,
      assignedMatch: date.assignedMatch,
      approve_status: date.approve_status,
      duration: date.duration,
      created_at: date.createdAt,
      updated_at: date.updatedAt,
      deleted_at: null,
    }));

    // Legacy returns a pure array: NextResponse.json(filteredDates)
    // So we must return a pure array, not wrapped in { success: true ... }
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
    return jsonError("Failed to fetch dates", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const dateEntry = await DateManagementService.create(payload);

    // Legacy returns the created object directly
    return NextResponse.json(
      {
        id: dateEntry._id.toString(),
        date: dateEntry.date,
        status: dateEntry.status,
        sportname: dateEntry.sportname,
        ...dateEntry.toObject(),
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to create date", 500);
  }
}
