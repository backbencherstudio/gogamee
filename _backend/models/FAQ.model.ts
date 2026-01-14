import mongoose, { Schema, Document } from "mongoose";

export interface IFAQ extends Document {
  question: string;
  answer: string;
  sortOrder: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "faqs",
  }
);

// Indexes
FAQSchema.index({ sortOrder: 1, createdAt: -1 });
FAQSchema.index({ isActive: 1, deletedAt: 1 });
FAQSchema.index({ category: 1, isActive: 1 });

// Statics method to get active FAQs sorted by order
FAQSchema.statics.getActiveFAQs = function () {
  return this.find({
    isActive: true,
    deletedAt: { $exists: false },
  }).sort({ sortOrder: 1, createdAt: 1 });
};

export default mongoose.models.FAQ || mongoose.model<IFAQ>("FAQ", FAQSchema);
