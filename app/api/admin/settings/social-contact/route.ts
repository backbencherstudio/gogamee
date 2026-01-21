import { NextResponse } from "next/server";
import { SettingsService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const contacts = await SettingsService.getActiveSocialContacts();

    return NextResponse.json({
      success: true,
      message: "Social contacts fetched successfully",

      links: contacts.reduce(
        (acc, contact) => {
          acc[contact.platform.toLowerCase()] = contact.url;
          return acc;
        },
        {} as Record<string, string>,
      ),
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to fetch social contacts"),
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    // User specified that payload contains links directly
    const links = payload;

    // Update or create social contacts based on platform
    const updatePromises = Object.entries(links).map(
      async ([platform, url]) => {
        return await SettingsService.upsertSocialContact({
          platform,
          url: url as string,
          isActive: true, // Ensure it's active when updated from here
        });
      },
    );

    await Promise.all(updatePromises);

    return NextResponse.json(
      {
        success: true,
        message: "Social media and contact links updated successfully",
        links: links,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update social contacts"),
      },
      { status: 500 },
    );
  }
}
