import { NextResponse } from "next/server";
import { SettingsService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const links = await SettingsService.getActiveSocialContacts();

    if (!links) {
      return NextResponse.json(
        { success: false, message: "Social contact links not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      links: links,
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
