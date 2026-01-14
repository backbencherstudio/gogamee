import { NextResponse } from "next/server";
import { SettingsService, jsonError } from "@/_backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    const legalPage = await SettingsService.createOrUpdateLegalPage({
      type: "terms",
      title: payload.title || "Terms and Conditions",
      content: payload.content?.en || payload.en || "",
      version: payload.version,
    });

    // Manually constructed response to match legacy 'content' key structure
    return NextResponse.json({
      success: true,
      message: "Terms and conditions updated successfully",
      content: {
        terms: {
          en: legalPage.content,
          es: legalPage.content,
        },
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to update terms and conditions", 500);
  }
}
