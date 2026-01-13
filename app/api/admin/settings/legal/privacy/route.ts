import { NextResponse } from "next/server";
import { updatePrivacyPolicy } from "../../../../../../backendgogame/actions/settings";
import { toErrorMessage } from "../../../../../../backendgogame/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const response = await updatePrivacyPolicy(payload);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Error updating privacy policy:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update privacy policy"),
      },
      { status: 500 }
    );
  }
}

