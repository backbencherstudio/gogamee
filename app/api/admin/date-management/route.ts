import { NextResponse } from "next/server";
import {
  getAllDates,
  createDate,
} from "../../../../backend/actions/dateManagement";
import { toErrorMessage } from "../../../../backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const dates = await getAllDates();
  return NextResponse.json(dates, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const created = await createDate(payload);
    return NextResponse.json(created, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Create date error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to create date") },
      { status: 500 }
    );
  }
}

