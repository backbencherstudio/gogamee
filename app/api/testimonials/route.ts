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
        image: getFullUrl(obj.image), // Convert to full URL only if upload
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

    let name = "";
    let role = "";
    let review = "";
    let rating = 5;
    let imagePath = "";
    let imageFile: File | null = null;

    if (contentType.includes("application/json")) {
      // Accept JSON payloads
      const body = await request.json();
      name = body?.name ?? "";
      role = body?.role ?? "";
      review = body?.review ?? "";
      rating = parseInt(String(body?.rating ?? "5"));
      if (Number.isNaN(rating)) rating = 5;

      const rawImage = body?.image;
      if (typeof rawImage === "string") {
        const imageStr = rawImage;
        if (
          imageStr &&
          (imageStr.startsWith("/homepage") ||
            imageStr.startsWith("/uploads/") ||
            imageStr.startsWith("http"))
        ) {
          imagePath = imageStr;
        }
      }
      // No file upload support via JSON in this endpoint; expect URL/string for image
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      // Accept form submissions and file uploads
      const formData = await request.formData();
      name = String(formData.get("name") || "");
      role = String(formData.get("role") || "");
      review = String(formData.get("review") || "");
      rating = parseInt(String(formData.get("rating") || "5"));
      if (Number.isNaN(rating)) rating = 5;

      const maybeImage = formData.get("image");
      if (maybeImage && typeof maybeImage !== "string") {
        imageFile = maybeImage as File;
      } else {
        const imageStr = (maybeImage as string) || "";
        if (
          imageStr &&
          (imageStr.startsWith("/homepage") ||
            imageStr.startsWith("/uploads/") ||
            imageStr.startsWith("http"))
        ) {
          imagePath = imageStr;
        }
      }
    } else {
      return sendError("Unsupported Content-Type", 415);
    }

    // Validate required fields (image is optional)
    if (!name || !role || !review || !rating) {
      return sendError("Missing required fields", 400);
    }

    // Ensure rating is a valid number
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      return sendError("Rating must be a number between 1 and 5", 400);
    }

    // Handle Image Upload (when a file is provided)
    if (imageFile && imageFile.size > 0) {
      // Validate file
      if (imageFile.size > 5 * 1024 * 1024) {
        return sendError("File size too large (max 5MB)", 400);
      }
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(imageFile.type)) {
        return sendError(
          "Invalid file type. Only JPEG, PNG, WebP allowed",
          400,
        );
      }

      // Generate filename and save
      const timestamp = Date.now();
      const fileExtension = imageFile.name.split(".").pop() || "jpg";
      const filename = `${timestamp}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExtension}`;
      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "testimonial",
      );

      try {
        await mkdir(uploadDir, { recursive: true });
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        imagePath = `/uploads/testimonial/${filename}`;
      } catch (err) {
        console.error("Error saving file:", err);
        return sendError("Failed to save image file", 500);
      }
    } else if (!imagePath) {
      // No image provided; make it optional. Use empty string to indicate absence.
      imagePath = "";
    }

    const testimonial = await TestimonialService.create({
      name,
      role,
      image: imagePath,
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
