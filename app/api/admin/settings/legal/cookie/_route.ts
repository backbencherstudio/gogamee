import { NextResponse } from "next/server";
import { SettingsService, jsonError } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    const legalPage = await SettingsService.createOrUpdateLegalPage({
      type: "cookie",
      title: payload.title || "Cookie Policy",
      content: payload.content?.en || payload.en || "",
      version: payload.version,
    });

    // Manually constructed response to match legacy 'content' key structure
    return NextResponse.json({
      success: true,
      message: "Cookie policy updated successfully",
      content: {
        cookie: {
          en: legalPage.content,
          es: legalPage.content,
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to update cookie policy", 500);
  }
}
