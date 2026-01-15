import { NextResponse } from "next/server";
import { SettingsService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page"); // privacy, cookie, or terms
    const lang = searchParams.get("lang") || "es"; // es (default) or en

    const { pages } = await SettingsService.getAllLegalPages();

    // Map legal pages to expected content structure
    const content = {
      privacy: { en: "", es: "" },
      cookie: { en: "", es: "" },
      terms: { en: "", es: "" },
    };

    pages.forEach((p) => {
      // Assuming types match "privacy", "cookie", "terms".
      // If content is just a string, we might need to adjust based on schema.
      // Looking at previous GET /admin/settings/legal/_route.ts, it seemed content was a string.
      // But multi-language support implies content structure or multiple entries.
      // Let's assume for now the content is what we have.
      // Actually, looking at SettingsService.getAllLegalPages return type:
      // pages: ILegalPage[]
      // ILegalPage usually has type and content.

      // Let's replicate logic from admin/settings/legal/_route.ts but adapted for public API
      if (["privacy", "cookie", "terms"].includes(p.type)) {
        const key = p.type as "privacy" | "cookie" | "terms";
        content[key].es = p.content.es || "";
        content[key].en = p.content.en;
      }
    });

    if (page && ["privacy", "cookie", "terms"].includes(page)) {
      const key = page as "privacy" | "cookie" | "terms";
      const pageContent = content[key];
      // Return specific language content
      return NextResponse.json({
        success: true,
        content:
          pageContent[lang as "en" | "es"] ||
          pageContent.es ||
          pageContent.en ||
          "",
      });
    }

    // Return all pages
    return NextResponse.json({
      success: true,
      content: content,
    });
  } catch (error) {
    console.error("Error fetching legal pages:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to fetch legal pages"),
      },
      { status: 500 }
    );
  }
}
