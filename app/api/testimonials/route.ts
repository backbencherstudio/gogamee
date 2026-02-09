import { NextRequest, NextResponse } from "next/server";
import { TestimonialService } from "@/backend";
import {
  sendResponse,
  sendError,
  sendPaginatedResponse,
} from "@/app/lib/api-response";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const { testimonials, total } = await TestimonialService.getAll({
      limit,
      page,
    });

    const getFullUrl = (p: string) => {
      if (!p) return "";
      if (p.startsWith("http")) return p;
      // Only prepend origin for uploaded files to serve them correctly
      if (p.startsWith("/uploads/")) {
        return `${origin}${p.startsWith("/") ? "" : "/"}${p}`;
      }
      return p;
    };

    const list = testimonials.map((t: any) => {
      const obj = t.toObject ? t.toObject() : t;
      return {
        id: obj._id.toString(),
        name: obj.name,
        role: obj.role,
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
    console.error("GET Error:", error);
    return sendError("Failed to fetch testimonials", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return sendError("Unsupported Content-Type. Use application/json", 415);
    }

    const body = await request.json();
    const name = body?.name ?? "";
    const role = body?.role ?? "";
    const review = body?.review ?? "";
    let rating = parseInt(String(body?.rating ?? "5"));

    if (Number.isNaN(rating)) rating = 5;

    // Validate required fields
    if (!name || !role || !review || !rating) {
      return sendError("Missing required fields", 400);
    }

    // Ensure rating is a valid number
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      return sendError("Rating must be a number between 1 and 5", 400);
    }

    const testimonial = await TestimonialService.create({
      name,
      role,
      image: "", // Image is no longer used, passing empty string
      rating,
      review,
      source: "manual",
    });

    return sendResponse(testimonial, "Testimonial created successfully");
  } catch (error) {
    console.error("POST Error:", error);
    return sendError("Failed to create testimonial", 500, error);
  }
}
