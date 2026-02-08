import { NextResponse } from "next/server";
import { BookingService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";
import { queueBookingConfirmationEmails } from "@/app/api/mail/send-booking-email";

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
  try {
    const id = await getId(context);
    const payload = await request.json();
    const { status, destinationCity, assignedMatch } = payload;

    if (!status) {
      return NextResponse.json(
        { message: "Status is required" },
        { status: 400 },
      );
    }
    if (status === "confirmed" && (!destinationCity || !assignedMatch)) {
      return NextResponse.json(
        { message: "Destination City and Assigned Match are required" },
        { status: 400 },
      );
    }
    // Update booking with new data
    const updated = await BookingService.updateStatus(
      id,
      status,
      destinationCity,
      assignedMatch,
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    // Handle Email Scheduling on Approval
    if (status === "confirmed") {
      try {
        const departureDate = new Date(updated.dates?.departure || "");
        const now = new Date();
        // 48 hours in milliseconds
        const revealTime = new Date(
          departureDate.getTime() - 48 * 60 * 60 * 1000,
        );
        const delay = revealTime.getTime() - now.getTime();

        if (delay > 0) {
          // 1. Send Immediate Confirmation (Hidden) + Admin Notification
          await queueBookingConfirmationEmails(updated, {
            showReveal: false,
          });

          // 2. Schedule Reveal Email (User Only)
          await queueBookingConfirmationEmails(updated, {
            showReveal: true,
            delay,
          });
        } else {
          // Already within 48h, send Revealed version immediately
          await queueBookingConfirmationEmails(updated, {
            showReveal: true,
          });
        }
      } catch (emailError) {
        console.error("❌ Error handling approval emails:", emailError);
        // Don't fail the request, just log
      }
    }

    return NextResponse.json(
      { success: true, message: "Booking updated successfully" },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error: unknown) {
    console.error("Update booking error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to update booking") },
      { status: 500 },
    );
  }
}
