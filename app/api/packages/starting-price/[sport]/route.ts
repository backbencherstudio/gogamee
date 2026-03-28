import { NextRequest } from "next/server";
import { StartingPriceService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: NextRequest, { params }: { params: { sport: string } }) => {
  const { sport } = await params;
  const prices = await StartingPriceService.getAll();
  const price = prices.find((p: any) => p.type.toLowerCase() === sport.toLowerCase());
  
  // Frontend expects data to be an array or handle null gracefully
  return sendResponse(price ? [price] : [], "Starting price fetched");
});

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: { params: { sport: string } }) => {
  const { sport } = await params;
  const payload = await request.json();
  
  if (!payload.pricesByDuration) {
    return sendError("Invalid payload: pricesByDuration is required", 400);
  }

  const updated = await StartingPriceService.updateByType(sport, payload);
  return sendResponse(updated, "Starting price updated successfully");
});
