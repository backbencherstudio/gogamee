import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { promoCodeService } from "@/backend/services/promo-code.service";

export const dynamic = "force-dynamic";

export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = await params;
    const payload = await request.json();
    const updated = await promoCodeService.update(id, payload);
    if (!updated) return sendError("Promo code not found", 404);
    return sendResponse(updated, "Promo code updated successfully");
  },
);

export const DELETE = withErrorHandling(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = await params;
    const deleted = await promoCodeService.delete(id);
    if (!deleted) return sendError("Promo code not found", 404);
    return sendResponse(deleted, "Promo code deleted successfully");
  },
);
