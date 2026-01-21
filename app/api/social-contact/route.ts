import { NextResponse } from "next/server";
import { SettingsService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const links = await SettingsService.getActiveSocialContacts();

    // Create a map of platform -> url
    const socialLinksMap: Record<string, string> = {};

    if (Array.isArray(links)) {
      links.forEach((link: any) => {
        // Normalize platform name to lowercase for consistent access
        const platform = link.platform?.toLowerCase().trim();
        if (platform && link.url) {
          socialLinksMap[platform] = link.url;
        }
      });
    }

    return NextResponse.json({
      success: true,
      links: {
        whatsapp: socialLinksMap.whatsapp || "",
        instagram: socialLinksMap.instagram || "",
        tiktok: socialLinksMap.tiktok || "",
        linkedin: socialLinksMap.linkedin || "",
        email: socialLinksMap.email || "",
      },
    });
  } catch (error) {
    console.error("Error fetching social contact links:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to fetch social contact links"),
      },
      { status: 500 },
    );
  }
}
