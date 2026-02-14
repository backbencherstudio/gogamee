import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { DateManagementService, StartingPriceService } from "@/backend";
import { sendError } from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport");
    const league = searchParams.get("league") || "national"; // Default to national if not provided
    const duration = searchParams.get("duration");
    const monthsParam = searchParams.get("months");
    const yearParam = searchParams.get("year");

    if (!sport || !duration || !monthsParam || !yearParam) {
      return sendError("Invalid query parameters", 400);
    }

    const months = monthsParam ? monthsParam.split(",") : [];
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    const { data } = await DateManagementService.getAll({
      duration,
      sportName: sport,
      league,
      months,
      year,
    });

    const pricing: any = await StartingPriceService.getByType(
      sport == "both" ? "combined" : sport || "football",
    );

    const mappedDates = data.map((date: any) => {
      const requestedSport = sport || date.sportName || "football";

      let prices = { standard: 0, premium: 0 };
      let status = "disabled"; // Default status

      // The backend getAll already applies base price fallbacks in the 'sports' structure
      // So we just need to extract from the correct sport key
      if (!sport || sport === "football") {
        prices = {
          standard: date.sports?.football?.standard || 0,
          premium: date.sports?.football?.premium || 0,
        };
        status = date.sports?.football?.status || "disabled";
      } else if (sport === "basketball") {
        prices = {
          standard: date.sports?.basketball?.standard || 0,
          premium: date.sports?.basketball?.premium || 0,
        };
        status = date.sports?.basketball?.status || "disabled";
      } else if (sport === "both" || sport === "combined") {
        prices = {
          standard: date.sports?.combined?.standard || 0,
          premium: date.sports?.combined?.premium || 0,
        };
        status = date.sports?.combined?.status || "disabled";
      }

      return {
        id: date._id.toString(),
        date: date.date,
        duration: date.duration || "1",
        league: date.league || "national",
        sportName: requestedSport,
        prices: prices,
        status: status, // Include status for frontend rendering
        created_at: date.createdAt,
        updated_at: date.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Dates fetched successfully",
      data: mappedDates,
      meta_data: {
        months: months,
        year: year,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return sendError("Failed to fetch dates", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const sport = payload.sportName;
    const date = payload.date;
    const duration = payload.duration;
    const league = payload.league;

    if (!sport || !date || !duration || !league) {
      return sendError("Invalid payload", 400);
    }

    const init = await DateManagementService.initDate({
      date: date,
      sportName: sport,
      duration: duration,
      league: league,
    });

    if (!init) {
      return sendError("Failed to create date", 500);
    }
    return NextResponse.json(
      { success: true, message: "Date created/updated successfully" },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create/update date" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const deleted = await DateManagementService.resetDateManagement();

    if (!deleted) {
      return sendError("Failed to delete date", 500);
    }
    return NextResponse.json(
      { success: true, message: "Date deleted successfully" },
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
