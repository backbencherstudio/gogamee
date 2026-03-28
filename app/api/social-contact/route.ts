import { NextResponse } from "next/server";
import { SettingsService } from "@/backend";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling(async () => {
  const { contacts } = await SettingsService.getAllSocialContacts({
    filters: { isActive: true }
  });
  const map: any = { whatsapp: "", instagram: "", tiktok: "", linkedin: "", email: "" };
  contacts.forEach((c: any) => { 
    const p = c.platform.toLowerCase(); 
    if (map[p] !== undefined) map[p] = c.url; 
  });
  return NextResponse.json({
    success: true,
    message: "Social links fetched",
    links: map
  });
});
