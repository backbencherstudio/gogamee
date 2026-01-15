import { NextResponse } from "next/server";
import { StartingPriceService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ sport: string }>;
}

async function getSport(
  context: RouteContext
): Promise<"football" | "basketball" | "combined"> {
  const { sport } = await context.params;
  if (sport === "football" || sport === "basketball" || sport === "combined") {
    return sport;
  }
  throw new Error(`Unsupported sport: ${sport}`);
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const sport = await getSport(context);
    const price = await StartingPriceService.getByType(sport);

    if (!price) {
      return NextResponse.json(
        {
          success: false,
          message: "Starting price not found",
        },
        { status: 404 }
      );
    }

    const dataObj = (price as any).toObject ? (price as any).toObject() : price;
    if (dataObj && dataObj._id) {
      dataObj.id = dataObj._id.toString();
      delete dataObj._id;
      delete dataObj.__v;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Starting price fetched successfully",
        data: [dataObj],
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Invalid sport"),
      },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const sport = await getSport(context);
    const payload = await request.json();
    const response = await StartingPriceService.updateByType(sport, payload);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Update starting price error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update starting price"),
      },
      { status: 500 }
    );
  }
}
