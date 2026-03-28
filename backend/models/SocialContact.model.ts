import mongoose, { Schema, Document } from "mongoose";

export interface ISocialContact extends Document {
  platform: string;
  url: string;
  icon?: string;
  isActive: boolean;
}

const SocialContactSchema = new Schema<ISocialContact>({
  platform: { type: String, required: true },
  url: { type: String, required: true },
  icon: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.SocialContact || mongoose.model<ISocialContact>("SocialContact", SocialContactSchema);
