import { NextRequest } from "next/server";
import { AboutService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { title } = await request.json();
  if (!title) return sendError("Title is required", 400);

  const headline = await AboutService.updateHeadline(title);
  return sendResponse(headline, "Headline updated successfully");
});
