import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { codeService } from "@/backend/services/code.service";

export const dynamic = "force-dynamic";

export const PATCH = withErrorHandling(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = await params;
    const payload = await request.json();

    const updated = await codeService.update(id, {
      ...payload,
      value: payload.value !== undefined ? Number(payload.value) : undefined,
      maxUses:
        payload.maxUses !== undefined ? Number(payload.maxUses) : undefined,
      initialAmount:
        payload.codeKind === "gift" && payload.value !== undefined
          ? Number(payload.value)
          : payload.initialAmount,
      remainingAmount:
        payload.codeKind === "gift" && payload.remainingAmount !== undefined
          ? Number(payload.remainingAmount)
          : payload.remainingAmount,
    });

    if (!updated) return sendError("Code not found", 404);
    return sendResponse(updated, "Code updated successfully");
  },
);

export const DELETE = withErrorHandling(
  async (_request: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = await params;
    const deleted = await codeService.delete(id);
    if (!deleted) return sendError("Code not found", 404);
    return sendResponse(deleted, "Code deleted successfully");
  },
);
