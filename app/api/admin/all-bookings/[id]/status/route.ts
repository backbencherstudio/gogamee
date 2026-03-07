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
    if (status === "confirmed" && (!destinationCity || !assignedMatch)) {
      return NextResponse.json(
        { message: "Destination City and Assigned Match are required" },
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

    // Send user/client confirmation emails via queue when admin confirms.
    // Admin already received their notification when payment was made (Stripe webhook).
    if (status === "confirmed") {
      const clientEmail = updated.travelers?.primaryContact?.email;

      if (!clientEmail) {
        console.error(`❌ No client email for booking ${id} — skipping email`);
      } else {
        const departureDate = new Date(updated.dates?.departure || "");
        const now = new Date();
        const revealTime = new Date(
          departureDate.getTime() - 48 * 60 * 60 * 1000,
        );
        const isWithin48Hours = revealTime.getTime() <= now.getTime();
        const delayMs = isWithin48Hours
          ? 0
          : revealTime.getTime() - now.getTime();

        try {
          if (!isWithin48Hours) {
            // 1. Immediate hidden confirmation email
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
              `✅ Immediate confirmation email queued for client: ${clientEmail}`,
            );

            // 2. Delayed reveal email (48h before departure)
            const revealContent = generateUserEmailContent(updated, {
              showReveal: true,
            });
            await emailQueue.addToQueue(
              {
                to: clientEmail,
                subject: revealContent.subject,
                html: revealContent.htmlContent,
                text: revealContent.subject,
                from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
                type: "booking",
                bookingId: id,
                requiresStatusCheck: true,
              },
              { delay: delayMs },
            );
            console.log(
              `✅ Reveal email scheduled for ${Math.round(delayMs / 1000 / 60 / 60)}h from now`,
            );
          } else {
            // Departure within 48h — send revealed version immediately
            const revealContent = generateUserEmailContent(updated, {
              showReveal: true,
            });
            await emailQueue.addToQueue({
              to: clientEmail,
              subject: revealContent.subject,
              html: revealContent.htmlContent,
              text: revealContent.subject,
              from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
              type: "booking",
              bookingId: id,
            });
            console.log(
              `✅ Reveal email queued immediately (within 48h window) for: ${clientEmail}`,
            );
          }
        } catch (queueError) {
          console.error(
            `❌ Failed to queue email for booking ${id}:`,
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
