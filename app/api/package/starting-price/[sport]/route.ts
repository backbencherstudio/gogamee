import { NextResponse } from "next/server";
import {
  getStartingPrice,
  updateStartingPrice,
} from "../../../../../backendgogame/actions/packages";
import { toErrorMessage } from "../../../../../backendgogame/lib/errors";

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
    const response = await getStartingPrice(sport);
    return NextResponse.json(response, {
      headers: { "Cache-Control": "no-store" },
    });
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
    const response = await updateStartingPrice(sport, payload);
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

