import { NextRequest } from "next/server";
import { TestimonialService } from "@/backend";
import { sendResponse, sendError, sendPaginatedResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const { testimonials, total } = await TestimonialService.getAll({ limit, page });

  const list = testimonials.map((t: any) => {
    const obj = t.toObject ? t.toObject() : t;
    return {
      id: obj._id?.toString() || obj.id,
      name: obj.name,
      role: obj.role,
      rating: obj.rating,
      review: obj.review,
      created_at: obj.createdAt,
      updated_at: obj.updatedAt,
      deleted_at: obj.deletedAt || null,
    };
  });

  return sendPaginatedResponse(list, total, page, limit, "Testimonials fetched successfully");
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const body = await request.json();
  const { name, role, review } = body;
  const rating = parseInt(String(body?.rating ?? "5")) || 5;

  if (!name || !role || !review) {
    return sendError("Missing required fields", 400);
  }

  const testimonial = await TestimonialService.create({
    name, role, rating, review,
    image: "", source: "manual",
  });

  return sendResponse(testimonial, "Testimonial created successfully");
});
