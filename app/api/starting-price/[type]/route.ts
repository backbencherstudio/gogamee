import { NextRequest, NextResponse } from "next/server";
import { StartingPriceService } from "@/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/starting-price/[type]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const { type } = await params;

    const startingPrice = await StartingPriceService.getByType(type);

    if (!startingPrice) {
      return NextResponse.json(
        { success: false, message: "Starting price not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        type: startingPrice.type,
        features: startingPrice.features || [],
        pricesByDuration: startingPrice.pricesByDuration,
        currency: startingPrice.currency,
      },
    });
  } catch (error) {
    console.error("Error fetching starting price:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
