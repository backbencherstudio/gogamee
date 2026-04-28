import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { giftCardService } from "@/backend/services/gift-card.service";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = await params;
    const giftCard = await giftCardService.getById(id);
    if (!giftCard) return sendError("Gift card not found", 404);
    return sendResponse(giftCard, "Gift card details fetched successfully");
  },
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = await params;
    const payload = await request.json();
    const updated = await giftCardService.update(id, payload);
    if (!updated) return sendError("Gift card not found", 404);
    return sendResponse(updated, "Gift card updated successfully");
  },
);

export const DELETE = withErrorHandling(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = await params;
    const deleted = await giftCardService.delete(id);
    if (!deleted) return sendError("Gift card not found", 404);
    return sendResponse(deleted, "Gift card deleted successfully");
  },
);
