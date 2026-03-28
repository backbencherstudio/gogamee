import { NextRequest } from "next/server";
import { AboutService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = await params;
  const payload = await request.json();
  const updated = await AboutService.updateSection(id, { ...payload, type: "why_choose_us" });
  if (!updated) return sendError("Item not found", 404);
  return sendResponse(updated, "Item updated successfully");
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = await params;
  const success = await AboutService.deleteSection(id);
  if (!success) return sendError("Item not found", 404);
  return sendResponse(null, "Item deleted successfully");
});
