import { NextResponse } from "next/server";
import { BookingService } from "@/backend";
import { sendError, sendPaginatedResponse } from "@/app/lib/api-response";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "10");
    const status = request.nextUrl.searchParams.get("status");
    const days = request.nextUrl.searchParams.get("days");

    let createdAtFrom, createdAtTo;
    if (days && days !== "alltime") {
      const daysNum = parseInt(days.replace("days", ""));
      if (!isNaN(daysNum)) {
        const today = new Date();
        const cutoffDate = new Date();
        cutoffDate.setDate(today.getDate() - daysNum);
        // Start from beginning of the day X days ago
        cutoffDate.setHours(0, 0, 0, 0);
        
        createdAtFrom = cutoffDate.toISOString();
        createdAtTo = today.toISOString();
      }
    }

    const { bookings, total } = await BookingService.getAll({
      limit,
      skip: (page - 1) * limit,
      filters: {
        ...(status && status !== "all" ? { status } : {}),
        createdAtFrom,
        createdAtTo,
      },
    });

    return sendPaginatedResponse(
      bookings,
      total,
      page,
      limit,
      "Bookings fetched successfully",
    );
  } catch (error) {
    return sendError("Failed to fetch bookings", 500, error);
  }
}
