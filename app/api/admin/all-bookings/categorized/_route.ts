import { NextResponse } from "next/server";
import { BookingService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { bookings } = await BookingService.getAll({
      limit: 1000, // Admin view
    });

    // Mapped to match legacy response format: { all: Booking[] }
    return NextResponse.json(
      {
        all: bookings,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to fetch bookings") },
      { status: 500 }
    );
  }
}
