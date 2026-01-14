import { NextResponse } from "next/server";
import { SettingsService, jsonSuccess, jsonError } from "@/_backend";

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
        content[page.type].en = page.content;
      }
    });

    return jsonSuccess(content, "Legal pages fetched successfully");
  } catch (error) {
    console.error("API Error:", error);
    return jsonError("Failed to fetch legal pages", 500);
  }
}
