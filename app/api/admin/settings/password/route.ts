import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import User from "@/backend/models/User.model";
import { connectToDatabase } from "@/backend";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const { currentPassword, newPassword, email } = payload;

  if (!currentPassword || !newPassword || !email) {
    return sendError("Current password, new password, and email are required", 400);
  }

  await connectToDatabase();
  
  // Find admin user
  const admin = await User.findOne({ email: email.toLowerCase() });
  
  if (!admin) {
    return sendError("Admin not found", 404);
  }

  // Check current password
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return sendError("Incorrect current password", 400);
  }

  // Update password
  admin.password = newPassword;
  await admin.save();

  return sendResponse(null, "Password updated successfully", undefined, 200);
});
