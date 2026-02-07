import { NextResponse } from "next/server";
import Stripe from "stripe";
import { BookingService } from "@/backend";
import { toErrorMessage } from "@/backend/lib/errors";

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
    const { paymentIntentId, bookingId } = await request.json();

    if (!paymentIntentId || !bookingId) {
      return NextResponse.json(
        { message: "PaymentIntent ID and Booking ID are required" },
        { status: 400 },
      );
    }

    // Verify payment with Stripe
    const stripe = getStripeInstance();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      // Update booking to completed
      await BookingService.updateById(bookingId, {
        status: "completed",
        "payment.status": "paid",
        payment_status: "paid", // Legacy
      });

      return NextResponse.json({
        success: true,
        message: "Payment confirmed and booking completed",
      });
    } else {
      return NextResponse.json(
        { message: `Payment status: ${paymentIntent.status}` },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("❌ Payment confirmation error:", error);
    return NextResponse.json(
      { message: toErrorMessage(error, "Failed to confirm payment") },
      { status: 500 },
    );
  }
}
