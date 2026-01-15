import { NextResponse } from "next/server";
import { TestimonialService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: Request) {
  const payload = await request.json();
  try {
    const testimonial = await TestimonialService.create(payload);
    const testimonialData = testimonial.toObject();
    const responseData = {
      id: testimonialData._id.toString(),
      name: testimonialData.name,
      role: testimonialData.role,
      image: testimonialData.image,
      rating: testimonialData.rating,
      review: testimonialData.review,
      created_at: testimonialData.createdAt,
      updated_at: testimonialData.updatedAt,
      deleted_at: testimonialData.deletedAt || null,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Testimonial created successfully",
        data: responseData,
      },
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
