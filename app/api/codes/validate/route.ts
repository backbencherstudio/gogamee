import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { codeService } from "@/backend/services/code.service";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const code = String(payload.code || "");
  const orderTotal = Number(payload.orderTotal || 0);

  const result = await codeService.validate(code, orderTotal);
  if (!result.valid) {
    return sendError(result.message, 400);
  }

  return sendResponse(
    {
      id: result.code._id?.toString() || result.code.id,
      code: result.code.code,
      name: result.code.name,
      codeKind: result.code.codeKind,
      discountType: result.code.discountType,
      value: result.code.value,
      discountAmount: result.discountAmount,
      finalTotal: result.finalTotal,
      remainingAmount: result.code.remainingAmount,
    },
    result.message,
  );
});
