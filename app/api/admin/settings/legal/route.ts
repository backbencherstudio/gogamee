import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "@/backend";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling(async () => {
  const { pages } = await SettingsService.getAllLegalPages();
  const content: any = { privacy: "", cookie: "", terms: "" };
  pages.forEach((p: any) => { if (content[p.type] !== undefined) content[p.type] = p.content; });
  return NextResponse.json({
    success: true,
    message: "Legal pages fetched",
    content
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const page = await SettingsService.createOrUpdateLegalPage(payload);
  return NextResponse.json({
    success: true,
    message: "Legal page updated",
    data: page
  });
});
