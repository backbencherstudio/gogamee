import { NextRequest } from "next/server";
import { sendResponse, sendError } from "@/app/lib/api-response";

const users: Array<{ id: string; name: string; email: string }> = [];

export async function GET(request: NextRequest) {
  try {
    const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1");
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "10");

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return sendResponse(paginatedUsers, "Users fetched successfully", {
      page,
      limit,
      total: users.length,
      total_pages: Math.ceil(users.length / limit),
    });
  } catch (error) {
    return sendError("Failed to fetch users", 500, error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const user = {
      id: `user-${Date.now()}`,
      name: payload.name,
      email: payload.email,
    };
    users.push(user);
    // Return standard response for creation too (data = user)
    return sendResponse(user, "User created successfully", undefined, 201);
  } catch (error) {
    return sendError("Failed to create user", 500, error);
  }
}
