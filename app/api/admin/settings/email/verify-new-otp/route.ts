import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { connectToDatabase } from "@/backend";
import User from "@/backend/models/User.model";
import { otpService } from "@/backend/services/otp.service";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const { currentEmail, oldOtp, newEmail, newOtp } = payload;

  if (!currentEmail || !oldOtp || !newEmail || !newOtp) {
    return sendError("All fields are required", 400);
  }

  // Verify and burn the old OTP
  const isOldValid = await otpService.verifyOtp(currentEmail, oldOtp, "change-email");
  if (!isOldValid) {
    return sendError("Invalid or expired OTP for current email", 400);
  }

  // Verify and burn the new OTP
  const isNewValid = await otpService.verifyOtp(newEmail, newOtp, "verify-email");
  if (!isNewValid) {
    return sendError("Invalid or expired OTP for new email", 400);
  }

  await connectToDatabase();
  const admin = await User.findOne({ email: currentEmail.toLowerCase() });
  
  if (!admin) {
    return sendError("User not found", 404);
  }

  // Ensure new email is not taken
  const existing = await User.findOne({ email: newEmail.toLowerCase() });
  if (existing) {
    return sendError("New email is already in use", 400);
  }

  // Update the email
  admin.email = newEmail.toLowerCase();
  await admin.save();

  return sendResponse(null, "Email updated successfully", undefined, 200);
});
