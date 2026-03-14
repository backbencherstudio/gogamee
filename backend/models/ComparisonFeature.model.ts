import mongoose, { Schema, Document } from "mongoose";

export interface IComparisonFeature extends Document {
  type: "football" | "basketball" | "combined";
  features: {
    category: string;
    standard: string;
    premium: string;
    sortOrder: number;
  }[];
  isActive: boolean;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeatureSchema = new Schema(
  {
    category: { type: String, required: true },
    standard: { type: String, required: true },
    premium: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false },
);

const ComparisonFeatureSchema = new Schema<IComparisonFeature>(
  {
    type: {
      type: String,
      required: true,
      enum: ["football", "basketball", "combined"],
      unique: true,
    },
    features: [FeatureSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastModifiedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "comparison_features",
  },
);

// Indexes
ComparisonFeatureSchema.index({ type: 1 });
ComparisonFeatureSchema.index({ isActive: 1 });

export default mongoose.models.ComparisonFeature ||
  mongoose.model<IComparisonFeature>("ComparisonFeature", ComparisonFeatureSchema);
