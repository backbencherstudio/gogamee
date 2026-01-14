import { NextResponse } from "next/server";
import { TestimonialService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const testimonial = await TestimonialService.create(payload);
    return NextResponse.json(
      { success: true, testimonial },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error: unknown) {
    console.error("Add testimonial error", error);
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to add testimonial"),
      },
      { status: 500 }
    );
  }
}
