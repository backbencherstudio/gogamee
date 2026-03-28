import { NextRequest } from "next/server";
import { FAQService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = await params;
  const payload = await request.json();
  const updated = await FAQService.updateById(id, payload);
  if (!updated) return sendError("FAQ not found", 404);
  return sendResponse(updated, "FAQ updated successfully");
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = await params;
  const success = await FAQService.deleteById(id);
  if (!success) return sendError("FAQ not found", 404);
  return sendResponse(null, "FAQ deleted successfully");
});
