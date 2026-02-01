import { NextRequest, NextResponse } from "next/server";
import { StartingPriceService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// PUT /api/starting-price/[type]/features
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const { type } = await params;
    const body = await request.json();
    const { features } = body;

    if (!Array.isArray(features)) {
      return NextResponse.json(
        { success: false, message: "Features must be an array" },
        { status: 400 },
      );
    }

    // Prepare features data
    const formattedFeatures = features.map((f, index) => ({
      category: f.category || "",
      category_es: f.category_es || f.category || "",
      standard: f.standard || "",
      standard_es: f.standard_es || f.standard || "",
      premium: f.premium || "",
      premium_es: f.premium_es || f.premium || "",
      sortOrder: f.sortOrder ?? index,
    }));

    // Update using service
    const updated = await StartingPriceService.updateByType(type, {
      features: formattedFeatures,
      lastModifiedBy: "admin",
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Starting price not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Features updated successfully",
      data: {
        type: updated.type,
        features: updated.features,
      },
    });
  } catch (error) {
    console.error("Error updating features:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
