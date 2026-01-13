import { NextResponse } from "next/server";
import { getLegalPages } from "../../../backendgogame/actions/settings";
import { toErrorMessage } from "../../../backendgogame/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page"); // privacy, cookie, or terms
    const lang = searchParams.get("lang") || "es"; // es (default) or en

    const response = await getLegalPages();

    if (!response.success || !response.content) {
      return NextResponse.json(
        { success: false, message: "Legal pages not found" },
        { status: 404 }
      );
    }

    // If specific page requested, return that page's content
    if (page && ["privacy", "cookie", "terms"].includes(page)) {
      const content = response.content[page as "privacy" | "cookie" | "terms"];
      return NextResponse.json({
        success: true,
        content: content[lang as "en" | "es"] || content.es || content.en || "",
      });
    }

    // Return all pages
    return NextResponse.json({
      success: true,
      content: response.content,
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

