import mongoose, { Schema, Document } from "mongoose";

export interface IFeature {
  category: string;
  standard: string | boolean;
  premium: string | boolean;
  sortOrder: number;
}

export interface IComparisonFeature extends Document {
  type: string; // e.g., "football", "basketball", "combined"
  features: IFeature[];
  isActive: boolean;
  deletedAt?: Date;
}

const FeatureSchema = new Schema({
  category: { type: String, required: true },
  standard: { type: Schema.Types.Mixed, required: true },
  premium: { type: Schema.Types.Mixed, required: true },
  sortOrder: { type: Number, default: 0 },
}, { _id: false });

const ComparisonFeatureSchema = new Schema<IComparisonFeature>({
  type: { type: String, required: true, unique: true, index: true },
  features: [FeatureSchema],
  isActive: { type: Boolean, default: true },
  deletedAt: Date,
}, { timestamps: true });

// Fix for Next.js hot-reloading: delete model if it exists to apply new schema
if (mongoose.models.ComparisonFeature) {
  delete (mongoose.models as any).ComparisonFeature;
}

export default mongoose.model<IComparisonFeature>("ComparisonFeature", ComparisonFeatureSchema);
