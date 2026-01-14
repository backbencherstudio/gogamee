import mongoose, { Schema, Document } from "mongoose";

export interface ISocialContact extends Document {
  platform: string;
  url: string;
  icon?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const SocialContactSchema = new Schema<ISocialContact>(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "social_contacts",
  }
);

// Indexes
SocialContactSchema.index({ isActive: 1, order: 1 });
SocialContactSchema.index({ deletedAt: 1 });

// Static method to get active social links sorted by order
SocialContactSchema.statics.getActiveSocialLinks = function () {
  return this.find({
    isActive: true,
    deletedAt: { $exists: false },
  }).sort({ order: 1, createdAt: 1 });
};

export default mongoose.models.SocialContact ||
  mongoose.model<ISocialContact>("SocialContact", SocialContactSchema);
