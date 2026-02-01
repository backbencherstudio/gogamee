import { NextResponse } from "next/server";
import { PackageService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const pkg = await PackageService.create(payload);
    return NextResponse.json(
      { success: true, package: pkg },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    console.error("Add package error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to add package"),
      },
      { status: 500 },
    );
  }
}
