import { NextRequest } from "next/server";
import { TestimonialService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const stats = await TestimonialService.getRatingStats();

    return sendResponse(stats, "Testimonial stats fetched successfully");
  } catch (error) {
    console.error("GET Stats Error:", error);
    return sendError("Failed to fetch testimonial stats", 500, error);
  }
}
