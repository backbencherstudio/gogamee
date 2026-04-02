import { NextResponse } from "next/server";
import Stripe from "stripe";
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

/**
 * Process a Google Pay payment token via Stripe.
 *
 * Flow:
 * 1. Google Pay (via pay.js) returns a tokenized payment token using
 *    gateway: 'stripe' + your publishable key.
 * 2. This token is a Stripe token (tok_...) that can be used to create
 *    a PaymentMethod.
 * 3. We create a PaymentMethod from the token and confirm the existing
 *    PaymentIntent with it.
 */
export async function POST(request: Request) {
  try {
    const { paymentToken, bookingId, clientSecret } = await request.json();

    if (!paymentToken || !clientSecret) {
      return NextResponse.json(
        { success: false, message: "Missing payment token or client secret" },
        { status: 400 },
      );
    }

    const stripe = getStripeInstance();

    // The Google Pay token from gateway tokenization is a JSON string
    // containing a Stripe token id
    let stripeTokenId: string;
    try {
      const parsed = JSON.parse(paymentToken);
      stripeTokenId = parsed.id; // e.g. "tok_xxx"
    } catch {
      // If it's already a plain token string
      stripeTokenId = paymentToken;
    }

    // Create a PaymentMethod from the Google Pay token
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: stripeTokenId,
      },
    });

    // Extract the PaymentIntent ID from the client secret
    // Client secret format: pi_xxx_secret_yyy
    const paymentIntentId = clientSecret.split("_secret_")[0];

    // Confirm the PaymentIntent with the Google Pay payment method.
    // return_url is required by Stripe when the PaymentIntent has redirect-based
    // payment methods enabled. We also restrict redirects since Google Pay
    // is a non-redirect flow.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethod.id,
      return_url: `${baseUrl}/book`,
    });

    if (
      paymentIntent.status === "succeeded" ||
      paymentIntent.status === "requires_capture"
    ) {
      return NextResponse.json({
        success: true,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
      });
    } else if (paymentIntent.status === "requires_action") {
      // 3D Secure or additional authentication needed
      return NextResponse.json({
        success: false,
        message:
          "Se requiere autenticación adicional. Por favor, utiliza la tarjeta de crédito.",
        requiresAction: true,
        status: paymentIntent.status,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Estado del pago inesperado: ${paymentIntent.status}`,
        status: paymentIntent.status,
      });
    }
  } catch (error: unknown) {
    console.error("Google Pay processing error:", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Error al procesar el pago de Google Pay"),
      },
      { status: 500 },
    );
  }
}
