import { NextResponse } from "next/server";
import { SettingsService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(request: Request) {
  try {
    const payload = await request.json();

    const content = payload.content || payload.en || payload.es || "";

    const legalPage = await SettingsService.createOrUpdateLegalPage({
      type: "terms",
      title: payload.title || "Terms and Conditions",
      content: content,
      version: payload.version,
    });

    return NextResponse.json({
      success: true,
      message: "Terms and conditions updated successfully",
      content: {
        terms: legalPage.content,
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update terms and conditions",
      },
      { status: 500 },
    );
  }
}
