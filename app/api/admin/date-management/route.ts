import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { DateManagementService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") ?? undefined;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const status = searchParams.get("status") ?? undefined;

    const allDates = await DateManagementService.getAll({
      sportname: sport,
      dateFrom: startDate,
      dateTo: endDate,
      status,
    });

    const page = parseInt(searchParams.get("page") ?? "1");
    // Limit defaults to 10 for pagination, or 1000 if not specified (legacy support)
    // But since user asked for pagination, let's respect it if provided.
    // If not provided, we keep it large to avoid breaking existing "get all" behavior without audit.
    // Actually, explicit limit=0 or -1 could mean all?
    // Let's stick to default 1000 to be safe for now, unless frontend sends limit.
    const limit = parseInt(searchParams.get("limit") ?? "1000");

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDates = allDates.slice(startIndex, endIndex);

    const mappedDates = paginatedDates.map((date: any) => ({
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

    return sendResponse(mappedDates, "Dates fetched successfully", {
      page,
      limit,
      total: allDates.length,
      total_pages: Math.ceil(allDates.length / limit),
    });
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to fetch dates", 500, error);
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
