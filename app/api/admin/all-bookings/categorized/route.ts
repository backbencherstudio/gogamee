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
    const search = request.nextUrl.searchParams.get("search");
    const dateFromParam = request.nextUrl.searchParams.get("dateFrom");
    const dateToParam = request.nextUrl.searchParams.get("dateTo");
    const paymentStatus = request.nextUrl.searchParams.get("paymentStatus");
    const league = request.nextUrl.searchParams.get("league");

    let createdAtFrom, createdAtTo;

    if (dateFromParam) {
      createdAtFrom = new Date(dateFromParam).toISOString();
    }
    if (dateToParam) {
      const dTo = new Date(dateToParam);
      dTo.setHours(23, 59, 59, 999);
      createdAtTo = dTo.toISOString();
    }

    if (!createdAtFrom && !createdAtTo && days && days !== "alltime") {
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
        payment_status: paymentStatus && paymentStatus !== "all" ? paymentStatus : undefined,
        league: league && league !== "all" ? league : undefined,
        createdAtFrom,
        createdAtTo,
        search: search || undefined,
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
