import { NextResponse } from "next/server";
import { BookingService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";
import { sendResponse, sendError } from "@/app/lib/api-response";
import { mapBookingToLegacy } from "@/backend/modules/booking/booking.mapper";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const bookingsResult = await BookingService.getAll({
      limit: 1000, // Admin view
    });

    // bookingsResult might be { bookings: [...] } or just [...] depending on backend service.
    // Step 326 showed: const { bookings } = await BookingService.getAll(...)
    const bookings = bookingsResult.bookings;

    const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "10");
    const status = request.nextUrl.searchParams.get("status");
    const days = request.nextUrl.searchParams.get("days");

    // Server-side Filtering
    let filteredBookings = bookings;

    // 1. Filter by Status
    if (status && status !== "all") {
      if (status === "rejected") {
        // Matches frontend "rejected" tab which includes cancelled
        filteredBookings = filteredBookings.filter(
          (b: any) => b.status === "rejected" || b.status === "cancelled",
        );
      } else {
        filteredBookings = filteredBookings.filter(
          (b: any) => b.status === status,
        );
      }
    }

    // 2. Filter by Date (Time Filter)
    if (days && days !== "alltime") {
      const daysNum = parseInt(days.replace("days", ""));
      if (!isNaN(daysNum)) {
        const today = new Date();
        const cutoffDate = new Date();
        cutoffDate.setDate(today.getDate() - daysNum);
        // Reset time to start of day for accurate comparison? Or just simple timestamp comparison
        // Frontend uses date-fns subDays. We'll approximate with native Date.

        filteredBookings = filteredBookings.filter((b: any) => {
          const dateStr = b.bookingTimestamp || b.createdAt; // Use correct field
          if (!dateStr) return false;
          const bDate = new Date(dateStr);
          return bDate >= cutoffDate;
        });
      }
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    // Mapped to match legacy response format
    const mappedBookings = paginatedBookings.map((booking: any) =>
      mapBookingToLegacy(booking),
    );

    return sendResponse(mappedBookings, "Bookings fetched successfully", {
      page,
      limit,
      total: filteredBookings.length,
      total_pages: Math.ceil(filteredBookings.length / limit),
    });
  } catch (error) {
    return sendError("Failed to fetch bookings", 500, error);
  }
}
