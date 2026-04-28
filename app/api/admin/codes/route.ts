import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { codeService } from "@/backend/services/code.service";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const codes = await codeService.list();
  return sendResponse(codes, "Codes fetched successfully");
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();

  if (!payload.name || !payload.code || !payload.discountType) {
    return sendError("Name, code and discount type are required", 400);
  }

  const code = await codeService.create({
    name: payload.name,
    code: payload.code,
    codeKind: payload.codeKind || "discount",
    discountType: payload.discountType,
    value: Number(payload.value || 0),
    usageLimit: payload.usageLimit || "single",
    maxUses:
      payload.usageLimit === "multiple" ? Number(payload.maxUses || 1) : undefined,
    isActive: payload.isActive !== false,
    expiresAt: payload.expiresAt || undefined,
    paymentStatus: payload.codeKind === "gift" ? "paid" : "none",
    initialAmount: payload.codeKind === "gift" ? Number(payload.value || 0) : undefined,
    remainingAmount: payload.codeKind === "gift" ? Number(payload.value || 0) : undefined,
  });

  return sendResponse(code, "Code created successfully", undefined, 201);
});
