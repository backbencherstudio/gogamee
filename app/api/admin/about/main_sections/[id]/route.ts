import { NextRequest } from "next/server";
import { AboutService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";

export const PATCH = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = await params;
  const payload = await request.json();
  const updated = await AboutService.updateSection(id, { ...payload, type: "main_section" });
  if (!updated) return sendError("Main section not found", 404);
  return sendResponse(updated, "Main section updated successfully");
});

export const DELETE = withErrorHandling(async (request: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = await params;
  const success = await AboutService.deleteSection(id);
  if (!success) return sendError("Main section not found", 404);
  return sendResponse(null, "Main section deleted successfully");
});
