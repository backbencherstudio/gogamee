import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Google Pay is processed client-side through the Stripe Payment Element.
 * This endpoint exists to satisfy Next.js route type validation.
 * Direct server-side calls to this route are not supported.
 */
export async function POST() {
  return NextResponse.json(
    {
      message:
        "Google Pay is handled client-side via Stripe. Use the /api/payment/stripe endpoint.",
    },
    { status: 501 },
  );
}
