import { NextResponse } from "next/server";
import {
  getSocialContactLinks,
  updateSocialContactLinks,
} from "../../../../../backendgogame/actions/settings";
import { toErrorMessage } from "../../../../../backendgogame/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const response = await getSocialContactLinks();
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error fetching social contact links:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to fetch social contact links"),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const response = await updateSocialContactLinks(payload);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error updating social contact links:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update social contact links"),
      },
      { status: 500 }
    );
  }
}

