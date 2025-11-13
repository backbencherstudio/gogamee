import { NextResponse } from "next/server";
import { getAllBookings } from "../../../../../backend/actions/bookings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const response = await getAllBookings();
  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}

