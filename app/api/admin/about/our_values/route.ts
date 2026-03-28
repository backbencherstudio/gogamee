import { NextRequest } from "next/server";
import { AboutService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  if (!payload.title) return sendError("Title is required", 400);

  const section = await AboutService.addSection({ ...payload, type: "our_value" });
  return sendResponse(section, "Value added successfully", undefined, 201);
});
