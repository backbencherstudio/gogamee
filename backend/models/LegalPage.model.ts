import mongoose, { Schema, Document } from "mongoose";

export interface ILegalPage extends Document {
  type: "privacy" | "terms" | "cookie";
  title: string;
  content: string;
  version: string;
  isActive: boolean;
  effectiveDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const LegalPageSchema = new Schema<ILegalPage>(
  {
    type: {
      type: String,
      required: true,
      enum: ["privacy", "terms", "cookie"],
      unique: true, // Only one active page per type
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    version: {
      type: String,
      required: true,
      default: "1.0",
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    effectiveDate: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: "legal_pages",
  },
);

// Indexes
LegalPageSchema.index({ type: 1, isActive: 1 });
LegalPageSchema.index({ deletedAt: 1 });

// Static method to get legal page by type
LegalPageSchema.statics.getByType = function (
  type: "privacy" | "terms" | "cookie",
) {
  return this.findOne({
    type,
    isActive: true,
    deletedAt: { $exists: false },
  });
};

// Static method to get all active legal pages
LegalPageSchema.statics.getAllActive = function () {
  return this.find({
    isActive: true,
    deletedAt: { $exists: false },
  }).sort({ type: 1 });
};

// Prevent model compilation errors in development
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.LegalPage;
}

export default mongoose.models.LegalPage ||
  mongoose.model<ILegalPage>("LegalPage", LegalPageSchema);
