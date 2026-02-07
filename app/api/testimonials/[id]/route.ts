import { NextRequest, NextResponse } from "next/server";
import { TestimonialService } from "@/backend";
import { sendResponse, sendError } from "@/app/lib/api-response";
import { unlink, writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

// Helper to get full URL
const getFullUrl = (imagePath: string, origin: string) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;

  // Only prepend origin for uploaded files to serve them correctly
  if (imagePath.startsWith("/uploads/")) {
    return `${origin}${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  }
  return imagePath;
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const { origin } = new URL(request.url);

    // Extract fields with robust typing
    const name = String(formData.get("name") || "").trim();
    const role = String(formData.get("role") || "").trim();
    const review = String(formData.get("review") || "").trim();
    const ratingStr = String(formData.get("rating") || "");
    const imageField = formData.get("image");
    const imageFile =
      imageField && typeof imageField !== "string"
        ? (imageField as File)
        : null;
    const imageUrlStr =
      imageField && typeof imageField === "string"
        ? (imageField as string)
        : "";

    // 1. Fetch existing testimonial
    const existing = await TestimonialService.getById(id);
    if (!existing) {
      return sendError("Testimonial not found", 404);
    }

    let newImagePath = existing.image; // Default to existing

    // 2a. If client provided an existing URL/string for image, keep or set it
    if (imageUrlStr) {
      // Strip origin if present to store relative path
      let cleanUrl = imageUrlStr;
      if (cleanUrl.startsWith(origin)) {
        cleanUrl = cleanUrl.replace(origin, "");
      }

      // Accept only certain patterns or http(s)
      if (
        cleanUrl.startsWith("/uploads/") ||
        cleanUrl.startsWith("/homepage") ||
        cleanUrl.startsWith("http")
      ) {
        newImagePath = cleanUrl;
      }
    }

    // 2b. Handle Image Upload (if new file provided)
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
      const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
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
        newImagePath = `/uploads/testimonial/${filename}`;

        // Delete old image if it was local and different
        if (
          existing.image &&
          existing.image.startsWith("/uploads/") &&
          existing.image !== newImagePath
        ) {
          const oldAbsolutePath = path.join(
            process.cwd(),
            "public",
            existing.image,
          );
          if (existsSync(oldAbsolutePath)) {
            await unlink(oldAbsolutePath);
          }
        }
      } catch (err) {
        console.error("Error saving file:", err);
        return sendError("Failed to save image file", 500);
      }
    }

    // 3. Prepare Update Data
    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    if (review) updateData.review = review;
    if (ratingStr) {
      const parsed = parseInt(ratingStr);
      if (!Number.isNaN(parsed)) updateData.rating = parsed;
    }
    if (newImagePath) updateData.image = newImagePath;

    // 4. Update DB
    // Basic validation: ensure required fields are not set to empty if provided
    if ("name" in updateData && !updateData.name)
      return sendError("Name cannot be empty", 400);
    if ("role" in updateData && !updateData.role)
      return sendError("Role cannot be empty", 400);
    if ("review" in updateData && !updateData.review)
      return sendError("Review cannot be empty", 400);

    const updated = await TestimonialService.updateById(id, updateData);

    if (!updated) {
      return sendError("Failed to update testimonial", 500);
    }

    // Transform response
    const obj = updated.toObject ? updated.toObject() : updated;
    const responseData = {
      id: obj._id.toString(),
      name: obj.name,
      role: obj.role,
      image: getFullUrl(obj.image, origin),
      rating: obj.rating,
      review: obj.review,
      created_at: obj.createdAt,
      updated_at: obj.updatedAt,
    };

    return sendResponse(responseData, "Testimonial updated successfully");
  } catch (error) {
    console.error("PUT Error:", error);
    return sendError("Failed to update testimonial", 500, error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // 1. Fetch to get image path
    const existing = await TestimonialService.getById(id);
    if (!existing) {
      return sendError("Testimonial not found", 404);
    }

    // 2. Delete file
    const imagePath = existing.image;
    if (imagePath && imagePath.startsWith("/uploads/")) {
      try {
        const absolutePath = path.join(process.cwd(), "public", imagePath);
        if (existsSync(absolutePath)) {
          await unlink(absolutePath);
        }
      } catch (err) {
        console.error("Error deleting image file:", err);
      }
    }

    // 3. Delete from DB (Hard delete to fully remove)
    await TestimonialService.hardDeleteById(id);

    return sendResponse(null, "Testimonial deleted successfully");
  } catch (error) {
    return sendError("Failed to delete testimonial", 500, error);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { origin } = new URL(request.url);
    const testimonial = await TestimonialService.getById(id);

    if (!testimonial) {
      return sendError("Testimonial not found", 404);
    }

    const obj = testimonial.toObject ? testimonial.toObject() : testimonial;
    const responseData = {
      id: obj._id.toString(),
      name: obj.name,
      role: obj.role,
      image: getFullUrl(obj.image, origin),
      rating: obj.rating,
      review: obj.review,
      created_at: obj.createdAt,
      updated_at: obj.updatedAt,
    };

    return sendResponse(responseData, "Testimonial fetched successfully");
  } catch (error) {
    return sendError("Failed to fetch testimonial", 500, error);
  }
}
