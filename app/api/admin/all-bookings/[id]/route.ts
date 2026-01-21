import { NextResponse } from "next/server";
import { BookingService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getId(context: RouteContext) {
  const { id } = await context.params;
  return id;
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const id = await getId(context);
    const booking = await BookingService.getById(id);

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: booking });
  } catch (error) {
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to fetch booking") },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const id = await getId(context);
    const deleted = await BookingService.deleteById(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "Booking not found or already deleted" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Delete booking error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to delete booking") },
      { status: 500 },
    );
  }
}
