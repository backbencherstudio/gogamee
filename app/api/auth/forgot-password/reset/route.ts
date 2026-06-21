import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { connectToDatabase } from "@/backend";
import User from "@/backend/models/User.model";
import { otpService } from "@/backend/services/otp.service";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const { email, otp, newPassword } = payload;

  if (!email || !otp || !newPassword) {
    return sendError("Email, OTP, and new password are required", 400);
  }

  // Verify and burn the OTP
  const isValid = await otpService.verifyOtp(email, otp, "forgot-password");
  if (!isValid) {
    return sendError("Invalid or expired OTP", 400);
  }

  await connectToDatabase();
  const admin = await User.findOne({ email: email.toLowerCase() });
  
  if (!admin) {
    return sendError("User not found", 404);
  }

  // Update the password
  admin.password = newPassword;
  await admin.save();

  return sendResponse(null, "Password reset successfully", undefined, 200);
});
