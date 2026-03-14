import { NextResponse } from "next/server";
import { ComparisonFeatureService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ sport: string }>;
}

async function getSport(
  context: RouteContext,
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
    const result = await ComparisonFeatureService.getByType(sport);

    if (!result) {
      return NextResponse.json(
        {
          success: true,
          message: "No comparison features found",
          data: [],
        },
        { status: 200 }
      );
    }

    const dataObj = (result as any).toObject ? (result as any).toObject() : result;
    if (dataObj && dataObj._id) {
      dataObj.id = dataObj._id.toString();
      delete dataObj._id;
      delete dataObj.__v;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Comparison features fetched successfully",
        data: dataObj,
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
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
      },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const sport = await getSport(context);
    const payload = await request.json();
    const response = await ComparisonFeatureService.updateByType(sport, payload);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Update comparison features error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to update comparison features"),
      },
      { status: 500 },
    );
  }
}
