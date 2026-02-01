import { NextResponse } from "next/server";
import { SettingsService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

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
      privacy: "",
      cookie: "",
      terms: "",
    };

    pages.forEach((p) => {
      if (["privacy", "cookie", "terms"].includes(p.type)) {
        const key = p.type as "privacy" | "cookie" | "terms";
        content[key] = p.content;
      }
    });

    if (page && ["privacy", "cookie", "terms"].includes(page)) {
      const key = page as "privacy" | "cookie" | "terms";
      return NextResponse.json({
        success: true,
        content: content[key] || "",
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
      { status: 500 },
    );
  }
}
