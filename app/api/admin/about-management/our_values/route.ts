import { NextResponse } from "next/server";
import { addOurValue } from "../../../../../backend/actions/about";
import { toErrorMessage } from "../../../../../backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const response = await addOurValue(payload);
    return NextResponse.json(response, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Add value error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to add value"),
      },
      { status: 500 }
    );
  }
}

