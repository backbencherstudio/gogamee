import { NextRequest, NextResponse } from "next/server";
import { SettingsService } from "@/backend";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("page");
  const { pages } = await SettingsService.getAllLegalPages();

  const content: any = { privacy: "", cookie: "", terms: "" };
  pages.forEach((p: any) => { if (content[p.type] !== undefined) content[p.type] = p.content; });

  if (type && content[type] !== undefined) {
    return NextResponse.json({
      success: true,
      message: "Legal page fetched",
      content: content[type]
    });
  }

  return NextResponse.json({
    success: true,
    message: "Legal pages fetched",
    content
  });
});
