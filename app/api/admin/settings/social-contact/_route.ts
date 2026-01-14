import { NextResponse } from "next/server";
import { SettingsService, jsonSuccess, jsonError } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const contacts = await SettingsService.getActiveSocialContacts();

    return jsonSuccess(
      {
        links: contacts.reduce((acc, contact) => {
          acc[contact.platform.toLowerCase()] = contact.url;
          return acc;
        }, {} as Record<string, string>),
      },
      "Social contacts fetched successfully"
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to fetch social contacts", 500);
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    // Update or create social contacts based on platform
    const updatePromises = Object.entries(payload.links || {}).map(
      async ([platform, url]) => {
        // For simplicity, this would need to be enhanced to handle updates properly
        // This is a basic example
        return await SettingsService.createSocialContact({
          platform,
          url: url as string,
        });
      }
    );

    await Promise.all(updatePromises);

    return jsonSuccess(
      { links: payload.links },
      "Social contacts updated successfully"
    );
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to update social contacts", 500);
  }
}
