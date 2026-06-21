import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { connectToDatabase } from "@/backend";
import User from "@/backend/models/User.model";
import { otpService } from "@/backend/services/otp.service";
import { mailService } from "@/backend/services/mail.service";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const { email, type } = payload; // type can be "old" or "new"

  if (!email || !type) {
    return sendError("Email and type are required", 400);
  }

  await connectToDatabase();

  if (type === "old") {
    // For old email, ensure it belongs to an admin
    const admin = await User.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return sendError("Admin account not found for this email", 404);
    }
  } else if (type === "new") {
    // For new email, ensure it's not already in use
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError("This email is already associated with another account", 400);
    }
  }

  const otpType = type === "old" ? "change-email" : "verify-email";
  const otp = await otpService.generateOtp(email, otpType);

  const emailSent = await mailService.sendOtpEmail(email, otp, otpType);
  if (!emailSent) {
    return sendError("Failed to send OTP email. Please try again later.", 500);
  }

  return sendResponse(null, "OTP sent successfully", undefined, 200);
});
