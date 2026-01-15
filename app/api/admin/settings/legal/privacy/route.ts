import { NextResponse } from "next/server";
import { SettingsService } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    // Construct content object supporting en and es
    const enContent =
      payload.en ||
      payload.content?.en ||
      (typeof payload.content === "string" ? payload.content : " ");
    const esContent = payload.es || payload.content?.es || "";

    const legalPage = await SettingsService.createOrUpdateLegalPage({
      type: "privacy",
      title: payload.title || "Privacy Policy",
      content: {
        en: enContent,
        es: esContent,
      },
      version: payload.version,
    });

    // Manually constructed response to match legacy 'content' key structure
    return NextResponse.json({
      success: true,
      message: "Privacy policy updated successfully",
      content: {
        privacy: {
          en: legalPage.content.en,
          es: legalPage.content.es || enContent, // Fallback to en if es missing for display/legacy check
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update privacy policy",
      },
      { status: 500 }
    );
  }
}
