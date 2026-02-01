import { NextRequest, NextResponse } from "next/server";
import PackageService from "@/backend/modules/package/package.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sport, included, plan, duration, excludeId } = body;

    // Validate required fields
    if (!sport || !included || !plan || duration === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields: sport, included, plan, duration",
        },
        { status: 400 },
      );
    }

    // Validate plan enum
    if (plan !== "standard" && plan !== "premium" && plan !== "combined") {
      return NextResponse.json(
        {
          success: false,
          message: "Plan must be 'standard', 'premium', or 'combined'",
        },
        { status: 400 },
      );
    }

    // Validate duration range
    if (duration < 1 || duration > 4) {
      return NextResponse.json(
        {
          success: false,
          message: "Duration must be between 1 and 4 nights",
        },
        { status: 400 },
      );
    }

    const result = await PackageService.checkDuplicate({
      sport,
      included,
      plan,
      duration,
      excludeId,
    });

    return NextResponse.json({
      success: true,
      exists: result.exists,
      existingPackage: result.existingPackage
        ? {
            id: result.existingPackage._id.toString(),
            sport: result.existingPackage.sport,
            included: result.existingPackage.included,
            plan: result.existingPackage.plan,
            duration: result.existingPackage.duration,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Error checking package duplicate:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to check for duplicate packages",
      },
      { status: 500 },
    );
  }
}
