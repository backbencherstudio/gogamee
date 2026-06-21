import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { connectToDatabase } from "@/backend";
import User from "@/backend/models/User.model";
import { otpService } from "@/backend/services/otp.service";
import { mailService } from "@/backend/services/mail.service";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const { email } = payload;

  if (!email) {
    return sendError("Email is required", 400);
  }

  await connectToDatabase();
  
  // Find admin user
  const admin = await User.findOne({ email: email.toLowerCase() });
  
  if (!admin) {
    // For security reasons, don't reveal that the user doesn't exist.
    // Just pretend it succeeded.
    return sendResponse(null, "If your email is in our system, you will receive an OTP shortly.", undefined, 200);
  }

  // Generate OTP
  const otp = await otpService.generateOtp(email, "forgot-password");

  // Send Email
  const emailSent = await mailService.sendOtpEmail(email, otp, "forgot-password");
  if (!emailSent) {
    return sendError("Failed to send OTP email. Please try again later.", 500);
  }

  return sendResponse(null, "OTP sent successfully", undefined, 200);
});
