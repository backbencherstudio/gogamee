import { NextResponse } from "next/server";
import { BookingService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const stats = await BookingService.getStats();
    return sendResponse(stats, "Booking stats fetched successfully");
  } catch (error) {
    return sendError("Failed to fetch booking stats", 500, error);
  }
}
