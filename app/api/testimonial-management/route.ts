import { NextResponse } from "next/server";
import { TestimonialService } from "@/_backend";
import { toErrorMessage } from "@/_backend/lib/errors";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const { testimonials } = await TestimonialService.getAll({
      filters: { isActive: true },
      limit: 1000,
    });

    // Mapped to match legacy response format
    // Mapped to match legacy response format
    // Mapped to match legacy response format
    const mappedTestimonials = testimonials.map((t: any) => {
      const obj = t.toObject();
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

    return NextResponse.json(
      {
        success: true,
        message: "Testimonials fetched successfully",
        list: mappedTestimonials,
        totalCount: testimonials.length,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: toErrorMessage(error, "Failed to fetch testimonials"),
      },
      { status: 500 }
    );
  }
}
