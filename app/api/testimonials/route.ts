import { NextRequest } from "next/server";
import { TestimonialService } from "@/backend";
import {
  sendResponse,
  sendError,
  sendPaginatedResponse,
} from "@/app/lib/api-response";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const { testimonials, total } = await TestimonialService.getAll({
      limit,
      page,
    });

    const list = testimonials.map((t: any) => {
      const obj = t.toObject ? t.toObject() : t;
      return {
        id: obj._id.toString(),
        name: obj.name,
        role: obj.role,
        image: obj.image,
        rating: obj.rating,
        review: obj.review,
        created_at: obj.createdAt,
        updated_at: obj.updatedAt,
        deleted_at: obj.deletedAt || null,
      };
    });

    return sendPaginatedResponse(
      list,
      total,
      page,
      limit,
      "Testimonials fetched successfully",
    );
  } catch (error) {
    return sendError("Failed to fetch testimonials", 500, error);
  }
}
