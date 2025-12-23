import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { updateBooking } from "../../../../backend/actions/bookings";

function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

// GET handler for testing/verification (optional)
export async function GET() {
  return NextResponse.json({
    message: "Stripe webhook endpoint is active",
    endpoint: "/api/webhooks/stripe",
    method: "POST",
    note: "This endpoint only accepts POST requests from Stripe",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("❌ No Stripe signature found");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      const stripe = getStripeInstance();
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    console.log("✅ Webhook event received:", event.type);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("💳 Payment successful for session:", session.id);
      console.log("📋 Booking ID from metadata:", session.metadata?.booking_id);

      const bookingId = session.metadata?.booking_id;

      if (!bookingId) {
        console.error("❌ No booking_id in session metadata");
        return NextResponse.json(
          { error: "No booking_id found in session metadata" },
          { status: 400 }
        );
      }

      // Update booking status to "paid" and "completed"
      try {
        const updatedBooking = await updateBooking({
          id: bookingId,
          status: "completed",
          payment_status: "paid",
        });

        console.log("✅ Booking updated:", bookingId);

        // Send confirmation email
        try {
          const emailResponse = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mail/booking-confirmation`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                booking: updatedBooking,
              }),
            }
          );

          if (emailResponse.ok) {
            console.log("✅ Confirmation email sent to:", updatedBooking.email);
          } else {
            console.error(
              "❌ Failed to send confirmation email:",
              await emailResponse.text()
            );
          }
        } catch (emailError) {
          console.error("❌ Error sending confirmation email:", emailError);
          // Don't fail the webhook if email fails
        }

        return NextResponse.json({
          received: true,
          bookingId,
          status: "updated",
        });
      } catch (updateError) {
        console.error("❌ Error updating booking:", updateError);
        return NextResponse.json(
          {
            error: "Failed to update booking",
            details: updateError instanceof Error ? updateError.message : "Unknown error",
          },
          { status: 500 }
        );
      }
    }

    // Handle other event types if needed
    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        await updateBooking({
          id: bookingId,
          payment_status: "paid",
        });
        console.log("✅ Async payment succeeded for booking:", bookingId);
      }
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        await updateBooking({
          id: bookingId,
          payment_status: "failed",
        });
        console.log("❌ Async payment failed for booking:", bookingId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      {
        error: "Webhook handler failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

