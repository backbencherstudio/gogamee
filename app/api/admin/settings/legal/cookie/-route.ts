import { NextResponse } from "next/server";
import { updateCookiePolicy } from "../../../../../../backendgogame/actions/settings";
import { toErrorMessage } from "../../../../../../backendgogame/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const response = await updateCookiePolicy(payload);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error updating cookie policy:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update cookie policy"),
      },
      { status: 500 }
    );
  }
}

