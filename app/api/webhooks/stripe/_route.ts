import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { BookingService } from "@/_backend";

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

// Validate webhook secret
if (
  !webhookSecret ||
  webhookSecret === "whsec_YOUR_WEBHOOK_SECRET_HERE" ||
  webhookSecret.includes("YOUR_WEBHOOK")
) {
  console.error(
    "❌ CRITICAL: STRIPE_WEBHOOK_SECRET is not set or is a placeholder!"
  );
  console.error(
    "❌ Please set the actual webhook secret from Stripe Dashboard in Vercel environment variables"
  );
}

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
    console.log("📥 Webhook received at:", new Date().toISOString());
    console.log("🔑 Webhook secret configured:", webhookSecret ? "YES" : "NO");
    console.log("🔑 Webhook secret length:", webhookSecret.length);
    console.log(
      "🔑 Webhook secret starts with whsec_:",
      webhookSecret.startsWith("whsec_")
    );

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    console.log("📝 Signature header present:", signature ? "YES" : "NO");
    console.log("📝 Body length:", body.length);

    if (!signature) {
      console.error("❌ No Stripe signature found");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 }
      );
    }

    if (!webhookSecret || webhookSecret.length < 20) {
      console.error("❌ Webhook secret is invalid or too short");
      return NextResponse.json(
        {
          error: "Webhook secret not configured properly",
          details: "STRIPE_WEBHOOK_SECRET must be set in environment variables",
        },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      const stripe = getStripeInstance();
      console.log("🔍 Attempting to verify webhook signature...");
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("✅ Webhook signature verified successfully");
    } catch (err) {
      console.error("❌ Webhook signature verification failed");
      console.error(
        "❌ Error details:",
        err instanceof Error ? err.message : String(err)
      );
      console.error(
        "❌ Expected secret (first 10 chars):",
        webhookSecret.substring(0, 10) + "..."
      );
      return NextResponse.json(
        {
          error: "Webhook signature verification failed",
          details: err instanceof Error ? err.message : "Unknown error",
          hint: "Check if STRIPE_WEBHOOK_SECRET in Vercel matches the webhook secret in Stripe Dashboard",
        },
        { status: 400 }
      );
    }

    console.log("✅ Webhook event received:", event.type);
    console.log("📋 Event ID:", event.id);

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
        const updatedBooking = await BookingService.updateById(bookingId, {
          status: "completed",
          payment_status: "paid",
        });

        if (!updatedBooking) {
          throw new Error(`Booking not found with ID: ${bookingId}`);
        }

        console.log("✅ Booking updated:", bookingId);

        // Send confirmation email - use direct function call for reliability
        try {
          console.log(
            "📧 Sending confirmation email to:",
            updatedBooking.email
          );

          // Import and call email function directly (works for both localhost and Vercel)
          const { sendBookingConfirmationEmail } = await import(
            "../../mail/send-booking-email"
          );

          const bookingData: any = updatedBooking;

          const emailResult = await sendBookingConfirmationEmail(bookingData);

          if (emailResult.success) {
            console.log(
              "✅ Confirmation email sent successfully to:",
              updatedBooking.email
            );
            console.log("📧 Email result:", emailResult.message);
          } else {
            console.error("❌ Failed to send confirmation email");
            console.error("❌ Error:", emailResult.error);
            console.error("❌ Message:", emailResult.message);
          }
        } catch (emailError) {
          console.error("❌ Error sending confirmation email:", emailError);
          console.error(
            "❌ Error details:",
            emailError instanceof Error
              ? emailError.message
              : String(emailError)
          );
          console.error(
            "❌ Stack:",
            emailError instanceof Error ? emailError.stack : "No stack trace"
          );
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
            details:
              updateError instanceof Error
                ? updateError.message
                : "Unknown error",
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
        await BookingService.updateById(bookingId, {
          payment_status: "paid",
        });
        console.log("✅ Async payment succeeded for booking:", bookingId);
      }
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        await BookingService.updateById(bookingId, {
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
