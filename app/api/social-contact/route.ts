import { NextResponse } from "next/server";
import { SettingsService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const links = await SettingsService.getActiveSocialContacts();

    // links is an array of ISocialContact, we need the first active one or just the first one
    const socialContactDoc = Array.isArray(links) ? links[0] : links;

    if (!socialContactDoc) {
      return NextResponse.json(
        { success: false, message: "Social contact links not found" },
        { status: 404 }
      );
    }

    // Check if it's a mongoose doc or plain object
    const data = (socialContactDoc as any).toObject
      ? (socialContactDoc as any).toObject()
      : socialContactDoc;

    return NextResponse.json({
      success: true,
      links: {
        whatsapp: data.whatsapp || "",
        instagram: data.instagram || "",
        tiktok: data.tiktok || "",
        linkedin: data.linkedin || "",
        email: data.email || "",
      },
    });
  } catch (error) {
    console.error("Error fetching social contact links:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to fetch social contact links"),
      },
      { status: 500 }
    );
  }
}
