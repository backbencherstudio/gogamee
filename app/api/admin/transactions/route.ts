import { NextRequest } from "next/server";
import { sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { transactionService } from "@/backend/services/transaction.service";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || undefined;
  const status = searchParams.get("status") || undefined;

  const transactions = await transactionService.list({ type, status });
  return sendResponse(transactions, "Transactions fetched successfully");
});
