import { NextRequest } from "next/server";
import { sendError, sendPaginatedResponse, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { promoCodeService } from "@/backend/services/promo-code.service";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams;
  const result = await promoCodeService.list({
    search: searchParams.get("search") || undefined,
    status: (searchParams.get("status") as any) || "all",
    discountType: (searchParams.get("discountType") as any) || "all",
    usageLimit: (searchParams.get("usageLimit") as any) || "all",
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
    "Promo codes fetched successfully",
  );
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  if (!payload.name || !payload.code || !payload.discountType) {
    return sendError("Name, code and discount type are required", 400);
  }
  const created = await promoCodeService.create(payload);
  return sendResponse(created, "Promo code created successfully", undefined, 201);
});
