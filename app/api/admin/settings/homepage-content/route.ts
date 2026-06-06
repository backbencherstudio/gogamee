import { NextRequest, NextResponse } from "next/server";
import { SettingsService, updateHomepageContentSchema } from "@/backend";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling(async () => {
  const content = await SettingsService.getHomepageContent();

  return NextResponse.json({
    success: true,
    message: "Homepage content fetched",
    content,
  });
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const validated = updateHomepageContentSchema.parse(payload);
  const content = await SettingsService.updateHomepageContent(validated);

  return NextResponse.json({
    success: true,
    message: "Homepage content updated",
    content,
  });
});
