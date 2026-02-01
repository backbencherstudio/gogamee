import { NextResponse } from "next/server";
import { SettingsService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    const content = payload.content || payload.en || payload.es || "";

    const legalPage = await SettingsService.createOrUpdateLegalPage({
      type: "cookie",
      title: payload.title || "Cookie Policy",
      content: content,
      version: payload.version,
    });

    return NextResponse.json({
      success: true,
      message: "Cookie policy updated successfully",
      content: {
        cookie: legalPage.content,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update cookie policy"),
      },
      { status: 500 },
    );
  }
}
