import { NextResponse } from "next/server";
import { SettingsService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

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
      type: "cookie",
      title: payload.title || "Cookie Policy",
      content: {
        en: enContent,
        es: esContent,
      },
      version: payload.version,
    });

    // Manually constructed response to match legacy 'content' key structure
    return NextResponse.json({
      success: true,
      message: "Cookie policy updated successfully",
      content: {
        cookie: {
          en: legalPage.content.en,
          es: legalPage.content.es || enContent,
        },
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
