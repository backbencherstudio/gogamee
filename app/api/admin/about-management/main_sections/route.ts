import { NextResponse } from "next/server";
import {
  getAboutManagement,
  addMainSection,
} from "../../../../../backend/actions/about";
import { toErrorMessage } from "../../../../../backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const response = await getAboutManagement();
  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const response = await addMainSection(payload);
    return NextResponse.json(response, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Add section error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to add section"),
      },
      { status: 500 }
    );
  }
}

