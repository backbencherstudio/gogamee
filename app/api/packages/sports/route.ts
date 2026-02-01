import { NextResponse } from "next/server";
import { PackageService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const sports = await PackageService.getAvailableSports();
    return NextResponse.json(
      {
        success: true,
        message: "Sports fetched successfully",
        data: sports,
        count: sports.length,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to fetch sports"),
      },
      { status: 500 },
    );
  }
}
