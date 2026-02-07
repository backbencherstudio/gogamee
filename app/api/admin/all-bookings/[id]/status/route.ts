import { NextResponse } from "next/server";
import { BookingService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";
import { queueBookingConfirmationEmails } from "@/app/api/mail/send-booking-email";
import { mapBookingToLegacy } from "@/backend/modules/booking/booking.mapper";

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
    const updated: any = await BookingService.updateById(id, payload);

    if (!updated) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }

    // Handle Email Scheduling on Approval
    if (updated && payload.status === "confirmed") {
      try {
        const departureDate = new Date(updated.departureDate);
        const now = new Date();
        // 48 hours in milliseconds
        const revealTime = new Date(
          departureDate.getTime() - 48 * 60 * 60 * 1000,
        );
        const delay = revealTime.getTime() - now.getTime();

        if (delay > 0) {
          const legacyBooking = mapBookingToLegacy(updated);
          // 1. Send Immediate Confirmation (Hidden) + Admin Notification
          await queueBookingConfirmationEmails(legacyBooking, {
            showReveal: false,
          });

          // 2. Schedule Reveal Email (User Only)
          await queueBookingConfirmationEmails(legacyBooking, {
            showReveal: true,
            delay,
          });
        } else {
          const legacyBooking = mapBookingToLegacy(updated);
          // Already within 48h, send Revealed version immediately
          await queueBookingConfirmationEmails(legacyBooking, {
            showReveal: true,
          });
        }
      } catch (emailError) {
        console.error("❌ Error handling approval emails:", emailError);
        // Don't fail the request, just log
      }
    }

    const mappedBooking = mapBookingToLegacy(updated);

    return NextResponse.json(mappedBooking, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error: unknown) {
    console.error("Update booking error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to update booking") },
      { status: 500 },
    );
  }
}
