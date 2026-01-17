import { NextResponse } from "next/server";
import Stripe from "stripe";
import { BookingService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

export async function POST(request: Request) {
  try {
    const { bookingId, sessionId } = await request.json();

    if (!bookingId || !sessionId) {
      return NextResponse.json(
        { message: "Booking ID and Session ID are required" },
        { status: 400 }
      );
    }

    // check if already paid
    const currentBooking = await BookingService.getById(bookingId);
    if (currentBooking?.payment_status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Booking already paid",
      });
    }

    const stripe = getStripeInstance();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Verify metadata matches (security check)
      if (session.metadata?.booking_id !== bookingId) {
        return NextResponse.json(
          { message: "Session metadata mismatch" },
          { status: 400 }
        );
      }

      // Update booking
      await BookingService.updateById(bookingId, {
        status: "completed",
        payment_status: "paid",
        stripe_payment_intent_id:
          (session.payment_intent as string) || session.id,
      });

      return NextResponse.json({
        success: true,
        message: "Booking verified and updated",
      });
    } else {
      return NextResponse.json(
        { message: "Payment not completed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to verify payment") },
      { status: 500 }
    );
  }
}
