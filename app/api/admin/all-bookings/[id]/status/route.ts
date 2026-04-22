import { NextResponse } from "next/server";
import { BookingService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";
import { emailQueue } from "@/backend/lib/email-queue";
import { generateUserEmailContent } from "@/app/api/mail/send-booking-email";

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

    // Send user/client confirmation email via queue when admin confirms.
    // Admin already received their notification when payment was made (Stripe webhook).
    // NOTE: The destination reveal email is sent manually by the team.
    if (status === "confirmed") {
      const clientEmail = updated.travelers?.primaryContact?.email;

      if (!clientEmail) {
        console.error(`❌ No client email for booking ${id} — skipping email`);
      } else {
        try {
          // Send immediate booking confirmation email (destination hidden)
          const immediateContent = generateUserEmailContent(updated, {
            showReveal: false,
          });
          await emailQueue.addToQueue({
            to: clientEmail,
            subject: immediateContent.subject,
            html: immediateContent.htmlContent,
            text: immediateContent.subject,
            from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
            type: "booking",
            bookingId: id,
          });
          console.log(
            `✅ Booking confirmation email queued for client: ${clientEmail}`,
          );
        } catch (queueError) {
          console.error(
            `❌ Failed to queue confirmation email for booking ${id}:`,
            queueError,
          );
        }
      }
    }

    return NextResponse.json(
      { success: true, message: "Booking updated successfully" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error: unknown) {
    console.error("Update booking error", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to update booking") },
      { status: 500 },
    );
  }
}
