import mongoose, { Schema, Document } from "mongoose";

export interface IPackage extends Document {
  sport: string;
  included: string;
  included_es?: string;
  plan: "standard" | "premium" | "combined";
  duration: 1 | 2 | 3 | 4;
  description: string;
  description_es?: string;
  standardPrice?: number;
  premiumPrice?: number;
  currency?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    sport: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    included: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    included_es: {
      type: String,
      trim: true,
    },
    plan: {
      type: String,
      required: true,
      enum: ["standard", "premium", "combined"],
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    description_es: {
      type: String,
      trim: true,
    },
    standardPrice: {
      type: Number,
      min: 0,
    },
    premiumPrice: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: "EUR",
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: "packages",
  },
);

// Compound indexes for better query performance
PackageSchema.index({ sport: 1, included: 1 });
PackageSchema.index({ sport: 1, plan: 1, duration: 1 });
PackageSchema.index({ isActive: 1, sortOrder: 1 });
PackageSchema.index({ createdAt: -1 });

// Unique compound index to prevent duplicate packages
PackageSchema.index(
  { sport: 1, included: 1, plan: 1, duration: 1 },
  { unique: true },
);

// Virtual for price range
PackageSchema.virtual("priceRange").get(function () {
  if (this.standardPrice && this.premiumPrice) {
    return {
      min: Math.min(this.standardPrice, this.premiumPrice),
      max: Math.max(this.standardPrice, this.premiumPrice),
    };
  }
  return null;
});

// Instance method to get formatted price
PackageSchema.methods.getFormattedPrice = function (
  type: "standard" | "premium",
) {
  const price = type === "standard" ? this.standardPrice : this.premiumPrice;
  if (!price) return "Price not set";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: this.currency || "EUR",
  }).format(price);
};

// Static method to find active packages by sport
PackageSchema.statics.findActiveBySport = function (sport: string) {
  return this.find({ sport, isActive: true }).sort({
    sortOrder: 1,
    createdAt: -1,
  });
};

export default mongoose.models.Package ||
  mongoose.model<IPackage>("Package", PackageSchema);
