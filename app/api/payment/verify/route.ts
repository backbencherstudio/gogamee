import { NextResponse } from "next/server";
import { BookingService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { message: "Session ID is required" },
        { status: 400 },
      );
    }

    // Polling Logic: Check DB if webhook has updated the booking with this PaymentIntent ID
    // We assume Webhook has already processed or is processing the payment
    const booking = await BookingService.findByPaymentIntentId(sessionId);

    if (booking) {
      if (
        booking.status === "completed" ||
        booking.payment_status === "paid" ||
        booking.status === "confirmed"
      ) {
        console.log(
          `✅ Verified payment for Booking #${booking._id} via DB lookup`,
        );
        return NextResponse.json({
          success: true,
          message: "Payment verified successfully",
          bookingId: booking._id,
        });
      } else {
        // Booking found but status not paid (Webhook might be slow or payment failed)
        // Frontend should retry polling
        return NextResponse.json(
          { message: "Payment pending or processing" },
          { status: 202 }, // 202 Accepted (Processing)
        );
      }
    } else {
      // No booking found with this PaymentIntent ID yet (Webhook hasn't arrived)
      // Frontend should retry polling
      console.log(
        `⏳ PaymentIntent ${sessionId} not found in DB yet (Waiting for Webhook)`,
      );
      return NextResponse.json(
        { message: "Payment processing (Webhook pending)" },
        { status: 404 }, // Not found YET
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to verify payment") },
      { status: 500 },
    );
  }
}
