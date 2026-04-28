import { NextRequest } from "next/server";
import { sendError, sendPaginatedResponse, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { giftCardService } from "@/backend/services/gift-card.service";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const result = await giftCardService.list({
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as any) || "all",
    paymentStatus: (searchParams.get("paymentStatus") as any) || "all",
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 10),
  });
  return sendPaginatedResponse(
    result.data,
    result.total,
    result.page,
    result.limit,
    "Gift cards fetched successfully",
  );
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  if (!payload.name || !payload.code) {
    return sendError("Name and code are required", 400);
  }
  const created = await giftCardService.create(payload);
  return sendResponse(created, "Gift card created successfully", undefined, 201);
});
