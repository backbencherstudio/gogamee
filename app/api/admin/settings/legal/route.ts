import { NextResponse } from "next/server";
import { SettingsService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { pages: legalPages } = await SettingsService.getAllLegalPages();

    const content = {
      privacy: { en: "", es: "" },
      cookie: { en: "", es: "" },
      terms: { en: "", es: "" },
    };

    legalPages.forEach((page) => {
      if (
        page.type === "privacy" ||
        page.type === "cookie" ||
        page.type === "terms"
      ) {
        content[page.type].en = page.content.en;
        content[page.type].es = page.content.es || "";
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Legal pages fetched successfully",
        content: content,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch legal pages",
      },
      { status: 500 },
    );
  }
}
