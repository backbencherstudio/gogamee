import { NextResponse } from "next/server";
import { updateBooking } from "../../../../../../backend/actions/bookings";
import { toErrorMessage } from "../../../../../../backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getId(context: RouteContext) {
  const { id } = await context.params;
  return id;
}

export async function PATCH(request: Request, context: RouteContext) {
  const payload = await request.json();
  try {
    const id = await getId(context);
    const updated = await updateBooking({ id, ...payload });
    return NextResponse.json(updated, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Update booking error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to update booking") },
      { status: 500 }
    );
  }
}

