import mongoose, { Schema, Document } from "mongoose";

export interface IStartingPrice extends Document {
  type: "football" | "basketball" | "combined";
  currency: string;
  category: string;
  standardDescription: string;
  premiumDescription: string;
  pricesByDuration: {
    "1": { standard: number; premium: number };
    "2": { standard: number; premium: number };
    "3": { standard: number; premium: number };
    "4": { standard: number; premium: number };
  };
  isActive: boolean;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DurationPriceSchema = new Schema(
  {
    standard: { type: Number, required: true, min: 0 },
    premium: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const StartingPriceSchema = new Schema<IStartingPrice>(
  {
    type: {
      type: String,
      required: true,
      enum: ["football", "basketball", "combined"],
      unique: true,
    },
    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "EUR",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    standardDescription: {
      type: String,
      required: true,
      trim: true,
    },
    premiumDescription: {
      type: String,
      required: true,
      trim: true,
    },
    pricesByDuration: {
      "1": DurationPriceSchema,
      "2": DurationPriceSchema,
      "3": DurationPriceSchema,
      "4": DurationPriceSchema,
    },
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
    collection: "startingPrices",
  }
);

// Indexes
StartingPriceSchema.index({ type: 1 }, { unique: true });
StartingPriceSchema.index({ isActive: 1 });
StartingPriceSchema.index({ updatedAt: -1 });

// Pre-save middleware to update lastModifiedBy
StartingPriceSchema.pre("save", function (next) {
  if (this.isModified() && this.lastModifiedBy) {
    // Could be enhanced to get current user from context
    console.log(`StartingPrice ${this.type} modified`);
  }
  next();
});

// Virtual for minimum price across all durations
StartingPriceSchema.virtual("minPrice").get(function () {
  const prices = Object.values(this.pricesByDuration);
  const allPrices = prices.flatMap((duration) => [
    duration.standard,
    duration.premium,
  ]);
  return Math.min(...allPrices);
});

// Virtual for maximum price across all durations
StartingPriceSchema.virtual("maxPrice").get(function () {
  const prices = Object.values(this.pricesByDuration);
  const allPrices = prices.flatMap((duration) => [
    duration.standard,
    duration.premium,
  ]);
  return Math.max(...allPrices);
});

// Instance method to get price for specific duration and type
StartingPriceSchema.methods.getPrice = function (
  duration: 1 | 2 | 3 | 4,
  type: "standard" | "premium"
) {
  const durationPrices =
    this.pricesByDuration[
      duration.toString() as keyof typeof this.pricesByDuration
    ];
  return durationPrices ? durationPrices[type] : null;
};

// Instance method to get formatted price
StartingPriceSchema.methods.getFormattedPrice = function (
  duration: 1 | 2 | 3 | 4,
  type: "standard" | "premium"
) {
  const price = this.getPrice(duration, type);
  if (!price) return "Price not set";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: this.currency,
  }).format(price);
};

// Static method to get all active starting prices
StartingPriceSchema.statics.getActivePrices = function () {
  return this.find({ isActive: true }).sort({ type: 1 });
};

// Static method to get price by sport type
StartingPriceSchema.statics.getByType = function (type: string) {
  return this.findOne({ type, isActive: true });
};

export default mongoose.models.StartingPrice ||
  mongoose.model<IStartingPrice>("StartingPrice", StartingPriceSchema);
