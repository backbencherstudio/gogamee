import { connectToDatabase } from "@/backend";
import Otp from "@/backend/models/Otp.model";

class OtpService {
  // Generate a random 6-digit string
  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generates a new OTP for the given email and type.
   * Invalidates any previous unused OTPs for the same email and type.
   */
  async generateOtp(email: string, type: "forgot-password" | "change-email" | "verify-email"): Promise<string> {
    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    // Delete any previous unused OTPs for the same email and type
    await Otp.deleteMany({ email: normalizedEmail, type });

    const otpCode = this.generateSixDigitCode();
    // Expiration time: 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const newOtp = new Otp({
      email: normalizedEmail,
      otp: otpCode,
      type,
      expiresAt,
    });

    await newOtp.save();
    return otpCode;
  }

  /**
   * Verifies if an OTP is valid and not expired.
   * If valid, it deletes the OTP from the database so it cannot be reused.
   */
  async verifyOtp(email: string, otpCode: string, type: "forgot-password" | "change-email" | "verify-email"): Promise<boolean> {
    await connectToDatabase();
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOneAndDelete({
      email: normalizedEmail,
      otp: otpCode,
      type,
      expiresAt: { $gt: new Date() }, // Must not be expired
    });

    if (!otpRecord) {
      return false;
    }

    return true;
  }
}

export const otpService = new OtpService();
