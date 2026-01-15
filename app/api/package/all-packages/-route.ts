import { NextResponse } from "next/server";
import { getAllPackages } from "../../../../backendgogame/actions/packages";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") ?? undefined;
  const response = await getAllPackages(sport);
  return NextResponse.json(response, {
    headers: { "Cache-Control": "no-store" },
  });
}
