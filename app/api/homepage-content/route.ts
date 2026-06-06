import { NextResponse } from "next/server";
import { SettingsService } from "@/backend";
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
