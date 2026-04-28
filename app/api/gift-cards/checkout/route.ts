import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendError } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { codeService } from "@/backend/services/code.service";
import { transactionService } from "@/backend/services/transaction.service";

function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(secretKey, {
    apiVersion: "2025-12-15.clover",
  });
}

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const amount = Number(payload.amount || 0);

  if (amount < 100 || amount > 2000) {
    return sendError("El importe debe estar entre 100 EUR y 2000 EUR.", 400);
  }

  if (!payload.recipientName || !payload.recipientEmail || !payload.buyerName) {
    return sendError("Faltan datos obligatorios.", 400);
  }

  const giftCode = await codeService.create({
    code: codeService.generateGiftCode(),
    name: `Tarjeta regalo - ${payload.recipientName}`,
    codeKind: "gift",
    discountType: "fixed",
    value: amount,
    initialAmount: amount,
    remainingAmount: amount,
    usageLimit: "multiple",
    isActive: false,
    paymentStatus: "pending",
    recipientName: payload.recipientName,
    recipientEmail: payload.recipientEmail,
    buyerName: payload.buyerName,
    buyerEmail: payload.buyerEmail || payload.recipientEmail,
    dedication: payload.dedication || "",
  });

  const stripe = getStripeInstance();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "eur",
    automatic_payment_methods: { enabled: true },
    receipt_email: payload.buyerEmail || payload.recipientEmail,
    description: "GoGame gift card",
    metadata: {
      type: "gift_card",
      code_id: giftCode._id?.toString() || giftCode.id,
      code: giftCode.code,
    },
  });

  await codeService.update(giftCode._id?.toString() || giftCode.id, {
    stripePaymentIntentId: paymentIntent.id,
  });

  await transactionService.create({
    transactionType: "gift_card",
    referenceId: giftCode._id?.toString() || giftCode.id,
    referenceLabel: giftCode.code,
    amount,
    currency: "eur",
    status: "pending",
    provider: "stripe",
    stripePaymentIntentId: paymentIntent.id,
    customerName: payload.buyerName,
    customerEmail: payload.buyerEmail || payload.recipientEmail,
    description: `Gift card ${giftCode.code}`,
    metadata: {
      recipientName: payload.recipientName,
      recipientEmail: payload.recipientEmail,
    },
  });

  return NextResponse.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    codeId: giftCode._id?.toString() || giftCode.id,
    amount,
  });
});
