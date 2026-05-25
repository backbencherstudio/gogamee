import { NextRequest, NextResponse } from "next/server";
import SettingsService from "@/backend/modules/settings/settings.service";

export async function GET() {
  try {
    const settings = await SettingsService.getComingSoonSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("[ComingSoon GET] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updates: any = {};

    if (body.isEnabled !== undefined) updates.isEnabled = body.isEnabled;
    if (body.launchDate !== undefined) {
      updates.launchDate = body.launchDate ? new Date(body.launchDate) : null;
    }
    if (body.headline !== undefined) updates.headline = body.headline;
    if (body.subtext !== undefined) updates.subtext = body.subtext;
    if (body.privacyNote !== undefined) {
      updates.privacyNote = body.privacyNote;
    }

    const updated = await SettingsService.updateComingSoonSettings(updates);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("[ComingSoon PUT] Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 },
    );
  }
}
