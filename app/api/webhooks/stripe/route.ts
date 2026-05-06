import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { BookingService } from "@/backend";
import { generateAdminEmailContent } from "@/app/api/mail/send-booking-email";
import { emailQueue } from "@/backend/lib/email-queue";
import { codeService } from "@/backend/services/code.service";
import { transactionService } from "@/backend/services/transaction.service";

async function queueGiftCardUsageEmail(params: {
  giftCode: any;
  redemption: any;
  bookingEmail?: string;
}) {
  const { giftCode, redemption, bookingEmail } = params;
  const recipientEmail =
    giftCode?.recipientEmail || bookingEmail || giftCode?.buyerEmail;
  if (!recipientEmail || !redemption) return;

  const previous = Number(redemption.previousRemainingAmount || 0).toFixed(2);
  const used = Number(redemption.usedAmount || 0).toFixed(2);
  const remaining = Number(redemption.remainingAmount || 0).toFixed(2);
  const bookingRef = redemption.bookingReference || redemption.bookingId || "-";

  await emailQueue.addToQueue({
    to: recipientEmail,
    subject: `Uso de tu tarjeta regalo ${giftCode.code}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; max-width: 640px; margin: 0 auto;">
        <div style="background: #76C043; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">Tu tarjeta regalo se ha utilizado</h2>
        </div>
        <div style="border: 1px solid #e5e7eb; border-top: 0; padding: 20px; border-radius: 0 0 10px 10px;">
          <p><strong>Código:</strong> ${giftCode.code}</p>
          <p><strong>Reserva:</strong> ${bookingRef}</p>
          <p><strong>Balance anterior:</strong> ${previous} EUR</p>
          <p><strong>Importe utilizado:</strong> ${used} EUR</p>
          <p><strong>Balance restante:</strong> ${remaining} EUR</p>
        </div>
      </div>
    `,
    text: `Tarjeta ${giftCode.code} usada. Balance anterior ${previous} EUR, usado ${used} EUR, restante ${remaining} EUR.`,
    from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
    replyTo: process.env.MAIL_FROM ?? process.env.MAIL_USER,
    type: "gift_card",
    bookingId: redemption.bookingId || "",
  });
}

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
    "❌ CRITICAL: STRIPE_WEBHOOK_SECRET is not set or is a placeholder!",
  );
  console.error(
    "❌ Please set the actual webhook secret from Stripe Dashboard in Vercel environment variables",
  );
}

export async function POST(request: NextRequest) {
  try {
    console.log("📥 Webhook received at:", new Date().toISOString());
    console.log("🔑 Webhook secret configured:", webhookSecret ? "YES" : "NO");
    console.log("🔑 Webhook secret length:", webhookSecret.length);
    console.log(
      "🔑 Webhook secret starts with whsec_:",
      webhookSecret.startsWith("whsec_"),
    );

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    console.log("📝 Signature header present:", signature ? "YES" : "NO");
    console.log("📝 Body length:", body.length);

    if (!signature) {
      console.error("❌ No Stripe signature found");
      return NextResponse.json(
        { error: "No signature provided" },
        { status: 400 },
      );
    }

    if (!webhookSecret || webhookSecret.length < 20) {
      console.error("❌ Webhook secret is invalid or too short");
      return NextResponse.json(
        {
          error: "Webhook secret not configured properly",
          details: "STRIPE_WEBHOOK_SECRET must be set in environment variables",
        },
        { status: 500 },
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
        err instanceof Error ? err.message : String(err),
      );
      console.error(
        "❌ Expected secret (first 10 chars):",
        webhookSecret.substring(0, 10) + "...",
      );
      return NextResponse.json(
        {
          error: "Webhook signature verification failed",
          details: err instanceof Error ? err.message : "Unknown error",
          hint: "Check if STRIPE_WEBHOOK_SECRET in Vercel matches the webhook secret in Stripe Dashboard",
        },
        { status: 400 },
      );
    }

    console.log("✅ Webhook event received:", event.type);
    console.log("📋 Event ID:", event.id);

    // Handle PaymentIntent events (Stripe Elements)
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata.booking_id;
      const eventType = paymentIntent.metadata.type;

      if (eventType === "gift_card") {
        const codeId = paymentIntent.metadata.code_id;
        if (codeId) {
          await transactionService.updateByPaymentIntent(paymentIntent.id, {
            status: "paid",
            paidAt: new Date(),
          });
          const giftCode = await codeService.markGiftPaid(
            codeId,
            paymentIntent.id,
          );

          if (giftCode?.recipientEmail) {
            await emailQueue.addToQueue({
              to: giftCode.recipientEmail,
              subject: "Has recibido una tarjeta regalo GoGame",
              html: `
                <div style="font-family: Arial, sans-serif; color: #1f2937; max-width: 640px; margin: 0 auto;">
                  <div style="background: #76C043; color: white; padding: 24px; border-radius: 12px 12px 0 0;">
                    <h1 style="margin: 0;">Has recibido una tarjeta regalo GoGame</h1>
                  </div>
                  <div style="border: 1px solid #e5e7eb; border-top: 0; padding: 24px; border-radius: 0 0 12px 12px;">
                    <p>Para: ${giftCode.recipientName || "ti"}</p>
                    <p>De: ${giftCode.buyerName || "GoGame"}</p>
                    ${giftCode.dedication ? `<p>Mensaje: ${giftCode.dedication}</p>` : ""}
                    <p>Importe: ${Number(giftCode.value || 0).toFixed(2)} EUR</p>
                    <p style="font-size: 22px; font-weight: 700; color: #4a9e2a;">Código regalo: ${giftCode.code}</p>
                    <p>Utiliza este código en tu reserva GoGame en el campo "Código de descuento o regalo".</p>
                  </div>
                </div>
              `,
              text: `Tarjeta regalo GoGame: ${giftCode.code}`,
              from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
              replyTo: giftCode.buyerEmail,
              type: "gift_card",
              bookingId: codeId,
            });
          }

          const adminEmail = process.env.MAIL_TO ?? process.env.MAIL_USER;
          if (adminEmail) {
            await emailQueue.addToQueue({
              to: adminEmail,
              subject: `Gift card purchased: ${giftCode?.code || codeId}`,
              html: `
                <div style="font-family: Arial, sans-serif;">
                  <h2>Gift card purchased</h2>
                  <p>Recipient: ${giftCode?.recipientName || ""} (${giftCode?.recipientEmail || ""})</p>
                  <p>Buyer: ${giftCode?.buyerName || ""} (${giftCode?.buyerEmail || ""})</p>
                  <p>Amount: ${Number(giftCode?.value || 0).toFixed(2)} EUR</p>
                  <p>Code: ${giftCode?.code || ""}</p>
                </div>
              `,
              text: `Gift card purchased: ${giftCode?.code || codeId}`,
              from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
              replyTo: giftCode?.buyerEmail,
              type: "admin_notification",
              bookingId: codeId,
            });
          }
        }

        return NextResponse.json({ received: true });
      }

      console.log("💰 PaymentIntent succeeded for booking:", bookingId);

      if (bookingId) {
        try {
          // Update booking status to confirmed (not pending)
          const updatedBooking = await BookingService.updateById(bookingId, {
            "payment.status": "paid",
            "payment.stripePaymentIntentId": paymentIntent.id,
          });

          if (updatedBooking) {
            console.log("✅ Booking updated:", bookingId);
            await transactionService.updateByPaymentIntent(paymentIntent.id, {
              status: "paid",
              paidAt: new Date(),
            });
            if (paymentIntent.metadata.code_id) {
              const redeemedCode = await codeService.redeem(
                paymentIntent.metadata.code_id,
                Number(paymentIntent.metadata.code_discount || 0),
                {
                  source: "booking",
                  bookingId: bookingId,
                  bookingReference: updatedBooking.bookingReference,
                  note: "Redeemed on successful payment webhook",
                },
              );
              if (redeemedCode?.codeKind === "gift") {
                await queueGiftCardUsageEmail({
                  giftCode: redeemedCode,
                  redemption: redeemedCode._redemption,
                  bookingEmail: updatedBooking.travelers?.primaryContact?.email,
                });
              }
            }
            // Queue admin notification email when payment succeeds
            try {
              const adminEmail = process.env.MAIL_TO ?? process.env.MAIL_USER;
              if (adminEmail) {
                const adminContent = generateAdminEmailContent(updatedBooking);
                await emailQueue.addToQueue({
                  to: adminEmail,
                  subject: adminContent.subject,
                  html: adminContent.htmlContent,
                  text: `New Booking Payment Received #${bookingId}`,
                  from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
                  replyTo: updatedBooking.travelers?.primaryContact?.email,
                  type: "admin_notification",
                  bookingId: bookingId,
                });
                console.log(
                  "📧 Admin notification queued for booking:",
                  bookingId,
                );
              }
            } catch (emailErr) {
              console.error("❌ Failed to queue admin notification:", emailErr);
            }
          }
        } catch (err) {
          console.error("❌ Error updating booking for PaymentIntent:", err);
          return NextResponse.json({ error: "Update failed" }, { status: 500 });
        }
      }
      return NextResponse.json({ received: true });
    }

    // Handle checkout.session.completed event (Legacy)
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      console.log("💳 Payment successful for session:", session.id);
      console.log("📋 Booking ID from metadata:", session.metadata?.booking_id);

      const bookingId = session.metadata?.booking_id;

      if (!bookingId) {
        console.error("❌ No booking_id in session metadata");
        return NextResponse.json(
          { error: "No booking_id found in session metadata" },
          { status: 400 },
        );
      }

      // Update booking status to "confirmed" and payment status to "paid"
      try {
        const updatedBooking = await BookingService.updateById(bookingId, {
          "payment.status": "paid",
        });

        if (!updatedBooking) {
          throw new Error(`Booking not found with ID: ${bookingId}`);
        }

        console.log("✅ Booking updated:", bookingId);

        // Queue admin notification email when checkout payment succeeds
        try {
          const adminEmail = process.env.MAIL_TO ?? process.env.MAIL_USER;
          if (adminEmail) {
            const adminContent = generateAdminEmailContent(updatedBooking);
            await emailQueue.addToQueue({
              to: adminEmail,
              subject: adminContent.subject,
              html: adminContent.htmlContent,
              text: `New Booking Payment Received #${bookingId}`,
              from: process.env.MAIL_FROM ?? process.env.MAIL_USER,
              replyTo: updatedBooking.travelers?.primaryContact?.email,
              type: "admin_notification",
              bookingId: bookingId,
            });
            console.log("📧 Admin notification queued for booking:", bookingId);
          }
        } catch (emailErr) {
          console.error("❌ Failed to queue admin notification:", emailErr);
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
          { status: 500 },
        );
      }
    }

    // Handle other event types if needed
    if (event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        await BookingService.updateById(bookingId, {
          "payment.status": "paid",
        });
        console.log("✅ Async payment succeeded for booking:", bookingId);
      }
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;

      if (bookingId) {
        await BookingService.updateById(bookingId, {
          "payment.status": "failed",
        });
        console.log("❌ Async payment failed for booking:", bookingId);
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await transactionService.updateByPaymentIntent(paymentIntent.id, {
        status: "failed",
      });

      if (paymentIntent.metadata.type === "gift_card" && paymentIntent.metadata.code_id) {
        await codeService.markGiftFailed(paymentIntent.metadata.code_id);
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
      { status: 500 },
    );
  }
}
