import { AboutService } from "@/backend";
import { sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling(async () => {
  const content = await AboutService.getAllAboutContent();
  return sendResponse(content, "About content fetched successfully");
});
