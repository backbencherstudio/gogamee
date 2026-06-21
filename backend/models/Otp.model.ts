import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  type: "forgot-password" | "change-email" | "verify-email";
  expiresAt: Date;
  createdAt: Date;
  isUsed: boolean;
}

const OtpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["forgot-password", "change-email", "verify-email"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete documents after expiration using a TTL index
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OtpSchema.index({ email: 1, type: 1 });

export default mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
