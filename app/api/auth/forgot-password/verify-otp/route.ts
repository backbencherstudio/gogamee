import { NextRequest } from "next/server";
import { sendError, sendResponse } from "@/app/lib/api-response";
import { withErrorHandling } from "@/app/lib/api-wrapper";
import { connectToDatabase } from "@/backend";
import Otp from "@/backend/models/Otp.model";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const payload = await request.json();
  const { email, otp } = payload;

  if (!email || !otp) {
    return sendError("Email and OTP are required", 400);
  }

  await connectToDatabase();
  const otpRecord = await Otp.findOne({
    email: email.toLowerCase().trim(),
    otp: otp,
    type: "forgot-password",
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    return sendError("Invalid or expired OTP", 400);
  }

  return sendResponse(null, "OTP is valid", undefined, 200);
});
