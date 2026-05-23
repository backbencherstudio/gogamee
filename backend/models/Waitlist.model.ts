import mongoose, { Schema, Document } from "mongoose";

export interface IWaitlist extends Document {
  email: string;
  name?: string;
  source: string;
  subscribedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WaitlistSchema = new Schema<IWaitlist>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      default: "coming-soon-page",
      trim: true,
    },
    subscribedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    timestamps: true,
    collection: "waitlists",
  },
);

WaitlistSchema.index({ subscribedAt: -1 });

export default mongoose.models.Waitlist ||
  mongoose.model<IWaitlist>("Waitlist", WaitlistSchema);
